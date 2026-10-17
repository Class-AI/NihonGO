"use client";

import { useEffect, useMemo, useState } from "react";
import { vocab, vocabStats, type Vocab } from "@/data/vocab";
import { useProgress } from "@/lib/progress-context";
import { Pill, SpeakBtn } from "@/components/ui";

type Mode = "list" | "cards" | "quiz";
type Section = "all" | "reading" | "listening" | "daily";

const READING_CATS = new Set(["notices 📖", "society", "abstract"]);
const LISTENING_CATS = new Set(["conversation 🎧", "business 🎧", "formal"]);
const PAGE = 48;
const CUSTOM_KEY = "nihongo-custom-vocab";

function loadCustom(): Vocab[] {
  try {
    const raw = localStorage.getItem(CUSTOM_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as Vocab[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function toCsv(rows: Vocab[]) {
  const esc = (s: string) => `"${s.replace(/"/g, '""')}"`;
  return ["kanji,reading,english,tamil,level,category", ...rows.map((v) => [v.kanji, v.reading, v.en, v.ta, v.level, v.cat].map(esc).join(","))].join("\n");
}

export default function VocabPage() {
  const { map, save } = useProgress();
  const [level, setLevel] = useState<"all" | "N4" | "N3">("all");
  const [section, setSection] = useState<Section>("all");
  const [cat, setCat] = useState("all");
  const [q, setQ] = useState("");
  const [mode, setMode] = useState<Mode>("list");
  const [shown, setShown] = useState(PAGE);
  const [custom, setCustom] = useState<Vocab[]>([]);
  const [importOpen, setImportOpen] = useState(false);

  useEffect(() => {
    setCustom(loadCustom());
    // Links from the fast-track page, shared text (share_target), web+nihongo: links and word-list files opened with the app land here.
    const sp = new URLSearchParams(window.location.search);
    const incoming = sp.get("q") || sp.get("qt") || sp.get("qu") || "";
    if (incoming) setQ(incoming.replace(/^web\+nihongo:/i, "").slice(0, 80));
    if (sp.has("file")) setImportOpen(true);
  }, []);

  const all = useMemo(() => [...vocab, ...custom], [custom]);

  const cats = useMemo(() => {
    let pool = all.filter((v) => level === "all" || v.level === level);
    if (section === "reading") pool = pool.filter((v) => READING_CATS.has(v.cat));
    if (section === "listening") pool = pool.filter((v) => LISTENING_CATS.has(v.cat));
    return Array.from(new Set(pool.map((v) => v.cat))).sort();
  }, [all, level, section]);

  const list = useMemo(() => {
    let pool = all.filter((v) => level === "all" || v.level === level);
    if (section === "reading") pool = pool.filter((v) => READING_CATS.has(v.cat));
    if (section === "listening") pool = pool.filter((v) => LISTENING_CATS.has(v.cat));
    if (cat !== "all") pool = pool.filter((v) => v.cat === cat);
    if (q) pool = pool.filter((v) => `${v.kanji}${v.reading}${v.en}${v.ta}`.toLowerCase().includes(q.toLowerCase()));
    if (section === "daily") {
      const unknown = pool.filter((v) => !map[`v:${v.id}`]?.completed);
      const day = new Date().toISOString().slice(0, 10);
      let seed = 0;
      for (const c of day) seed = (seed * 31 + c.charCodeAt(0)) >>> 0;
      const start = unknown.length ? seed % unknown.length : 0;
      const rotated = unknown.length ? [...unknown.slice(start), ...unknown.slice(0, start)] : [];
      return (rotated.length ? rotated : pool).slice(0, 20);
    }
    return pool;
  }, [all, level, section, cat, q, map]);

  useEffect(() => {
    setShown(PAGE);
  }, [level, section, cat, q, mode]);

  const known = all.filter((v) => map[`v:${v.id}`]?.completed).length;
  const knownN4 = all.filter((v) => v.level === "N4" && map[`v:${v.id}`]?.completed).length;
  const knownN3 = all.filter((v) => v.level === "N3" && map[`v:${v.id}`]?.completed).length;

  const exportCsv = () => {
    const blob = new Blob([toCsv(list)], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `nihongo-vocab-${level}-${section}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const sections: { k: Section; label: string; hint: string }[] = [
    { k: "all", label: "📚 All words", hint: "full dictionary" },
    { k: "reading", label: "📖 Reading pack", hint: "notices · news · essays" },
    { k: "listening", label: "🎧 Listening pack", hint: "conversation · keigo · phone" },
    { k: "daily", label: "📝 Daily 20", hint: "20 unknown words / day" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">🗂 Vocabulary · 語彙 with Tamil memory links</h1>
        <p className="mt-1 text-slate-600">
          <b>{vocabStats.total}+ built-in words</b> (N4: {vocabStats.n4} · N3: {vocabStats.n3}
          {custom.length ? ` · +${custom.length} imported` : ""}) — every word has Tamil meaning + memory hook. Known: {known}/{all.length} (N4 {knownN4} · N3 {knownN3}).
        </p>
        <p className="mt-1 text-sm text-slate-500">
          Full N3 needs ≈3,700 words — this pack covers the highest-yield exam words for all 3 sections (文字語彙・読解・聴解). Import the rest below or export to Anki.
        </p>
      </div>

      <div className="grid gap-2 sm:grid-cols-4">
        {sections.map((s) => (
          <button
            key={s.k}
            onClick={() => { setSection(s.k); setCat("all"); }}
            className={`rounded-2xl border-2 p-3 text-left transition ${section === s.k ? "border-rose-500 bg-rose-50" : "border-transparent bg-white shadow-sm hover:border-rose-200"}`}
          >
            <div className="font-bold">{s.label}</div>
            <div className="text-xs text-slate-500">{s.hint}</div>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-white p-3 shadow-sm">
        {(["all", "N4", "N3"] as const).map((l) => (
          <button key={l} onClick={() => { setLevel(l); setCat("all"); }} className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${level === l ? "bg-rose-600 text-white" : "bg-slate-100"}`}>
            {l === "all" ? "All levels" : l}
          </button>
        ))}
        <select value={cat} onChange={(e) => setCat(e.target.value)} className="max-w-44 rounded-lg border border-slate-200 px-2 py-1.5 text-sm">
          <option value="all">All categories</option>
          {cats.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search (English / Tamil / 日本語)" className="min-w-40 flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm" />
        <div className="flex gap-1">
          {(["list", "cards", "quiz"] as Mode[]).map((m) => (
            <button key={m} onClick={() => setMode(m)} className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${mode === m ? "bg-slate-900 text-white" : "bg-slate-100"}`}>
              {m === "list" ? "📋 List" : m === "cards" ? "🃏 Cards" : "❓ Quiz"}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-slate-600">
        <span>Showing {Math.min(shown, list.length)} / {list.length} words</span>
        <div className="flex gap-2">
          <button onClick={exportCsv} disabled={!list.length} className="rounded-lg bg-white px-3 py-1.5 shadow-sm hover:bg-slate-50 disabled:opacity-50">⬇ Export CSV (Anki)</button>
          <button onClick={() => setImportOpen(!importOpen)} className="rounded-lg bg-white px-3 py-1.5 shadow-sm hover:bg-slate-50">⬆ Import words</button>
        </div>
      </div>

      {importOpen && <Importer level={level === "all" ? "N3" : level} onAdd={(vs) => { const next = [...custom, ...vs]; setCustom(next); localStorage.setItem(CUSTOM_KEY, JSON.stringify(next)); }} onClear={() => { setCustom([]); localStorage.removeItem(CUSTOM_KEY); }} count={custom.length} />}

      {list.length === 0 && <p className="text-slate-500">No words match.</p>}
      {mode === "list" && list.length > 0 && (
        <>
          <div className="grid gap-3 md:grid-cols-2">
            {list.slice(0, shown).map((v) => {
              const isKnown = !!map[`v:${v.id}`]?.completed;
              return (
                <div key={v.id} className={`rounded-2xl bg-white p-4 shadow-sm ${isKnown ? "ring-2 ring-emerald-300" : ""}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <SpeakBtn text={v.reading} />
                      <div>
                        <div className="text-2xl font-bold">{v.kanji}</div>
                        <div className="text-slate-500">{v.reading}</div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Pill tone={v.level === "N4" ? "rose" : "indigo"}>{v.level}</Pill>
                      <span className="text-[11px] text-slate-400">{v.cat}</span>
                      <button onClick={() => void save(`v:${v.id}`, { completed: true })} disabled={isKnown} className={`text-xs ${isKnown ? "text-emerald-600" : "text-slate-400 underline"}`}>
                        {isKnown ? "✓ known" : "mark known"}
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 font-medium">{v.en}</div>
                  <div className="text-amber-800">🪷 {v.ta}</div>
                  <div className="mt-1 text-sm text-slate-600">💡 {v.hook}</div>
                </div>
              );
            })}
          </div>
          {shown < list.length && (
            <div className="text-center">
              <button onClick={() => setShown((s) => s + PAGE)} className="rounded-xl bg-slate-900 px-6 py-2.5 font-semibold text-white">
                Show more ({list.length - shown} left)
              </button>
            </div>
          )}
        </>
      )}
      {mode === "cards" && list.length > 0 && <Flashcards key={`${section}-${level}-${cat}-${q}`} list={list} onKnown={(v) => void save(`v:${v.id}`, { completed: true })} />}
      {mode === "quiz" && list.length >= 4 && <VocabQuiz key={`${section}-${level}-${cat}-${q}`} list={list} />}
      {mode === "quiz" && list.length > 0 && list.length < 4 && <p className="text-slate-500">Need at least 4 words for a quiz — widen the filter.</p>}
    </div>
  );
}

