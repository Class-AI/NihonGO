// Verifies grammar content: run with  npx tsx scripts/verify-content.ts
import { units, allGrammar } from "../src/data";
import { matchesCheck } from "../src/lib/check";

let bad = 0;
const fail = (m: string) => { bad++; console.log("✗", m); };

const ids = new Set<string>();
for (const g of allGrammar) {
  if (ids.has(g.id)) fail(`duplicate grammar id ${g.id}`);
  ids.add(g.id);
}
const setIds = new Set<number>();
for (const u of units) {
  if (setIds.has(u.id)) fail(`duplicate set id ${u.id}`);
  setIds.add(u.id);
  if (u.grammar.length !== 5) fail(`set ${u.id} has ${u.grammar.length} grammar points (needs 5)`);
  if (u.review.length !== 5) fail(`set ${u.id} has ${u.review.length} review sentences (needs 5)`);
  for (const g of u.grammar) {
    if (!g.tamil?.pattern || !g.tamil?.example || !g.tamil?.note) fail(`${g.id} missing Tamil bridge`);
    if (g.examples.length < 3) fail(`${g.id} has ${g.examples.length} examples`);
    for (const [jp, r] of g.examples) if (!matchesCheck(g.check, jp, r)) fail(`${g.id} EXAMPLE does not show its own pattern: ${jp}`);
    for (const [en, jp, r] of g.speaking) {
      if (!matchesCheck(g.check, jp, r)) fail(`${g.id} SPEAKING sentence lacks the pattern: ${jp} (${r})`);
      if (!en.trim() || !jp.trim() || !r.trim()) fail(`${g.id} empty speaking field`);
    }
    // the check must not be satisfied by a plain unrelated sentence
    for (const probe of ["私は毎日学校へ行きます。", "これはペンです。"]) if (matchesCheck(g.check, probe, probe)) fail(`${g.id} check is too lenient — matches "${probe}"`);
  }
  u.review.forEach(([en, jp, r], i) => {
    const missing = u.grammar.filter((g) => !matchesCheck(g.check, jp, r)).map((g) => g.title);
    if (missing.length) fail(`set ${u.id} COMBINED sentence ${i + 1} is missing: ${missing.join(", ")}`);
    if (!en.trim()) fail(`set ${u.id} review ${i + 1} has no English`);
  });
}
const total = allGrammar.length;
console.log(`\n${units.length} sets · ${total} grammar points · ${total * 10} speaking sentences · ${units.length * 5} combined sentences → ${bad} problem(s)`);
process.exit(bad ? 1 : 0);
