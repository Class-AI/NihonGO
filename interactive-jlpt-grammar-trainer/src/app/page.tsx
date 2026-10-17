"use client";

import Link from "next/link";
import { units, unitGroups, allGrammar, getUnit } from "@/data";
import { vocabStats } from "@/data/vocab";
import { readingSets } from "@/data/reading";
import { listeningSets } from "@/data/listening";
import { useProgress } from "@/lib/progress-context";
import { Pill } from "@/components/ui";

export default function Home() {
  const { map, ready, cram, setCram, isGrammarUnlocked, isReviewUnlocked, reset } = useProgress();
  const doneCount = allGrammar.filter((g) => map[`g:${g.id}`]?.completed).length;
  const reviewsDone = units.filter((u) => map[`u:${u.id}`]?.completed).length;
  const pct = Math.round((doneCount / allGrammar.length) * 100);
  const nextG = allGrammar.find((g) => !map[`g:${g.id}`]?.completed && isGrammarUnlocked(g.id));
  const nextReview = units.find((u) => !map[`u:${u.id}`]?.completed && isReviewUnlocked(u.id) && u.grammar.every((g) => map[`g:${g.id}`]?.completed));

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-rose-600 to-orange-500 p-8 text-white shadow-lg">
        <div className="text-sm font-semibold uppercase tracking-widest text-rose-100">JLPT N4 → N3 · for Tamil speakers</div>
        <h1 className="mt-2 text-3xl font-bold md:text-4xl">日本語の道 — Your grammar path</h1>
        <p className="mt-2 max-w-2xl text-rose-50">
          Each grammar: <b>① Learn</b> (Tamil comparison + word-by-word English meaning) → <b>② Quiz</b> → <b>③ Speaking test</b> (10 English sentences you say in Japanese).
          After every 5 grammar points: a <b>combined speaking exam</b> that mixes all 5 in each sentence. A Unit can hold several 5-point sets, so it has several combined exams.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-6">
          <div>
            <div className="text-4xl font-bold">{ready ? `${pct}%` : "…"}</div>
            <div className="text-sm text-rose-100">
              {doneCount}/{allGrammar.length} grammar · {reviewsDone}/{units.length} combined exams
            </div>
          </div>
          {ready && (nextReview || nextG) && (
            <Link
              href={nextReview && (!nextG || nextG.unit > nextReview.id) ? `/review/${nextReview.id}` : `/grammar/${nextG!.id}`}
              className="rounded-xl bg-white px-5 py-3 font-semibold text-rose-700 shadow hover:bg-rose-50"
            >
              Continue →{" "}
              {nextReview && (!nextG || nextG.unit > nextReview.id) ? `Set ${nextReview.id} combined exam` : nextG!.title}
            </Link>
          )}
        </div>
        <div className="mt-4 h-2 rounded-full bg-white/30">
          <div className="h-2 rounded-full bg-white" style={{ width: `${pct}%` }} />
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { href: "/fast-track", icon: "⚡", title: "Pass-first fast track", sub: "Must-know grammar · kanji combos · words · 14-day plan" },
          { href: "/vocab", icon: "🗂", title: `${vocabStats.total}+ words`, sub: "N4 + N3 vocab · Tamil hooks · Daily 20 · tests" },
          { href: "/tamil-words", icon: "🔤", title: "Tamil ↔ Japanese words", sub: "Look-alike & shared words — learn faster" },
          { href: "/reading", icon: "📖", title: `${readingSets.length} reading sets`, sub: "Notices · emails · essays (N4/N3)" },
          { href: "/listening", icon: "🎧", title: `${listeningSets.length} listening sets`, sub: "Audio practice · all JLPT question types" },
          { href: "/install", icon: "📲", title: "Android app", sub: "Install / get the APK file" },
        ].map((c) => (
          <Link key={c.href} href={c.href} className="rounded-2xl bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="text-2xl">{c.icon}</div>
            <div className="mt-1 font-bold">{c.title}</div>
            <div className="text-xs text-slate-500">{c.sub}</div>
          </Link>
        ))}
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-4 text-sm shadow-sm">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={cram} onChange={(e) => setCram(e.target.checked)} className="h-4 w-4 accent-rose-600" />
          <span>
            <b>Exam-cram mode</b> — unlock everything (skip the step-by-step locks)
          </span>
        </label>
        <button
          onClick={() => {
            if (confirm("Reset all progress?")) void reset();
          }}
          className="text-slate-400 underline hover:text-red-600"
        >
          Reset progress
        </button>
      </div>

      {unitGroups.map((grp) => {
        const sets = grp.sets.map((id) => getUnit(id)!).filter(Boolean);
        const gTotal = sets.reduce((n, s) => n + s.grammar.length, 0);
        const gDone = sets.reduce((n, s) => n + s.grammar.filter((g) => map[`g:${g.id}`]?.completed).length, 0);
        const eDone = sets.filter((s) => map[`u:${s.id}`]?.completed).length;
        return (
          <section key={grp.id} className="space-y-4 rounded-3xl bg-white/60 p-4 ring-1 ring-rose-100">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-2xl font-bold">
                  Unit {grp.id} · {grp.title}
                </h2>
                <Pill tone={grp.level === "N4" ? "rose" : "indigo"}>{grp.level}</Pill>
                <span className="text-sm text-slate-500">
                  {gDone}/{gTotal} grammar · {eDone}/{sets.length} combined exams
                </span>
              </div>
              <p className="text-sm text-slate-500">{grp.blurb}</p>
            </div>

            {sets.map((u, si) => {
              const reviewOpen = isReviewUnlocked(u.id);
              const reviewDone = map[`u:${u.id}`]?.completed;
              return (
                <div key={u.id}>
                  <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <span className="rounded-lg bg-slate-900 px-2 py-0.5 text-xs text-white">Set {u.id}</span>
                    {u.title}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {u.grammar.map((g) => {
                      const p = map[`g:${g.id}`];
                      const open = isGrammarUnlocked(g.id);
                      const status = p?.completed
                        ? { t: "✓ Completed", tone: "green" as const }
                        : p?.quizScore != null && p.learned
                          ? { t: "Speaking test", tone: "amber" as const }
                          : p?.learned
                            ? { t: "Quiz next", tone: "amber" as const }
                            : open
                              ? { t: "Start", tone: "rose" as const }
                              : { t: "🔒 Locked", tone: "slate" as const };
                      const num = allGrammar.findIndex((x) => x.id === g.id) + 1;
                      const card = (
                        <div className={`h-full rounded-2xl border bg-white p-4 shadow-sm transition ${open ? "border-transparent hover:-translate-y-0.5 hover:shadow-md" : "border-slate-200 opacity-60"}`}>
                          <div className="flex items-center justify-between text-xs text-slate-500">
                            <span>#{num}</span>
                            <Pill tone={status.tone}>{status.t}</Pill>
                          </div>
                          <div className="mt-2 text-xl font-bold">{g.title}</div>
                          <div className="text-sm text-slate-600">{g.meaning}</div>
                          {p?.speakingScore != null && <div className="mt-2 text-xs text-slate-500">Best speaking: {p.speakingScore}/10</div>}
                        </div>
                      );
                      return open ? (
                        <Link key={g.id} href={`/grammar/${g.id}`}>
                          {card}
                        </Link>
                      ) : (
                        <div key={g.id}>{card}</div>
                      );
                    })}
                    {(() => {
                      const card = (
                        <div
                          className={`h-full rounded-2xl border-2 border-dashed p-4 ${
                            reviewDone ? "border-emerald-400 bg-emerald-50" : reviewOpen ? "border-indigo-400 bg-indigo-50 hover:bg-indigo-100" : "border-slate-300 bg-slate-50 opacity-60"
                          }`}
                        >
                          <div className="text-xs font-semibold uppercase text-indigo-600">
                            Combined exam {si + 1} of {sets.length}
                          </div>
                          <div className="mt-1 text-lg font-bold">🎤 All 5 grammars in one sentence</div>
                          <div className="text-sm text-slate-600">
                            {reviewDone ? `✓ Passed (${map[`u:${u.id}`]?.speakingScore ?? 0}/5)` : reviewOpen ? "Unlocked — 5 combined sentences" : "🔒 Finish the 5 grammar points above"}
                          </div>
                        </div>
                      );
                      return reviewOpen ? <Link href={`/review/${u.id}`}>{card}</Link> : <div>{card}</div>;
                    })()}
                  </div>
                </div>
              );
            })}
          </section>
        );
      })}
    </div>
  );
}
