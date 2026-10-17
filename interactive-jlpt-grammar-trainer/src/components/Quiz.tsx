"use client";

import { useMemo, useState } from "react";
import type { QuizQ } from "@/lib/types";

export default function Quiz({ questions, onFinish }: { questions: QuizQ[]; onFinish: (score: number, total: number) => void }) {
  const qs = useMemo(
    () =>
      questions.map(([q, opts, ans, exp]) => {
        const order = opts.map((_, i) => i);
        for (let i = order.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [order[i], order[j]] = [order[j], order[i]];
        }
        return { q, opts: order.map((i) => opts[i]), ans: order.indexOf(ans), exp };
      }),
    [questions],
  );
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [answers, setAnswers] = useState<boolean[]>([]);

  const done = answers.length === qs.length;
  if (done) {
    const score = answers.filter(Boolean).length;
    const pct = Math.round((score / qs.length) * 100);
    return (
      <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
        <div className="text-5xl">{pct >= 70 ? "🎉" : "📚"}</div>
        <div className="mt-2 text-2xl font-bold">
          {score} / {qs.length} ({pct}%)
        </div>
        <p className="mt-1 text-slate-600">{pct >= 70 ? "Passed! Speaking test unlocked." : "You need 70% to move to the speaking test."}</p>
      </div>
    );
  }

  const cur = qs[i];
  const scoreSoFar = answers.filter(Boolean).length;

  const choose = (k: number) => {
    if (picked !== null) return;
    setPicked(k);
  };
  const next = () => {
    if (picked === null) return;
    const correct = picked === cur.ans;
    const nextAnswers = [...answers, correct];
    setAnswers(nextAnswers);
    if (nextAnswers.length === qs.length) {
      const finalScore = nextAnswers.filter(Boolean).length;
      onFinish(finalScore, qs.length);
    } else {
      setI((v) => v + 1);
      setPicked(null);
    }
  };

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="mb-2 flex justify-between text-sm text-slate-500">
        <span>
          Question {i + 1} / {qs.length}
        </span>
        <span>Score: {scoreSoFar}</span>
      </div>
      <div className="mb-4 h-1.5 rounded bg-slate-100">
        <div className="h-1.5 rounded bg-rose-500 transition-all" style={{ width: `${(answers.length / qs.length) * 100}%` }} />
      </div>
      <h3 className="mb-4 text-lg font-semibold">{cur.q}</h3>
      <div className="grid gap-2">
        {cur.opts.map((o, k) => {
          let cls = "border-slate-200 hover:border-rose-300 hover:bg-rose-50";
          if (picked !== null) {
            if (k === cur.ans) cls = "border-emerald-500 bg-emerald-50";
            else if (k === picked) cls = "border-red-400 bg-red-50";
            else cls = "border-slate-200 opacity-60";
          }
          return (
            <button key={k} onClick={() => choose(k)} className={`rounded-xl border-2 px-4 py-3 text-left text-lg transition ${cls}`}>
              {o}
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className={`text-sm ${picked === cur.ans ? "text-emerald-700" : "text-red-700"}`}>
            {picked === cur.ans ? "✅ Correct! " : "❌ Not quite. "}
            {cur.exp}
          </p>
          <button onClick={next} className="rounded-xl bg-slate-900 px-5 py-2 font-semibold text-white">
            {answers.length + 1 >= qs.length ? "See result" : "Next →"}
          </button>
        </div>
      )}
    </div>
  );
}
