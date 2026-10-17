// Builds src/data/gloss.ts — word-by-word English meanings for every sentence in the app.
// Source dictionary: JMdict (EDRDG, CC BY-SA 4.0) via scriptin/jmdict-simplified.
// Run: JMDICT=/tmp/jm/jmdict.json npx tsx scripts/build-gloss.ts
import fs from "node:fs";
import path from "node:path";
import { units } from "../src/data";
import { readingSets } from "../src/data/reading";
import { listeningSets } from "../src/data/listening";

const kuromoji = require("kuromoji");
const { toHiragana } = require("wanakana");

interface JmKanji { common: boolean; text: string }
interface JmKana { common: boolean; text: string; appliesToKanji: string[] }
interface JmSense { partOfSpeech: string[]; gloss: { text: string }[] }
interface JmWord { id: string; kanji: JmKanji[]; kana: JmKana[]; sense: JmSense[] }

const dict = JSON.parse(fs.readFileSync(process.env.JMDICT ?? "/tmp/jm/jmdict.json", "utf8")) as { words: JmWord[] };
const index = new Map<string, JmWord[]>();
const add = (k: string, w: JmWord) => {
  const a = index.get(k);
  if (a) a.push(w);
  else index.set(k, [w]);
};
for (const w of dict.words) {
  for (const k of w.kanji) add(k.text, w);
  for (const k of w.kana) add(k.text, w);
}

const POS_MAP: Record<string, (p: string) => boolean> = {
  名詞: (p) => p === "n" || p.startsWith("n-") || p === "pn" || p.startsWith("adj-na") || p === "vs",
  動詞: (p) => p.startsWith("v"),
  形容詞: (p) => p === "adj-i" || p === "adj-ix",
  副詞: (p) => p === "adv" || p === "adv-to",
  連体詞: (p) => p === "adj-pn",
  接続詞: (p) => p === "conj",
  感動詞: (p) => p === "int",
};

function pick(key: string, pos: string): JmWord | null {
  const cands = index.get(key);
  if (!cands) return null;
  const okPos = POS_MAP[pos] ?? (() => false);
  let best: { w: JmWord; s: number } | null = null;
  for (const w of cands) {
    let s = 0;
    const kanjiHit = w.kanji.find((k) => k.text === key);
    const kanaHit = w.kana.find((k) => k.text === key);
    if ((kanjiHit && kanjiHit.common) || (kanaHit && kanaHit.common)) s += 4;
    if (w.kanji.some((k) => k.common) || w.kana.some((k) => k.common)) s += 1;
    if (w.sense[0]?.partOfSpeech.some(okPos)) s += 3;
    else if (w.sense.some((x) => x.partOfSpeech.some(okPos))) s += 1;
    if (kanjiHit) s += 1;
    if (!best || s > best.s) best = { w, s };
  }
  return best ? best.w : null;
}

function readingFor(w: JmWord, key: string): string {
  const withKanji = w.kana.filter((k) => k.appliesToKanji.includes("*") || k.appliesToKanji.includes(key) || w.kanji.length === 0);
  const pool = withKanji.length ? withKanji : w.kana;
  const c = pool.find((k) => k.common) ?? pool[0];
  return toHiragana(c.text, { convertLongVowelMark: false });
}

function glossFor(w: JmWord, pos: string): string {
  const okPos = POS_MAP[pos] ?? (() => false);
  const sense = w.sense.find((s) => s.partOfSpeech.some(okPos)) ?? w.sense[0];
  const parts = sense.gloss.slice(0, 3).map((g) => g.text.replace(/\s*\(.*?\)\s*/g, " ").trim()).filter(Boolean);
  let txt = parts.join("; ");
  if (txt.length > 46) txt = parts.slice(0, 2).join("; ");
  if (txt.length > 46) txt = parts[0];
  return txt.slice(0, 60);
}

