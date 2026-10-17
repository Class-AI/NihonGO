"use client";

import Link from "next/link";
import { useState } from "react";
import { getUnit, units } from "@/data";
import { useProgress } from "@/lib/progress-context";
import SpeakingTest from "@/components/SpeakingTest";
import { JpLine, Pill } from "@/components/ui";

const PASS = 3;

export default function ReviewClient({ unitId }: { unitId: number }) {
  const u = getUnit(unitId)!;
  const { ready, map, save, isReviewUnlocked } = useProgress();
  const [started, setStarted] = useState(false);
  const [key, setKey] = useState(0);
  const p = map[`u:${unitId}`];
  const nextUnit = units.find((x) => x.id === unitId + 1);

  if (ready && !isReviewUnlocked(unitId)) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
        <div className="text-5xl">🔒</div>
        <h1 className="mt-2 text-2xl font-bold">Set {unitId} combined exam is locked</h1>
        <p className="text-slate-600">Complete all 5 grammar points of this set first.</p>
        <Link href="/" className="mt-4 inline-block rounded-xl bg-rose-600 px-5 py-2 font-semibold text-white">
          ← Back to path
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/" className="text-sm text-slate-500 hover:text-rose-600">
          ← Grammar path
        </Link>
        <h1 className="mt-2 text-3xl font-bold">
          Set {u.id} · Combined Speaking Exam {p?.completed && <Pill tone="green">✓ Passed</Pill>}
        </h1>
        <p className="mt-1 text-slate-600">
          Each English sentence combines <b>all 5 grammar points</b> you learned in this set. Say the whole thing in Japanese. Every grammar pattern is checked separately. Pass: {PASS}/5.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {u.grammar.map((g) => (
            <Pill key={g.id} tone="indigo">
              {g.title}
            </Pill>
          ))}
        </div>
      </div>

      {!started ? (
        <div className="space-y-4">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-3 text-lg font-bold">⚡ Quick recap before the exam</h2>
            <div className="grid gap-3 md:grid-cols-2">
              {u.grammar.map((g) => (
                <div key={g.id} className="rounded-xl bg-slate-50 p-3">
                  <div className="font-bold">
                    {g.title} <span className="font-normal text-slate-500">— {g.meaning}</span>
                  </div>
                  <div className="mt-2">
                    <JpLine jp={g.examples[0][0]} reading={g.examples[0][1]} en={g.examples[0][2]} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">
            💡 Tip: These are long. Press 🎤, say the first part, pause naturally, then continue — the mic keeps listening until you press ■. You can also split it into short Japanese sentences.
          </div>
          <div className="flex justify-end">
            <button onClick={() => setStarted(true)} className="rounded-xl bg-indigo-600 px-6 py-3 text-lg font-semibold text-white shadow">
              Start combined exam →
            </button>
          </div>
        </div>
      ) : (
        <>
          <SpeakingTest
            key={key}
            combined
            items={u.review}
            rules={u.grammar.map((g) => ({ label: g.title, check: g.check }))}
            passMark={PASS}
            onFinish={(score) => void save(`u:${unitId}`, { speakingScore: score, completed: score >= PASS })}
          />
          {p?.completed && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-emerald-50 p-4">
              <span className="font-semibold text-emerald-800">🏆 Set {unitId} mastered! 合格！</span>
              {nextUnit ? (
                <Link href={`/grammar/${nextUnit.grammar[0].id}`} className="rounded-xl bg-rose-600 px-5 py-2 font-semibold text-white">
                  Start Set {nextUnit.id}: {nextUnit.title} →
                </Link>
              ) : (
                <Link href="/exam" className="rounded-xl bg-rose-600 px-5 py-2 font-semibold text-white">
                  All units done — see the exam guide →
                </Link>
              )}
            </div>
          )}
          <div className="flex justify-end">
            <button onClick={() => setKey((k) => k + 1)} className="rounded-xl border border-slate-300 bg-white px-4 py-2">
              ↻ Restart exam
            </button>
          </div>
        </>
      )}
    </div>
  );
}