function Importer({ level, onAdd, onClear, count }: { level: "N4" | "N3"; onAdd: (v: Vocab[]) => void; onClear: () => void; count: number }) {
  const [text, setText] = useState("");
  const [msg, setMsg] = useState("");
  const parse = () => {
    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
    const out: Vocab[] = [];
    for (const line of lines) {
      const parts = line.split(/[\t,;|]/).map((p) => p.trim());
      if (parts.length < 2) continue;
      const [kanji, reading = "", en = "", ta = ""] = parts;
      out.push({ id: `custom-${Date.now()}-${out.length}-${kanji}`, level, cat: "imported", kanji, reading: reading || kanji, en: en || kanji, ta: ta || "—", hook: "Imported word — add your own Tamil hook!" });
    }
    if (!out.length) { setMsg("No valid lines. Format: kanji, reading, english, tamil (one per line)."); return; }
    onAdd(out);
    setText("");
    setMsg(`✓ Added ${out.length} words to your ${level} list (saved on this device).`);
  };
  return (
    <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white p-4">
      <div className="font-bold">⬆ Import your own words ({count} imported)</div>
      <p className="text-sm text-slate-600">Paste a JLPT list (one word per line): <code className="rounded bg-slate-100 px-1">kanji, reading, english, tamil</code> — commas, tabs or | all work. They join your {level} list and flashcards. Free full lists: JLPT Sensei, Tanos, Anki Core decks.</p>
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} placeholder={"我慢,がまん,patience,பொறுமை\n改善,かいぜん,improve,மேம்படுத்து"} className="mt-2 w-full rounded-xl border border-slate-200 p-2 font-mono text-sm" />
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button onClick={parse} className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white">Add to my list</button>
        {count > 0 && <button onClick={onClear} className="text-sm text-slate-400 underline">clear imported</button>}
        {msg && <span className="text-sm text-emerald-700">{msg}</span>}
      </div>
    </div>
  );
}