(async () => {
const tk: any = await new Promise((res, rej) =>
  kuromoji.builder({ dicPath: path.join(process.cwd(), "node_modules", "kuromoji", "dict") }).build((e: Error | null, t: unknown) => (e ? rej(e) : res(t))),
);

const sentences = new Set<string>();
for (const u of units) {
  for (const g of u.grammar) {
    g.examples.forEach(([jp]) => sentences.add(jp));
    g.speaking.forEach(([, jp]) => sentences.add(jp));
  }
  u.review.forEach(([, jp]) => sentences.add(jp));
}
for (const s of readingSets) s.passage.forEach((p) => sentences.add(p));
for (const s of listeningSets) s.script.forEach(([, t]) => sentences.add(t));

// kuromoji basic forms that map to the wrong word in this app's context
const KEY_FIX: Record<string, string> = { 間: "間", 辛い: "辛い" };
const SKIP_KEYS = new Set(["する", "なる", "れる", "られる", "せる", "させる", "いる", "ある", "ない", "です", "ます", "だ", "の", "こと", "もの", "よう", "ため", "ん", "それ", "これ", "あれ", "ここ", "そこ"]);
const SKIP_DETAIL = new Set(["非自立", "接尾", "数", "特殊", "接続助詞", "副助詞"]);

const OVERRIDE: Record<string, [string, string]> = {
  開く: ["あく", "to open (by itself); to be open"],
  入る: ["はいる", "to enter; to go in"],
  間: ["あいだ", "while; during; between; interval"],
  辛い: ["からい", "spicy; hot"],
  何: ["なに", "what"],
  今: ["いま", "now; the present"],
  後: ["あと", "after; later; behind"],
  他: ["ほか", "other; another; else"],
  一人: ["ひとり", "one person; alone"],
  二人: ["ふたり", "two people"],
  日本: ["にほん", "Japan"],
  行う: ["おこなう", "to do; to carry out; to hold (an event)"],
  上手: ["じょうず", "skillful; good at"],
  方: ["かた", "way of; person (polite); direction"],
  本: ["ほん", "book"],
  前: ["まえ", "before; in front; ago"],
  みんな: ["みんな", "everyone; all"],
  背: ["せ", "height; back (of the body)"],
  字: ["じ", "character; letter; handwriting"],
  人前: ["ひとまえ", "in front of others; in public"],
  勝: ["かち", "victory; win"],
  市場: ["しじょう", "market; marketplace"],
  上野: ["うえの", "Ueno (place name)"],
  上野公園: ["うえのこうえん", "Ueno Park (Tokyo)"],
  あ: ["あ", "oh; ah"],
  市: ["し", "city"],
  プリンター: ["ぷりんたー", "printer"],
  田中: ["たなか", "Tanaka (surname)"],
  山田: ["やまだ", "Yamada (surname)"],
  佐藤: ["さとう", "Sato (surname)"],
  新宿: ["しんじゅく", "Shinjuku (Tokyo district)"],
  お客: ["おきゃく", "customer; guest"],
  角: ["かど", "corner"],
  弾く: ["ひく", "to play (guitar, piano, other stringed instruments)"],
};
// potential forms (泳げる, 書ける…) are not separate dictionary entries: map back to the base verb
const POT: [string, string][] = [["げる", "ぐ"], ["ける", "く"], ["える", "う"], ["せる", "す"], ["てる", "つ"], ["べる", "ぶ"], ["める", "む"], ["ねる", "ぬ"], ["れる", "る"]];
function potentialOf(key: string): [string, string] | null {
  for (const [end, base] of POT) {
    if (!key.endsWith(end) || key.length < 2) continue;
    const stem = key.slice(0, -end.length) + base;
    const w = pick(stem, "動詞");
    if (!w) continue;
    const r = readingFor(w, stem);
    const baseEnd = r.slice(-1);
    const hit = POT.find(([, b]) => b === baseEnd);
    const rd = hit ? r.slice(0, -1) + hit[0] : r;
    return [rd, "can " + glossFor(w, "動詞").replace(/^to /, "").split(";")[0] + " (potential of " + stem + ")"];
  }
  return null;
}
const GLOSS: Record<string, [string, string]> = {};
const KURO_READ: Record<string, string> = {};
const SEGMENTS: Record<string, [string, string][]> = {};
const missing = new Map<string, number>();

for (const jp of sentences) {
  const segs: [string, string][] = [];
  for (const t of tk.tokenize(jp)) {
    const surface: string = t.surface_form;
    const pos: string = t.pos;
    let key = t.basic_form && t.basic_form !== "*" ? t.basic_form : surface;
    key = KEY_FIX[key] ?? key;
    const content = pos in POS_MAP && !SKIP_DETAIL.has(t.pos_detail_1) && !SKIP_KEYS.has(key) && !/^[A-Za-z0-9０-９]+$/.test(surface);
    if (!content) {
      segs.push([surface, ""]);
      continue;
    }
    if (!(key in GLOSS)) {
      if (OVERRIDE[key]) GLOSS[key] = OVERRIDE[key];
      else {
        const w = pick(key, pos);
        if (w) GLOSS[key] = [readingFor(w, key), glossFor(w, pos)];
        else if (pos === "動詞") {
          const pot = potentialOf(key);
          if (pot) GLOSS[key] = pot;
        }
      }
      if (key in GLOSS && pos !== "動詞" && pos !== "形容詞" && t.reading && t.reading !== "*" && surface === key) KURO_READ[key] = toHiragana(t.reading, { convertLongVowelMark: false });
    }
    if (key in GLOSS) segs.push([surface, key]);
    else {
      segs.push([surface, ""]);
      missing.set(key, (missing.get(key) ?? 0) + 1);
    }
  }
  SEGMENTS[jp] = segs;
}

const header = `// AUTO-GENERATED by scripts/build-gloss.ts — do not edit by hand.
// English meanings: JMdict © Electronic Dictionary Research and Development Group, licensed CC BY-SA 4.0 (https://www.edrdg.org/edrdg/licence.html).
// Meanings are the dictionary's first sense for the matching part of speech — a guide, the sentence context decides the exact nuance.
`;
const body = `export const GLOSS: Record<string, [string, string]> = ${JSON.stringify(GLOSS)};\n\nexport const SEGMENTS: Record<string, [string, string][]> = ${JSON.stringify(SEGMENTS)};\n`;
fs.writeFileSync("src/data/gloss.ts", header + body);
const kb = (fs.statSync("src/data/gloss.ts").size / 1024).toFixed(0);
console.log(`sentences: ${sentences.size} · distinct words glossed: ${Object.keys(GLOSS).length} · file ${kb} KB`);
// verbs/adjectives whose dictionary has several readings: show the choice so it can be reviewed
const ambiguous: string[] = [];
for (const k of Object.keys(GLOSS)) {
  if (OVERRIDE[k]) continue;
  const cands = (index.get(k) ?? []).filter((w) => w.kanji.some((x) => x.text === k));
  const reads = [...new Set(cands.map((w) => readingFor(w, k)))];
  if (reads.length > 1) ambiguous.push(`${k}: chose ${GLOSS[k][0]} (“${GLOSS[k][1].slice(0, 24)}”) | other readings: ${reads.filter((r) => r !== GLOSS[k][0]).join(", ")}`);
}
console.log("homographs where the dictionary has several readings (" + ambiguous.length + "):\n  " + ambiguous.join("\n  "));
const flagged = Object.entries(KURO_READ).filter(([k, kr]) => GLOSS[k][0] !== kr && !OVERRIDE[k]).map(([k, kr]) => `${k}: gloss=${GLOSS[k][0]} / kuromoji=${kr}`);
console.log("reading differs between JMdict pick and kuromoji (" + flagged.length + "):\n  " + flagged.join("\n  "));
console.log("words without an entry (" + missing.size + "):", [...missing.entries()].sort((a, b) => b[1] - a[1]).slice(0, 40).map(([k, n]) => `${k}×${n}`).join(" "));
})();
