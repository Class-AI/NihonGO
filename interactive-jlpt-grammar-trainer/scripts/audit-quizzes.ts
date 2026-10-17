// Structural audit of every quiz / reading / listening question. Run: npx tsx scripts/audit-quizzes.ts
import { units } from "../src/data";
import { readingSets } from "../src/data/reading";
import { listeningSets } from "../src/data/listening";

let problems = 0, total = 0;
const bad = (where: string, msg: string) => { problems++; console.log("✗", where, "—", msg); };
function check(where: string, q: string, opts: string[], ans: number, exp: string) {
  total++;
  if (opts.length !== 4) bad(where, `has ${opts.length} options: ${q}`);
  if (!Number.isInteger(ans) || ans < 0 || ans >= opts.length) bad(where, `answer index ${ans} out of range: ${q}`);
  const norm = opts.map((o) => o.replace(/\s+/g, ""));
  if (new Set(norm).size !== norm.length) bad(where, `DUPLICATE options: ${q}`);
  if (/^(all|all possible|all correct|all similar|all casual)\b/i.test((opts[ans] ?? "").trim())) bad(where, `correct answer is an 'all …' option (ambiguous): ${q}`);
  if (!q.trim() || !exp.trim()) bad(where, "empty question or explanation");
  if (opts.some((o) => !o.trim())) bad(where, `empty option: ${q}`);
}
for (const u of units) for (const g of u.grammar) {
  if (g.quiz.length !== 4) bad(g.id, `quiz has ${g.quiz.length} questions`);
  if (g.speaking.length !== 10) bad(g.id, `speaking has ${g.speaking.length} sentences`);
  g.quiz.forEach(([q, o, a, e], i) => check(`${g.id} Q${i + 1}`, q, o, a, e));
}
for (const s of readingSets) s.questions.forEach(([q, o, a, e], i) => check(`${s.id} Q${i + 1}`, q, o, a, e));
for (const s of listeningSets) s.questions.forEach(([q, o, a, e], i) => check(`${s.id} Q${i + 1}`, q, o, a, e));
console.log(`\nchecked ${total} questions — ${problems} problem(s)`);
process.exit(problems ? 1 : 0);
