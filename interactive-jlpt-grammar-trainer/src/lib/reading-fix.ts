// Hiragana readings from kuromoji tokens, with the corrections the IPADIC dictionary needs for everyday learner sentences.
// NOTE: scripts/gen-units.mjs contains the same rules (keep both in sync) — it builds the stored model-answer readings.
import { toHiragana } from "wanakana";

export interface Tok {
  surface_form: string;
  reading?: string;
  basic_form?: string;
  pos: string;
  pos_detail_1?: string;
}

const KATAKANA = /^[\u30A0-\u30FFー]+$/;
const ATTACH_POS = new Set(["助詞", "助動詞", "記号"]);

function fixReading(tokens: Tok[], i: number, r: string): string {
  const t = tokens[i];
  const s = t.surface_form;
  const prev = tokens[i - 1]?.surface_form ?? "";
  const next = tokens[i + 1]?.surface_form ?? "";
  if (s === "間") return "アイダ"; // 〜ている間に (not ま)
  if (s === "一人") return "ヒトリ";
  if (s === "二人") return "フタリ";
  if (s === "一" && next === "人") return "ヒト";
  if (s === "二" && next === "人") return "フタ";
  if (s === "人" && (prev === "一" || prev === "二")) return "リ";
  if (s === "一晩") return "ヒトバン";
  if (s === "一晩中") return "ヒトバンジュウ";
  if (s === "一" && next.startsWith("晩")) return "ヒト";
  if (s === "夜" && next.startsWith("更")) return "ヨ";
  if (s === "日本") return "ニホン";
  if (s === "日本人") return "ニホンジン";
  if (s === "辛い") return "カライ";
  if (s === "辛") return "カラ";
  if (s === "他") return "ホカ";
  if (s === "後" && !/^[ごゴ]/.test(r)) return "アト";
  if (s === "今" && !/^[日回度年月週朝夜晩後]/.test(next)) return "イマ";
  if (s === "十分" && next.startsWith("おき")) return "ジュップン";
  if (s === "中" && /[日晩年週夜朝]$/.test(prev)) return "ジュウ";
  if (t.basic_form === "開く" && prev !== "を") return r.replace(/^ヒラ/, "ア");
  if (s === "今日中") return "キョウジュウ";
  return r;
}

export function readingFromTokens(tokens: Tok[]): string {
  const parts: string[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    let r = t.reading && t.reading !== "*" ? t.reading : t.surface_form;
    r = fixReading(tokens, i, r);
    if (KATAKANA.test(t.surface_form)) r = t.surface_form; // keep ー of loanwords
    const h = toHiragana(r, { passRomaji: true, convertLongVowelMark: false });
    const attach =
      ATTACH_POS.has(t.pos) ||
      (t.pos === "動詞" && (t.pos_detail_1 === "非自立" || t.pos_detail_1 === "接尾")) ||
      (t.pos === "名詞" && t.pos_detail_1 === "接尾");
    if (parts.length && attach) parts[parts.length - 1] += h;
    else parts.push(h);
  }
  return parts.join(" ");
}
