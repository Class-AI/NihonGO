"use client";

import { useEffect, useMemo, useState } from "react";
import { SpeakBtn } from "./ui";

// The dictionary data (≈430 KB) is loaded only when a learner opens a breakdown, then cached by the browser / service worker.
type GlossMod = typeof import("@/data/gloss");
let cache: GlossMod | null = null;
let pending: Promise<GlossMod> | null = null;
function loadGloss(): Promise<GlossMod> {
  if (cache) return Promise.resolve(cache);
  if (!pending) pending = import("@/data/gloss").then((m) => (cache = m));
  return pending;
}
function useGloss(active: boolean) {
  const [mod, setMod] = useState<GlossMod | null>(cache);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (active && !mod) loadGloss().then(setMod).catch(() => setFailed(true));
  }, [active, mod]);
  return { mod, failed };
}

/** Grammar words and particles (the dictionary glosses only content words). */
const FUNC: Record<string, string> = {
  は: "topic marker",
  が: "subject marker",
  を: "object marker",
  に: "to / at / for (target, time)",
  で: "at / by / with (place of action, means)",
  の: "of / 's / (makes a noun)",
  と: "and / with / quote",
  も: "also / too",
  へ: "toward",
  から: "from / because",
  まで: "until / up to",
  か: "question marker",
  ね: "right? (agreement)",
  よ: "(I'm telling you)",
  ば: "if (conditional)",
  て: "-te form (and / doing)",
  た: "past",
  だ: "is",
  です: "is / am / are (polite)",
  ます: "polite ending",
  ません: "polite negative",
  ました: "polite past",
  ませ: "polite",
  ない: "negative (not)",
  なかっ: "negative past",
  ので: "because",
  のに: "although / in order to",
  けど: "but",
  けれど: "but",
  し: "and also (listing reasons)",
  ず: "without (doing)",
  なら: "if / in that case",
  たら: "if / when (after)",
  ながら: "while ~ing",
  つつ: "while / although",
  ほど: "to the extent of / not as…as",
  ぐらい: "about",
  くらい: "about",
  だけ: "only",
  しか: "only (with negative)",
  ばかり: "only / just / nothing but",
  ずつ: "each / at a time",
  など: "such as / etc.",
  や: "and (examples)",
  って: "(quote / casual と)",
  ください: "please",
  たい: "want to",
  そう: "looks like / I heard",
  よう: "seems / like / so that",
  みたい: "looks like",
  らしい: "apparently / typical of",
  はず: "should be / expected",
  わけ: "reason / conclusion",
  こと: "the act of / thing",
  もの: "thing / (nostalgia)",
  とき: "when",
  ところ: "point in time / about to",
  れ: "passive / potential",
  られ: "passive / potential",
  せ: "causative",
  させ: "causative",
  う: "let's / volitional",
  ませんか: "won't you? (invitation / request)",
  でしょう: "probably / right?",
  ましょう: "let's",
  ても: "even if",
  でも: "even / or something",
  ては: "if / when (…then)",
};