function Flashcards({ list, onKnown }: { list: Vocab[]; onKnown: (v: Vocab) => void }) {
  const [i, setI] = useState(0);
  const [flip, setFlip] = useState(false);
  const v = list[i % list.length];
  const go = (d: number) => {
    setFlip(false);
    setI((x) => (x + d + list.length) % list.length);
  };
  return (
    <div className="mx-auto max-w-md">
      <button onClick={() => setFlip(!flip)} className="flex h-72 w-full flex-col items-center justify-center rounded-3xl bg-white p-6 text-center shadow-md">
        {!flip ? (
          <>
            <div className="text-5xl font-bold">{v.kanji}</div>
            <div className="mt-3 text-sm text-slate-400">tap to flip</div>
          </>
        ) : (
          <>
            <div className="text-2xl text-slate-600">{v.reading}</div>
            <div className="mt-2 text-xl font-semibold">{v.en}</div>
            <div className="text-amber-800">🪷 {v.ta}</div>
            <div className="mt-2 text-sm text-slate-600">💡 {v.hook}</div>
          </>
        )}
      </button>
      <div className="mt-4 flex items-center justify-between gap-2">
        <button onClick={() => go(-1)} className="rounded-xl bg-white px-4 py-2 shadow-sm">←</button>
        <SpeakBtn text={v.reading} label="🔊 Listen" />
        <span className="text-sm text-slate-500">{(i % list.length) + 1}/{list.length}</span>
        <button onClick={() => { onKnown(v); go(1); }} className="rounded-xl bg-emerald-600 px-4 py-2 text-white">I know it ✓</button>
        <button onClick={() => go(1)} className="rounded-xl bg-white px-4 py-2 shadow-sm">→</button>
      </div>
    </div>
  );
}

