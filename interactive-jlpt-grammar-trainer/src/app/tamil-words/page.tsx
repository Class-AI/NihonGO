"use client";

import { useMemo, useState } from "react";
import { TIERS, tamilWords, type Tier, type TamilWord } from "@/data/tamil-words";
import { Pill, SpeakBtn } from "@/components/ui";

const TONE: Record<Tier, "green" | "indigo" | "amber"> = { real: "green", eng: "indigo", trick: "amber" };

function shuffle<T>(a: T[]): T[] {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

export default function TamilWordsPage() {
  const [tier, setTier] = useState<Tier | "all">("all");
  const [q, setQ] = useState("");
  const [quiz, setQuiz] = useState(false);

  const list = useMemo(
    () =>
      tamilWords.filter(
        (w) => (tier === "all" || w.tier === tier) && (!q || `${w.jp}${w.reading}${w.en}${w.ta}${w.tr}`.toLowerCase().includes(q.toLowerCase())),
      ),
    [tier, q],
  );
  const counts = useMemo(() => {
    const c: Record<string, number> = { all: tamilWords.length };
    for (const w of tamilWords) c[w.tier] = (c[w.tier] ?? 0) + 1;
    return c;
  }, []);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-gradient-to-br from-amber-500 to-rose-500 p-7 text-white shadow">
        <h1 className="text-3xl font-bold">🔤 Tamil ↔ Japanese words</h1>
        <p className="mt-2 max-w-3xl text-amber-50">
          {tamilWords.length} words where Tamil can help you remember Japanese. Each one is labelled honestly: <b>real shared words</b>, <b>English words you already know</b>, or
          <b> sound-alike memory tricks</b>. Learn the whole list in a few evenings — then use the quiz.
        </p>
        <p className="mt-2 text-sm text-amber-100">
          For the other ~3,000 N4/N3 words, every card on the <b>Words</b> page has its own Tamil hook, and each lesson shows word-by-word English meanings.
        </p>
      </section>

      <div className="grid gap-3 md:grid-cols-3">
        {(Object.keys(TIERS) as Tier[]).map((k) => (
          <button key={k} onClick={() => setTier(tier === k ? "all" : k)} className={`rounded-2xl border-2 bg-white p-4 text-left shadow-sm ${tier === k ? "border-rose-500" : "border-transparent"}`}>
            <div className="flex items-center justify-between">
              <span className="font-bold">
                {TIERS[k].icon} {TIERS[k].label}
              </span>
              <Pill tone={TONE[k]}>{counts[k] ?? 0}</Pill>
            </div>
            <p className="mt-1 text-xs text-slate-600">{TIERS[k].blurb}</p>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-white p-3 shadow-sm">
        <button onClick={() => setTier("all")} className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${tier === "all" ? "bg-rose-600 text-white" : "bg-slate-100"}`}>
          All ({counts.all})
        </button>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search Japanese / English / Tamil" className="min-w-40 flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm" />
        <button onClick={() => setQuiz(!quiz)} className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${quiz ? "bg-slate-900 text-white" : "bg-indigo-600 text-white"}`}>
          {quiz ? "📋 Back to the list" : "🧪 Quiz me (Tamil → Japanese)"}
        </button>
      </div>

      {quiz ? (
        <Quiz key={`${tier}-${q}`} pool={list} />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {list.map((w) => (
            <Card key={w.jp + w.ta} w={w} />
          ))}
          {list.length === 0 && <p className="text-slate-500">No words match.</p>}
        </div>
      )}
    </div>
  );
}

function Card({ w }: { w: TamilWord }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <SpeakBtn text={w.reading.split(" / ")[0]} />
          <div>
            <div className="text-2xl font-bold">{w.jp}</div>
            <div className="text-slate-500">{w.reading}</div>
          </div>
        </div>
        <Pill tone={TONE[w.tier]}>
          {TIERS[w.tier].icon} {w.tier === "real" ? "real" : w.tier === "eng" ? "English" : "trick"}
        </Pill>
      </div>
      <div className="mt-2 font-medium">{w.en}</div>
      <div className="text-amber-800">
        🪷 {w.ta} <span className="text-sm text-slate-400">({w.tr})</span>
      </div>
      <div className="mt-1 text-sm text-slate-600">💡 {w.note}</div>
    </div>
  );
}

function Quiz({ pool }: { pool: TamilWord[] }) {
  const all = tamilWords;
  const qs = useMemo(() => {
    const picks = shuffle(pool).slice(0, 12);
    return picks.map((w) => {
      const wrong = shuffle(all.filter((x) => x.jp !== w.jp)).slice(0, 3);
      return { w, opts: shuffle([w, ...wrong]) };
    });
  }, [pool, all]);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);

  if (qs.length < 4) return <p className="text-slate-500">Need at least 4 words in this filter for a quiz.</p>;
  if (i >= qs.length) {
    return (
      <div className="mx-auto max-w-md rounded-2xl bg-white p-6 text-center shadow-sm">
        <div className="text-5xl">{score >= qs.length * 0.8 ? "🎉" : "📚"}</div>
        <div className="mt-2 text-2xl font-bold">
          {score} / {qs.length}
        </div>
        <button onClick={() => { setI(0); setScore(0); setPicked(null); }} className="mt-4 rounded-xl bg-indigo-600 px-5 py-2 font-semibold text-white">
          ↻ Again
        </button>
      </div>
    );
  }
  const q = qs[i];
  return (
    <div className="mx-auto max-w-lg rounded-2xl bg-white p-6 shadow-sm">
      <div className="text-sm text-slate-500">
        Question {i + 1} / {qs.length} · Score {score}
      </div>
      <div className="my-4 text-center">
        <div className="text-3xl font-bold text-amber-800">{q.w.ta}</div>
        <div className="text-slate-500">
          ({q.w.tr}) — {q.w.en}
        </div>
      </div>
      <div className="grid gap-2">
        {q.opts.map((o) => {
          let cls = "border-slate-200 hover:bg-rose-50";
          if (picked) cls = o.jp === q.w.jp ? "border-emerald-500 bg-emerald-50" : o.jp === picked ? "border-red-400 bg-red-50" : "border-slate-200 opacity-60";
          return (
            <button
              key={o.jp}
              onClick={() => {
                if (picked) return;
                setPicked(o.jp);
                if (o.jp === q.w.jp) setScore((s) => s + 1);
              }}
              className={`rounded-xl border-2 px-4 py-2 text-left text-xl ${cls}`}
            >
              {o.jp} <span className="text-sm text-slate-500">{o.reading}</span>
            </button>
          );
        })}
      </div>
      {picked && (
        <div className="mt-3">
          <p className="text-sm text-slate-600">💡 {q.w.note}</p>
          <div className="mt-2 text-right">
            <button onClick={() => { setI(i + 1); setPicked(null); }} className="rounded-xl bg-slate-900 px-4 py-2 font-semibold text-white">
              {i + 1 >= qs.length ? "See result" : "Next →"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
