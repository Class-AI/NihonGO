// Compares every hand-written hiragana reading with the kuromoji (IPADIC) dictionary reading.
// Run: npx tsx scripts/verify-readings.ts   (prints mismatches for manual review)
import path from "node:path";
import kuromoji from "kuromoji";
import { toHiragana, toRomaji } from "wanakana";
import { units } from "../src/data";
import { readingSets } from "../src/data/reading";
import { listeningSets } from "../src/data/listening";

const clean = (s: string) => toHiragana(s, { passRomaji: true }).replace(/[\s、。，．,.!?！？「」『』・（）()〜~\u3000※：]/g, "");
// compare phonetically: long vowels written あー / ああ / おう / おお are treated the same
const strip = (s: string) => toRomaji(clean(s)).replace(/ou|oo/g, "o").replace(/ei|ee/g, "e").replace(/aa/g, "a").replace(/ii/g, "i").replace(/uu/g, "u").replace(/-/g, "");
const IGNORE = /[A-Za-z0-9０-９]/;

kuromoji.builder({ dicPath: path.join(process.cwd(), "node_modules", "kuromoji", "dict") }).build((err, tk) => {
  if (err) throw err;
  const rows: [string, string, string][] = []; // where, jp, reading
  for (const u of units) {
    for (const g of u.grammar) {
      g.examples.forEach(([jp, r], i) => rows.push([`${g.id} ex${i + 1}`, jp, r]));
      g.speaking.forEach(([, jp, r], i) => rows.push([`${g.id} sp${i + 1}`, jp, r]));
    }
    u.review.forEach(([, jp, r], i) => rows.push([`unit${u.id} rev${i + 1}`, jp, r]));
  }
  for (const s of readingSets) s.passage.forEach((p, i) => rows.push([`${s.id} p${i + 1}`, p, s.reading[i] ?? ""]));
  for (const s of listeningSets) s.script.forEach(([, t], i) => rows.push([`${s.id} l${i + 1}`, t, s.reading[i] ?? ""]));

  let checked = 0, bad = 0;
  for (const [where, jp, reading] of rows) {
    if (IGNORE.test(jp)) continue;
    const plain = reading.replace(/^(きゃく|てんいん)「/, "").replace(/」$/, ""); // some listening readings carry a speaker label
    const kuro = strip(tk.tokenize(jp).map((t) => (t.reading && t.reading !== "*" ? t.reading : t.surface_form)).join(""));
    const mine = strip(plain);
    checked++;
    if (kuro !== mine) {
      bad++;
      let a = 0; while (a < mine.length && a < kuro.length && mine[a] === kuro[a]) a++;
      let b = 0; while (b < mine.length - a && b < kuro.length - a && mine[mine.length - 1 - b] === kuro[kuro.length - 1 - b]) b++;
      console.log(`✗ ${where.padEnd(14)} …${mine.slice(Math.max(0, a - 6), mine.length - b + 3)}  ≠dict  …${kuro.slice(Math.max(0, a - 6), kuro.length - b + 3)}   [${jp.slice(0, 26)}]`);
    }
  }
  console.log(`\nchecked ${checked} sentences — ${bad} reading mismatch(es)`);
});
