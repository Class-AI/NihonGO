"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getGrammar } from "@/data";
import { useProgress } from "@/lib/progress-context";
import Quiz from "@/components/Quiz";
import SpeakingTest from "@/components/SpeakingTest";
import { JpLine, Pill } from "@/components/ui";
import { LessonVocab, WordBreakdown } from "@/components/Words";

type Step = "learn" | "quiz" | "speak" | "done";
const SPEAK_PASS = 6;

export default function GrammarLesson({ id, nextHref, nextLabel }: { id: string; nextHref: string; nextLabel: string }) {
  const g = getGrammar(id)!;
  const { map, ready, save, isGrammarUnlocked } = useProgress();
  const p = map[`g:${id}`];
  const [step, setStep] = useState<Step>("learn");
  const [quizKey, setQuizKey] = useState(0);
  const [speakKey, setSpeakKey] = useState(0);
  const [initialised, setInitialised] = useState(false);

  useEffect(() => {
    if (!ready || initialised) return;
    setInitialised(true);
    if (p?.completed) setStep("learn");
    else if ((p?.quizScore ?? 0) >= 70) setStep("speak");
    else if (p?.learned) setStep("quiz");
  }, [ready, initialised, p]);

  const quizPassed = (p?.quizScore ?? 0) >= 70;
  const canQuiz = !!p?.learned;

  if (ready && !isGrammarUnlocked(id)) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
        <div className="text-5xl">🔒</div>
        <h1 className="mt-2 text-2xl font-bold">{g.title} is locked</h1>
        <p className="mt-1 text-slate-600">Finish the previous section first (or turn on Exam-cram mode on the home page).</p>
        <Link href="/" className="mt-4 inline-block rounded-xl bg-rose-600 px-5 py-2 font-semibold text-white">
          ← Back to path
        </Link>
      </div>
    );
  }

  const tabs: { k: Step; label: string; enabled: boolean }[] = [
    { k: "learn", label: "① Learn", enabled: true },
    { k: "quiz", label: "② Quiz", enabled: canQuiz },
    { k: "speak", label: "③ Speaking test", enabled: quizPassed },
  ];

  return (
    <div className="space-y-6">
      <div>
        <Link href="/" className="text-sm text-slate-500 hover:text-rose-600">
          ← Grammar path
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-4xl font-bold">{g.title}</h1>
          <Pill tone={g.level === "N4" ? "rose" : "indigo"}>{g.level}</Pill>
          <Pill>Set {g.unit} · #{g.index + 1}</Pill>
          {p?.completed && <Pill tone="green">✓ Completed</Pill>}
        </div>
        <p className="mt-1 text-lg text-slate-600">{g.meaning}</p>
      </div>

      <div className="flex gap-2 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.k}
            disabled={!t.enabled}
            onClick={() => setStep(t.k)}
            className={`whitespace-nowrap rounded-xl px-4 py-2 font-semibold transition ${
              step === t.k ? "bg-slate-900 text-white" : t.enabled ? "bg-white text-slate-700 shadow-sm hover:bg-slate-50" : "cursor-not-allowed bg-slate-100 text-slate-400"
            }`}
          >
            {t.enabled ? t.label : `🔒 ${t.label}`}
          </button>
        ))}
      </div>

      {step === "learn" && (
        <div className="space-y-5">
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-3 text-lg font-bold">🧩 How to form it</h2>
            <ul className="space-y-1.5">
              {g.formation.map((f) => (
                <li key={f} className="rounded-lg bg-rose-50 px-3 py-2 font-medium text-rose-900">
                  {f}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-3 text-lg font-bold">📖 Explanation</h2>
            <ul className="list-disc space-y-2 pl-5 text-slate-700">
              {g.explanation.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-6">
            <h2 className="mb-2 text-lg font-bold">🪷 Tamil bridge — {g.tamil.pattern}</h2>
            <p className="text-lg text-amber-950">{g.tamil.example}</p>
            <p className="mt-2 text-amber-900">{g.tamil.note}</p>
            {g.tips?.map((t) => (
              <p key={t} className="mt-2 text-sm text-amber-800">
                💡 {t}
              </p>
            ))}
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-3 text-lg font-bold">🗣 Example sentences (tap 🔊 to listen)</h2>
            <div className="space-y-4">
              {g.examples.map(([jp, r, en]) => (
                <div key={jp}>
                  <JpLine jp={jp} reading={r} en={en} />
                  <div className="pl-10"><WordBreakdown jp={jp} /></div>
                </div>
              ))}
            </div>
          </section>

          <LessonVocab sentences={[...g.examples.map((e) => e[0]), ...g.speaking.map((x) => x[1])]} />

          <div className="flex justify-end">
            <button
              onClick={() => {
                void save(`g:${id}`, { learned: true });
                setStep("quiz");
                setQuizKey((k) => k + 1);
              }}
              className="rounded-xl bg-rose-600 px-6 py-3 text-lg font-semibold text-white shadow hover:bg-rose-700"
            >
              I understood it → Take the quiz
            </button>
          </div>
        </div>
      )}

      {step === "quiz" && (
        <div className="space-y-4">
          <Quiz
            key={quizKey}
            questions={g.quiz}
            onFinish={(score, total) => {
              const pct = Math.round((score / total) * 100);
              void save(`g:${id}`, { learned: true, quizScore: pct });
            }}
          />
          <div className="flex justify-end gap-2">
            <button onClick={() => setQuizKey((k) => k + 1)} className="rounded-xl border border-slate-300 bg-white px-4 py-2">
              ↻ Retake quiz
            </button>
            {quizPassed && (
              <button onClick={() => setStep("speak")} className="rounded-xl bg-indigo-600 px-5 py-2 font-semibold text-white">
                Go to speaking test →
              </button>
            )}
          </div>
        </div>
      )}

      {step === "speak" && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-indigo-50 p-4 text-sm text-indigo-900">
            🎤 <b>Speaking test:</b> read the English sentence and <b>say it in Japanese</b>. Your speech is converted to <b>hiragana (with kanji in brackets)</b> and
            checked for the <b>{g.title}</b> pattern. Get {SPEAK_PASS}/10 to complete this grammar.
          </div>
          <SpeakingTest
            key={speakKey}
            items={g.speaking}
            rules={[{ label: g.title, check: g.check }]}
            passMark={SPEAK_PASS}
            onFinish={(score) => {
              void save(`g:${id}`, { speakingScore: score, completed: score >= SPEAK_PASS });
            }}
          />
          {p?.completed && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-emerald-50 p-4">
              <span className="font-semibold text-emerald-800">🎌 {g.title} completed! よくできました！</span>
              <Link href={nextHref} className="rounded-xl bg-rose-600 px-5 py-2 font-semibold text-white">
                Next: {nextLabel} →
              </Link>
            </div>
          )}
          <div className="flex justify-end">
            <button onClick={() => setSpeakKey((k) => k + 1)} className="rounded-xl border border-slate-300 bg-white px-4 py-2">
              ↻ Restart speaking test
            </button>
          </div>
        </div>
      )}

      {step === "done" && (
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
          <div className="text-6xl">🎌</div>
          <h2 className="mt-2 text-2xl font-bold">{g.title} completed!</h2>
          <p className="text-slate-600">よくできました！ (yoku dekimashita — Well done!)</p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <button onClick={() => setStep("speak")} className="rounded-xl border border-slate-300 px-4 py-2">
              Review my answers
            </button>
            <Link href={nextHref} className="rounded-xl bg-rose-600 px-5 py-2 font-semibold text-white">
              Next: {nextLabel} →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
