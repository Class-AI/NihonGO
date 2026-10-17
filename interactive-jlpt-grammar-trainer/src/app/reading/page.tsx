"use client";

import { useState } from "react";
import { readingSets } from "@/data/reading";
import { useProgress } from "@/lib/progress-context";
import { Pill, SpeakBtn } from "@/components/ui";

export default function ReadingPage() {
  const { map, save } = useProgress();
  const [level, setLevel] = useState<"N4" | "N3">("N4");
  const [openId, setOpenId] = useState<string | null>(null);
  const sets = readingSets.filter((s) => s.level === level);
  const doneCount = readingSets.filter((s) => map[`r:${s.id}`]?.completed).length;
  const open = readingSets.find((s) => s.id === openId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">📖 Reading · 読解</h1>
        <p className="mt-1 text-slate-600">
          JLPT section 2 practice: notices, emails, flyers, essays. Read, check key words, answer — with Tamil summaries. Completed: {doneCount}/{readingSets.length}
        </p>
      </div>
      <div className="flex gap-2">
        {(["N4", "N3"] as const).map((l) => (
          <button key={l} onClick={() => { setLevel(l); setOpenId(null); }} className={`rounded-xl px-5 py-2 font-semibold ${level === l ? (l === "N4" ? "bg-rose-600 text-white" : "bg-indigo-600 text-white") : "bg-white shadow-sm"}`}>
            {l}
          </button>
        ))}
      </div>

      {!open && (
        <div className="grid gap-3 md:grid-cols-2">
          {sets.map((s) => {
            const done = !!map[`r:${s.id}`]?.completed;
            return (
              <button key={s.id} onClick={() => setOpenId(s.id)} className={`rounded-2xl border-2 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${done ? "border-emerald-300" : "border-transparent"}`}>
                <div className="flex items-center justify-between">
                  <Pill tone={s.level === "N4" ? "rose" : "indigo"}>{s.kind}</Pill>
                  {done && <Pill tone="green">✓ done</Pill>}
                </div>
                <div className="mt-2 text-lg font-bold">{s.title}</div>
                <div className="text-sm text-slate-500">{s.questions.length} questions · key words + Tamil summary</div>
              </button>
            );
          })}
        </div>
      )}

      {open && <Reader key={open.id} id={open.id} onBack={() => setOpenId(null)} onNext={() => {
        const idx = sets.findIndex((s) => s.id === open.id);
        setOpenId(sets[(idx + 1) % sets.length].id);
        window.scrollTo({ top: 0 });
      }} />}
    </div>
  );
}

function Reader({ id, onBack, onNext }: { id: string; onBack: () => void; onNext: () => void }) {
  const s = readingSets.find((x) => x.id === id)!;
  const { map, save } = useProgress();
  const [showReading, setShowReading] = useState(false);
  const [showTamil, setShowTamil] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>(s.questions.map(() => null));
  const correct = s.questions.filter(([, , ans], i) => answers[i] === ans).length;
  const allAnswered = answers.every((a) => a !== null);
  const done = !!map[`r:${id}`]?.completed;

  const finish = () => {
    void save(`r:${id}`, { completed: correct === s.questions.length, quizScore: Math.round((correct / s.questions.length) * 100) });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="text-sm text-slate-500 hover:text-rose-600">← All passages</button>
        <button onClick={onNext} className="text-sm text-slate-500 hover:text-rose-600">Next passage →</button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-2xl font-bold">{s.title}</h2>
        <Pill tone={s.level === "N4" ? "rose" : "indigo"}>{s.kind}</Pill>
        {done && <Pill tone="green">✓ completed</Pill>}
      </div>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="mb-3 flex flex-wrap gap-2">
          <button onClick={() => setShowReading(!showReading)} className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-semibold">{showReading ? "Hide hiragana" : "Show hiragana (ふりがな)"}</button>
          <button onClick={() => setShowTamil(!showTamil)} className="rounded-lg bg-amber-100 px-3 py-1.5 text-sm font-semibold text-amber-900">🪷 {showTamil ? "Hide Tamil summary" : "Tamil summary"}</button>
        </div>
        <div className="space-y-3 text-lg leading-relaxed">
          {s.passage.map((p, i) => (
            <div key={i}>
              <div className="flex items-start gap-2">
                <SpeakBtn text={p} className="mt-1 shrink-0" />
                <p>{p}</p>
              </div>
              {showReading && <p className="pl-10 text-base text-rose-700">{s.reading[i]}</p>}
            </div>
          ))}
        </div>
        {showTamil && <p className="mt-4 rounded-xl bg-amber-50 p-3 text-amber-900">{s.tamil}</p>}
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h3 className="mb-3 font-bold">🔑 Key words (tap 🔊 to hear)</h3>
        <div className="grid gap-2 sm:grid-cols-2">
          {s.vocab.map(([jp, r, en]) => (
            <div key={jp} className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2">
              <SpeakBtn text={r} />
              <div><span className="font-bold">{jp}</span> <span className="text-slate-500">({r})</span> — {en}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        {s.questions.map(([q, opts, ans, exp], qi) => (
          <div key={qi} className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="font-semibold">Q{qi + 1}. {q}</div>
            <div className="mt-3 grid gap-2">
              {opts.map((o, k) => {
                const picked = answers[qi];
                let cls = "border-slate-200 hover:border-rose-300 hover:bg-rose-50";
                if (picked !== null) {
                  if (k === ans) cls = "border-emerald-500 bg-emerald-50";
                  else if (k === picked) cls = "border-red-400 bg-red-50";
                  else cls = "border-slate-200 opacity-60";
                }
                return <button key={k} disabled={picked !== null} onClick={() => setAnswers((a) => a.map((v, j) => (j === qi ? k : v)))} className={`rounded-xl border-2 px-4 py-2.5 text-left ${cls}`}>{o}</button>;
              })}
            </div>
            {answers[qi] !== null && <p className={`mt-2 text-sm ${answers[qi] === ans ? "text-emerald-700" : "text-red-700"}`}>{answers[qi] === ans ? "✅ Correct! " : "❌ "}{exp}</p>}
          </div>
        ))}
      </section>

      {allAnswered && (
        <div className={`rounded-2xl p-4 text-center font-bold ${correct === s.questions.length ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"}`}>
          {correct}/{s.questions.length} correct {correct === s.questions.length ? "— perfect! 🎉" : "— review and try the next passage."}
        </div>
      )}
      <div className="flex justify-end gap-2">
        <button onClick={() => { setAnswers(s.questions.map(() => null)); }} className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm">↻ Retry</button>
        {allAnswered && <button onClick={() => { finish(); }} className="rounded-xl bg-slate-900 px-5 py-2 font-semibold text-white">Save result</button>}
        <button onClick={onNext} className="rounded-xl bg-rose-600 px-5 py-2 font-semibold text-white">Next passage →</button>
      </div>
    </div>
  );
}