type QType = "meaning" | "kanji" | "tamil";

function VocabQuiz({ list }: { list: Vocab[] }) {
  const [qtype, setQtype] = useState<QType>("meaning");
  const make = () => {
    const v = list[Math.floor(Math.random() * list.length)];
    const others = list.filter((x) => x.id !== v.id).sort(() => Math.random() - 0.5).slice(0, 3);
    return { v, opts: [v, ...others].sort(() => Math.random() - 0.5) };
  };
  const [cur, setCur] = useState(make);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState({ ok: 0, total: 0 });
  const answerKanji = qtype !== "meaning";
  const types: { k: QType; label: string }[] = [
    { k: "meaning", label: "漢字 → meaning" },
    { k: "kanji", label: "meaning → 漢字" },
    { k: "tamil", label: "Tamil → 漢字" },
  ];
  const reset = (k: QType) => {
    setQtype(k);
    setCur(make());
    setPicked(null);
    setScore({ ok: 0, total: 0 });
  };
  return (
    <div className="mx-auto max-w-lg rounded-2xl bg-white p-6 shadow-sm">
      <div className="mb-3 flex flex-wrap gap-1">
        {types.map((t) => (
          <button key={t.k} onClick={() => reset(t.k)} className={`rounded-lg px-3 py-1 text-sm font-semibold ${qtype === t.k ? "bg-slate-900 text-white" : "bg-slate-100"}`}>
            {t.label}
          </button>
        ))}
      </div>
      <div className="text-sm text-slate-500">Score {score.ok}/{score.total}</div>
      <div className="my-4 text-center">
        {qtype === "meaning" && (
          <>
            <div className="text-5xl font-bold">{cur.v.kanji}</div>
            {picked && <div className="mt-1 text-slate-500">{cur.v.reading}</div>}
          </>
        )}
        {qtype === "kanji" && (
          <>
            <div className="text-2xl font-bold">{cur.v.en}</div>
            <div className="text-amber-800">🪷 {cur.v.ta}</div>
          </>
        )}
        {qtype === "tamil" && <div className="text-3xl font-bold text-amber-800">{cur.v.ta}</div>}
      </div>
      <div className="grid gap-2">
        {cur.opts.map((o) => {
          let cls = "border-slate-200 hover:bg-rose-50";
          if (picked) cls = o.id === cur.v.id ? "border-emerald-500 bg-emerald-50" : o.id === picked ? "border-red-400 bg-red-50" : "border-slate-200 opacity-60";
          return (
            <button
              key={o.id}
              onClick={() => {
                if (picked) return;
                setPicked(o.id);
                setScore((sc) => ({ ok: sc.ok + (o.id === cur.v.id ? 1 : 0), total: sc.total + 1 }));
              }}
              className={`rounded-xl border-2 px-4 py-2 text-left ${cls}`}
            >
              {answerKanji ? (
                <>
                  <span className="text-xl font-bold">{o.kanji}</span> {picked && <span className="text-sm text-slate-500">{o.reading}</span>}
                </>
              ) : (
                <>
                  {o.en} <span className="text-sm text-amber-700">· {o.ta}</span>
                </>
              )}
            </button>
          );
        })}
      </div>
      {picked && (
        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm text-slate-600">
            {qtype === "tamil" ? `${cur.v.kanji} (${cur.v.reading}) = ${cur.v.en} — ` : ""}💡 {cur.v.hook}
          </span>
          <button onClick={() => { setCur(make()); setPicked(null); }} className="ml-3 shrink-0 rounded-xl bg-slate-900 px-4 py-2 text-white">Next →</button>
        </div>
      )}
    </div>
  );
}
