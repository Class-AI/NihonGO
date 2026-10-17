import { toHiragana, isRomaji } from "wanakana";

const STRIP = /[\s、。，．,.!?！？「」『』・ー〜~\u3000]/g;

/** Normalize Japanese text to compact hiragana for comparison. */
export function normalize(text: string): string {
  const t = text.trim().toLowerCase();
  // If the learner typed romaji, convert it; otherwise only convert katakana → hiragana.
  const hira = isRomaji(t.replace(STRIP, "")) ? toHiragana(t) : toHiragana(t, { passRomaji: true });
  return hira.replace(STRIP, "");
}

export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[b.length];
}

export function similarity(a: string, b: string): number {
  const x = normalize(a);
  const y = normalize(b);
  if (!x.length && !y.length) return 1;
  return 1 - levenshtein(x, y) / Math.max(x.length, y.length);
}

/** Returns true if the (hiragana or raw) text satisfies a check string ("a|b&c|d"). */
export function matchesCheck(check: string, ...texts: string[]): boolean {
  const norms = texts.map(normalize);
  return check.split("&").every((group) =>
    group.split("|").some((alt) => {
      // "re:" prefix = regular expression tested against the normalised text (for patterns like お〜ください)
      if (alt.startsWith("re:")) {
        try {
          const rx = new RegExp(alt.slice(3), "u");
          return norms.some((t) => rx.test(t));
        } catch {
          return false;
        }
      }
      const n = normalize(alt);
      return n.length > 0 && norms.some((t) => t.includes(n));
    }),
  );
}

export interface PatternRule {
  label: string;
  check: string;
}

export interface CheckResult {
  heard: string;
  heardReading: string;
  similarity: number; // 0..1
  patterns: { label: string; ok: boolean }[];
  grammarOk: boolean;
  passed: boolean;
}

export function evaluate(
  heard: string,
  heardReading: string,
  modelJp: string,
  modelReading: string,
  rules: PatternRule[],
): CheckResult {
  // Only require patterns the model answer itself contains.
  const required = rules.filter((r) => matchesCheck(r.check, modelJp, modelReading));
  const patterns = required.map((r) => ({ label: r.label, ok: matchesCheck(r.check, heard, heardReading) }));
  const sim = Math.max(similarity(heardReading || heard, modelReading), similarity(heard, modelJp));
  const grammarOk = patterns.every((p) => p.ok);
  return {
    heard,
    heardReading,
    similarity: sim,
    patterns,
    grammarOk,
    passed: grammarOk && sim >= 0.55,
  };
}