export function WordBreakdown({ jp }: { jp: string }) {
  const [open, setOpen] = useState(false);
  const { mod, failed } = useGloss(open);
  const segs = mod?.SEGMENTS[jp];
  return (
    <div className="mt-1.5">
      <button onClick={() => setOpen(!open)} className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-200">
        {open ? "Hide word meanings" : "🔍 Word-by-word English meaning"}
      </button>
      {open && (
        <div className="mt-2 rounded-xl bg-slate-50 p-3">
          {failed && <p className="text-xs text-red-600">Couldn&apos;t load the dictionary — check your connection once and try again.</p>}
          {!mod && !failed && <p className="text-xs text-slate-500">Loading dictionary…</p>}
          {mod && !segs && <p className="text-xs text-slate-500">No breakdown stored for this sentence.</p>}
          {mod && segs && (
            <>
              <div className="flex flex-wrap gap-1.5">
                {segs.map(([surface, key], i) => {
                  if (/^[。、！？「」『』・（）\s]+$/.test(surface)) return null;
                  const g = key ? mod.GLOSS[key] : undefined;
                  if (g) {
                    return (
                      <div key={i} className="rounded-lg border border-indigo-100 bg-white px-2 py-1 text-center">
                        <div className="text-base font-bold text-slate-900">{surface}</div>
                        <div className="text-[11px] text-rose-700">{surface !== key ? `${g[0]} (${key})` : g[0]}</div>
                        <div className="max-w-[9.5rem] text-[11px] leading-tight text-slate-600">{g[1]}</div>
                      </div>
                    );
                  }
                  return (
                    <div key={i} className="rounded-lg bg-slate-200/70 px-2 py-1 text-center">
                      <div className="text-base text-slate-800">{surface}</div>
                      {FUNC[surface] && <div className="max-w-[8rem] text-[11px] leading-tight text-slate-500">{FUNC[surface]}</div>}
                    </div>
                  );
                })}
              </div>
              <p className="mt-2 text-[10px] text-slate-400">Meanings: JMdict (CC BY-SA) — the dictionary&apos;s first sense; the sentence decides the exact nuance. Grey = grammar words.</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

interface LessonWord {
  key: string;
  reading: string;
  gloss: string;
  count: number;
}

export function LessonVocab({ sentences, title = "Words in this lesson" }: { sentences: string[]; title?: string }) {
  const [open, setOpen] = useState(false);
  const { mod, failed } = useGloss(open);
  const [testing, setTesting] = useState(false);

  const words = useMemo<LessonWord[]>(() => {
    if (!mod) return [];
    const counts = new Map<string, number>();
    for (const s of sentences) for (const [, key] of mod.SEGMENTS[s] ?? []) if (key && mod.GLOSS[key]) counts.set(key, (counts.get(key) ?? 0) + 1);
    return [...counts.entries()]
      .filter(([k]) => !/surname|place name|district|Park/.test(mod.GLOSS[k][1]))
      .sort((a, b) => b[1] - a[1])
      .slice(0, 28)
      .map(([key, count]) => ({ key, reading: mod.GLOSS[key][0], gloss: mod.GLOSS[key][1], count }));
  }, [mod, sentences]);

  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-bold">📝 {title}</h2>
        <button onClick={() => setOpen(!open)} className="rounded-lg bg-rose-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-rose-700">
          {open ? "Hide" : "Show words + test"}
        </button>
      </div>
      <p className="text-sm text-slate-500">English meanings of the words used in this lesson&apos;s sentences — learn them, then test yourself.</p>
      {open && (
        <div className="mt-3">
          {failed && <p className="text-sm text-red-600">Couldn&apos;t load the dictionary — check your connection once and try again.</p>}
          {!mod && !failed && <p className="text-sm text-slate-500">Loading dictionary…</p>}
          {mod && !testing && (
            <>
              <div className="grid gap-2 sm:grid-cols-2">
                {words.map((w) => (
                  <div key={w.key} className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2">
                    <SpeakBtn text={w.reading} />
                    <div className="min-w-0">
                      <div>
                        <span className="text-lg font-bold">{w.key}</span> <span className="text-sm text-rose-700">{w.reading}</span>
                      </div>
                      <div className="truncate text-sm text-slate-600">{w.gloss}</div>
                    </div>
                  </div>
                ))}
              </div>
              {words.length >= 4 && (
                <button onClick={() => setTesting(true)} className="mt-3 rounded-xl bg-indigo-600 px-4 py-2 font-semibold text-white">
                  🧪 Test my vocabulary ({Math.min(10, words.length)} questions)
                </button>
              )}
            </>
          )}
          {mod && testing && <MiniTest words={words} all={Object.entries(mod.GLOSS)} onClose={() => setTesting(false)} />}
        </div>
      )}
    </section>
  );
}

function shuffle<T>(a: T[]): T[] {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

function MiniTest({ words, all, onClose }: { words: LessonWord[]; all: [string, [string, string]][]; onClose: () => void }) {
  const qs = useMemo(() => {
    const picks = shuffle(words).slice(0, 10);
    return picks.map((w) => {
      const pool = shuffle([...words.filter((x) => x.key !== w.key).map((x) => x.gloss), ...all.filter(([k]) => k !== w.key).slice(0, 400).map(([, v]) => v[1])]);
      const wrong: string[] = [];
      for (const g of pool) if (g !== w.gloss && !wrong.includes(g)) wrong.push(g);
      return { w, opts: shuffle([w.gloss, ...wrong.slice(0, 3)]) };
    });
  }, [words, all]);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const done = i >= qs.length;

  if (done) {
    return (
      <div className="rounded-xl bg-slate-50 p-4 text-center">
        <div className="text-4xl">{score >= qs.length * 0.8 ? "🎉" : "📚"}</div>
        <div className="mt-1 text-xl font-bold">
          {score} / {qs.length}
        </div>
        <p className="text-sm text-slate-600">{score >= qs.length * 0.8 ? "Great vocabulary!" : "Read the word list again and retry."}</p>
        <div className="mt-3 flex justify-center gap-2">
          <button onClick={() => { setI(0); setScore(0); setPicked(null); }} className="rounded-xl bg-indigo-600 px-4 py-2 font-semibold text-white">↻ Try again</button>
          <button onClick={onClose} className="rounded-xl border border-slate-300 px-4 py-2">Back to list</button>
        </div>
      </div>
    );
  }
  const q = qs[i];
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <div className="mb-2 flex justify-between text-xs text-slate-500">
        <span>Question {i + 1} / {qs.length}</span>
        <button onClick={onClose} className="underline">close</button>
      </div>
      <div className="mb-3 flex items-center justify-center gap-2 text-center">
        <SpeakBtn text={q.w.reading} />
        <span className="text-3xl font-bold">{q.w.key}</span>
        {picked && <span className="text-rose-700">{q.w.reading}</span>}
      </div>
      <div className="grid gap-2">
        {q.opts.map((o) => {
          let cls = "border-slate-200 bg-white hover:border-indigo-300";
          if (picked) cls = o === q.w.gloss ? "border-emerald-500 bg-emerald-50" : o === picked ? "border-red-400 bg-red-50" : "border-slate-200 bg-white opacity-60";
          return (
            <button
              key={o}
              onClick={() => {
                if (picked) return;
                setPicked(o);
                if (o === q.w.gloss) setScore((s) => s + 1);
              }}
              className={`rounded-xl border-2 px-3 py-2 text-left text-sm ${cls}`}
            >
              {o}
            </button>
          );
        })}
      </div>
      {picked && (
        <div className="mt-3 flex justify-end">
          <button onClick={() => { setI(i + 1); setPicked(null); }} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
            {i + 1 >= qs.length ? "See result" : "Next →"}
          </button>
        </div>
      )}
    </div>
  );
}
