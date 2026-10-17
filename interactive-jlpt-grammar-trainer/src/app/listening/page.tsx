"use client";

import { useEffect, useRef, useState } from "react";
import { listeningSets } from "@/data/listening";
import { useProgress } from "@/lib/progress-context";
import { Pill } from "@/components/ui";

function playLines(lines: string[], rate = 0.92, onEnd?: () => void) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  lines.forEach((t, i) => {
    const u = new SpeechSynthesisUtterance(t);
    u.lang = "ja-JP";
    u.rate = rate;
    const voice = window.speechSynthesis.getVoices().find((v) => v.lang.startsWith("ja"));
    if (voice) u.voice = voice;
    if (onEnd && i === lines.length - 1) u.onend = onEnd;
    window.speechSynthesis.speak(u);
  });
}

export default function ListeningPage() {
  const { map } = useProgress();
  const [level, setLevel] = useState<"N4" | "N3">("N4");
  const [openId, setOpenId] = useState<string | null>(null);
  const sets = listeningSets.filter((s) => s.level === level);
  const doneCount = listeningSets.filter((s) => map[`l:${s.id}`]?.completed).length;
  const open = listeningSets.find((s) => s.id === openId);

  useEffect(() => () => { if ("speechSynthesis" in window) window.speechSynthesis.cancel(); }, [openId]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">🎧 Listening · 聴解</h1>
        <p className="mt-1 text-slate-600">
          JLPT section 3 practice. <b>Hide the script</b>, press play (audio is auto-read in Japanese), then answer — just like the real exam. Completed: {doneCount}/{listeningSets.length}
        </p>
        <p className="mt-1 text-sm text-slate-500">💡 Tip: play twice max. In the real test, N4/N3 audio plays only once (即時応答 too).</p>
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
            const done = !!map[`l:${s.id}`]?.completed;
            return (
              <button key={s.id} onClick={() => setOpenId(s.id)} className={`rounded-2xl border-2 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${done ? "border-emerald-300" : "border-transparent"}`}>
                <div className="flex items-center justify-between">
                  <Pill tone={s.level === "N4" ? "rose" : "indigo"}>{s.kind}</Pill>
                  {done && <Pill tone="green">✓ done</Pill>}
                </div>
                <div className="mt-2 text-lg font-bold">{s.title}</div>
                <div className="text-sm text-slate-500">{s.script.length} lines · {s.questions.length} questions</div>
              </button>
            );
          })}
        </div>
      )}

      {open && <Player key={open.id} id={open.id} onBack={() => setOpenId(null)} onNext={() => {
        const idx = sets.findIndex((s) => s.id === open.id);
        setOpenId(sets[(idx + 1) % sets.length].id);
        window.scrollTo({ top: 0 });
      }} />}
    </div>
  );
}

function Player({ id, onBack, onNext }: { id: string; onBack: () => void; onNext: () => void }) {
  const s = listeningSets.find((x) => x.id === id)!;
  const { map, save } = useProgress();
  const [showScript, setShowScript] = useState(false);
  const [showTamil, setShowTamil] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [plays, setPlays] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(s.questions.map(() => null));
  const [rate, setRate] = useState(0.92);
  const correct = s.questions.filter(([, , ans], i) => answers[i] === ans).length;
  const allAnswered = answers.every((a) => a !== null);
  const done = !!map[`l:${id}`]?.completed;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); if ("speechSynthesis" in window) window.speechSynthesis.cancel(); }, []);

  const play = () => {
    setPlaying(true);
    setPlays((p) => p + 1);
    playLines(s.script.map(([, t]) => t), rate, () => setPlaying(false));
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setPlaying(false), 60000);
  };
  const stop = () => {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    setPlaying(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="text-sm text-slate-500 hover:text-rose-600">← All listening</button>
        <button onClick={onNext} className="text-sm text-slate-500 hover:text-rose-600">Next →</button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-2xl font-bold">{s.title}</h2>
        <Pill tone={s.level === "N4" ? "rose" : "indigo"}>{s.kind}</Pill>
        {done && <Pill tone="green">✓ completed</Pill>}
      </div>

      <section className="rounded-2xl bg-white p-6 text-center shadow-sm">
        <div className="flex items-center justify-center gap-3">
          <button onClick={playing ? stop : play} className={`flex h-20 w-20 items-center justify-center rounded-full text-3xl text-white shadow-lg ${playing ? "animate-pulse bg-red-500" : "bg-indigo-600 hover:bg-indigo-700"}`}>
            {playing ? "■" : "▶"}
          </button>
        </div>
        <p className="mt-2 text-sm text-slate-500">Played {plays}× {plays >= 2 ? "(real exam = 1×!)" : ""}</p>
        <div className="mt-2 flex items-center justify-center gap-2 text-sm">
          <span className="text-slate-500">Speed:</span>
          {[{ l: "0.8×", v: 0.8 }, { l: "1×", v: 0.92 }, { l: "1.2×", v: 1.1 }].map((r) => (
            <button key={r.l} onClick={() => setRate(r.v)} className={`rounded-lg px-3 py-1 ${rate === r.v ? "bg-indigo-600 text-white" : "bg-slate-100"}`}>{r.l}</button>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          <button onClick={() => setShowScript(!showScript)} className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-semibold">{showScript ? "Hide script 🙈" : "Show script (after answering!)"}</button>
          <button onClick={() => setShowTamil(!showTamil)} className="rounded-lg bg-amber-100 px-3 py-1.5 text-sm font-semibold text-amber-900">🪷 Tamil summary</button>
        </div>
        {showTamil && <p className="mx-auto mt-3 max-w-2xl rounded-xl bg-amber-50 p-3 text-left text-amber-900">{s.tamil}</p>}
      </section>

      {showScript && (
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h3 className="mb-3 font-bold">📜 Script (答え合わせ用 — for checking)</h3>
          <div className="space-y-3">
            {s.script.map(([sp, t], i) => (
              <div key={i}>
                <div><span className="mr-2 rounded bg-slate-100 px-2 py-0.5 text-xs font-bold">{sp}</span>{t}</div>
                <div className="pl-2 text-sm text-rose-700">{s.reading[i]}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-3">
        <h3 className="font-bold">❓ Questions — answer from listening only</h3>
        {s.questions.map(([q, opts, ans, exp], qi) => (
          <div key={qi} className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="font-semibold">Q{qi + 1}. {q}</div>
            <div className="mt-3 grid gap-2">
              {opts.map((o, k) => {
                const picked = answers[qi];
                let cls = "border-slate-200 hover:border-indigo-300 hover:bg-indigo-50";
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
          {correct}/{s.questions.length} correct {correct === s.questions.length ? "— perfect listening! 🎉" : "— listen once more and retry."}
        </div>
      )}
      <div className="flex justify-end gap-2">
        <button onClick={() => setAnswers(s.questions.map(() => null))} className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm">↻ Retry</button>
        {allAnswered && <button onClick={() => void save(`l:${id}`, { completed: correct === s.questions.length, quizScore: Math.round((correct / s.questions.length) * 100) })} className="rounded-xl bg-slate-900 px-5 py-2 font-semibold text-white">Save result</button>}
        <button onClick={onNext} className="rounded-xl bg-indigo-600 px-5 py-2 font-semibold text-white">Next →</button>
      </div>
    </div>
  );
}
