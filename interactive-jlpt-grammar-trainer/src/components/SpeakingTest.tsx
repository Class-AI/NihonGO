"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { isRomaji, toHiragana } from "wanakana";
import type { SpeakItem } from "@/lib/types";
import { evaluate, type CheckResult, type PatternRule } from "@/lib/check";
import { collapseRepeats, collectAlternatives, createRecognizer, isAndroid, isStandalone, toReading, type SRInstance } from "@/lib/speech";
import {
  WHISPER_MODELS,
  audioStats,
  isLikelyHallucination,
  loadWhisper,
  normalizeGain,
  startRecorder,
  transcribeWhisper,
  whisperSupported,
  type Recorder,
} from "@/lib/whisper";
import { JpLine, Pill } from "./ui";
import { WordBreakdown } from "./Words";

interface Props {
  items: SpeakItem[];
  rules: PatternRule[];
  passMark: number; // number of correct answers needed
  onFinish: (score: number, total: number) => void;
  combined?: boolean;
}

type Engine = "browser" | "whisper";
type Heard = CheckResult & { tried: number; others: string[]; engine: string };
type WState = { phase: "idle" | "loading" | "ready" | "error"; pct: number; msg: string };

const scoreOf = (e: CheckResult) => (e.passed ? 100 : 0) + e.patterns.filter((p) => p.ok).length * 12 + e.similarity * 40;

export default function SpeakingTest({ items, rules, passMark, onFinish, combined }: Props) {
  const [i, setI] = useState(0);
  const [results, setResults] = useState<(boolean | null)[]>(() => items.map(() => null));
  const [skipped, setSkipped] = useState<Record<number, boolean>>({});
  const [listening, setListening] = useState(false);
  const [live, setLive] = useState("");
  const [typed, setTyped] = useState("");
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<Heard | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [err, setErr] = useState("");
  const [srFailed, setSrFailed] = useState(false);
  const [done, setDone] = useState(false);
  const [level, setLevel] = useState(0);

  const [engine, setEngine] = useState<Engine>("browser");
  const [canBrowser, setCanBrowser] = useState(true);
  const [canWhisper, setCanWhisper] = useState(true);
  const [modelId, setModelId] = useState(WHISPER_MODELS[1].id);
  const [wState, setWState] = useState<WState>({ phase: "idle", pct: 0, msg: "" });

  // refs: recognizer + bookkeeping
  const recRef = useRef<SRInstance | null>(null);
  const recorderRef = useRef<Recorder | null>(null);
  const handledRef = useRef(false);
  const userStoppedRef = useRef(false);
  const restartsRef = useRef(0);
  const roundStartRef = useRef(0);
  const committedRef = useRef("");
  const sessionFinalRef = useRef("");
  const sessionInterimRef = useRef("");
  const sessionAltsRef = useRef<string[]>([]);
  const safetyTimer = useRef<number | null>(null);
  const redoModeRef = useRef(false);
  const loadedModelRef = useRef("");

  const [en, jp, reading] = items[i];

  // ------------------------------------------------------------ setup
  useEffect(() => {
    const sr = !!createRecognizer();
    const wh = whisperSupported();
    setCanBrowser(sr);
    setCanWhisper(wh);
    const savedModel = localStorage.getItem("np-whisper-model");
    if (savedModel && WHISPER_MODELS.some((m) => m.id === savedModel)) setModelId(savedModel);
    const saved = localStorage.getItem("np-mic-engine");
    if (saved === "whisper" && wh) setEngine("whisper");
    else if (saved === "browser" && sr) setEngine("browser");
    else setEngine(sr && !isStandalone() ? "browser" : wh ? "whisper" : "browser");
    return () => {
      handledRef.current = true;
      if (safetyTimer.current) window.clearTimeout(safetyTimer.current);
      recRef.current?.abort();
      recorderRef.current?.cancel();
    };
  }, []);

  const clearSafety = () => {
    if (safetyTimer.current) {
      window.clearTimeout(safetyTimer.current);
      safetyTimer.current = null;
    }
  };

  const chooseEngine = (e: Engine) => {
    setEngine(e);
    setErr("");
    setSrFailed(false);
    localStorage.setItem("np-mic-engine", e);
  };

  const chooseModel = (id: string) => {
    setModelId(id);
    localStorage.setItem("np-whisper-model", id);
    setWState({ phase: "idle", pct: 0, msg: "" });
  };

  const ensureModel = useCallback(async () => {
    if (loadedModelRef.current === modelId) return;
    setWState({ phase: "loading", pct: 0, msg: "" });
    try {
      await loadWhisper(modelId, (pct) => setWState({ phase: "loading", pct, msg: "" }));
      loadedModelRef.current = modelId;
      setWState({ phase: "ready", pct: 100, msg: "" });
    } catch (e) {
      setWState({ phase: "error", pct: 0, msg: e instanceof Error ? e.message : String(e) });
      throw e;
    }
  }, [modelId]);

  // ------------------------------------------------------------ per-sentence reset
  const resetItem = () => {
    clearSafety();
    handledRef.current = false;
    userStoppedRef.current = false;
    restartsRef.current = 0;
    committedRef.current = "";
    sessionFinalRef.current = "";
    sessionInterimRef.current = "";
    sessionAltsRef.current = [];
    recRef.current?.abort();
    recRef.current = null;
    recorderRef.current?.cancel();
    recorderRef.current = null;
    setListening(false);
    setChecking(false);
    setLive("");
    setLevel(0);
    setTyped("");
    setResult(null);
    setShowAnswer(false);
    setShowHint(false);
    setErr("");
  };

  // ------------------------------------------------------------ checking (ensemble over all hypotheses)
  const runCheck = async (cands: string[], engineName: string) => {
    const cleaned = Array.from(new Set(cands.map((c) => collapseRepeats(c, [jp, reading]).trim()).filter(Boolean))).slice(0, 6);
    if (!cleaned.length) {
      setErr("I didn't catch anything. Try again, speak clearly, or type your answer.");
      return;
    }
    setChecking(true);
    try {
      const evals = await Promise.all(
        cleaned.map(async (c) => {
          const plain = c.replace(/[\s'’.,!?]/g, "");
          const kana = plain && isRomaji(plain) ? toHiragana(c) : c;
          const r = await toReading(kana);
          return evaluate(kana, r, jp, reading, rules);
        }),
      );
      const best = evals.reduce((a, b) => (scoreOf(b) > scoreOf(a) ? b : a));
      setResult({ ...best, tried: cleaned.length, others: evals.filter((e) => e !== best).map((e) => e.heard), engine: engineName });
      setSkipped((s) => {
        if (!s[i]) return s;
        const copy = { ...s };
        delete copy[i];
        return copy;
      });
      setResults((arr) => arr.map((v, k) => (k === i ? best.passed || v === true : v)));
    } finally {
      setChecking(false);
    }
  };

  // ------------------------------------------------------------ ENGINE 1: browser speech service
  const finishBrowser = () => {
    if (handledRef.current) return;
    handledRef.current = true;
    clearSafety();
    setListening(false);
    const tail = sessionFinalRef.current || sessionInterimRef.current;
    const alts = sessionAltsRef.current.length ? [...sessionAltsRef.current] : [];
    if (tail && !alts.includes(tail)) alts.unshift(tail);
    const cands = alts.length ? alts.map((a) => committedRef.current + a) : committedRef.current ? [committedRef.current] : [];
    if (!cands.length) {
      setErr("Nothing was captured. Tap the mic and start speaking right away — or switch to Whisper AI below.");
      return;
    }
    void runCheck(cands, "Browser speech (best of n-best list)");
  };

  const startBrowser = () => {
    const rec = createRecognizer({ continuous: combined ? !isAndroid() : false });
    if (!rec) {
      setCanBrowser(false);
      return;
    }
    setErr("");
    setSrFailed(false);
    setResult(null);
    handledRef.current = false;
    userStoppedRef.current = false;
    restartsRef.current = 0;
    roundStartRef.current = Date.now();
    committedRef.current = "";
    sessionFinalRef.current = "";
    sessionInterimRef.current = "";
    sessionAltsRef.current = [];
    setLive("");

    rec.onresult = (e) => {
      // rebuild from ALL results every time (never append) — appending is what duplicated words on Android
      let fin = "";
      let inter = "";
      for (let k = 0; k < e.results.length; k++) {
        const r = e.results[k];
        if (r.isFinal) fin += r[0].transcript;
        else inter += r[0].transcript;
      }
      sessionFinalRef.current = fin;
      sessionInterimRef.current = inter;
      if (fin) sessionAltsRef.current = collectAlternatives(e.results);
      setLive(collapseRepeats(committedRef.current + fin + inter, [jp, reading]));
    };
    rec.onerror = (e) => {
      const code = e.error;
      if (code === "not-allowed" || code === "service-not-allowed") {
        setSrFailed(true);
        setErr("The browser's speech service is blocked here (normal inside the installed APK or when mic permission is off). Use Whisper AI below — it works in the app — or type.");
      } else if (code === "network") {
        setSrFailed(true);
        setErr("Browser speech needs internet. Switch to Whisper AI (works offline after one download) or type below.");
      } else if (code === "language-not-supported") {
        setSrFailed(true);
        setErr("This browser has no Japanese speech recognition. Use Whisper AI below or type.");
      } else if (code === "audio-capture") {
        setErr("No microphone found, or another app is using it.");
      } else if (code === "no-speech") {
        if (!handledRef.current && !userStoppedRef.current && listening) return;
        setErr("I didn't hear anything. Tap the mic and start speaking right away.");
      }
    };
    rec.onend = () => {
      if (recRef.current !== rec) return;
      const sessionText = sessionFinalRef.current || sessionInterimRef.current;
      if (userStoppedRef.current) {
        finishBrowser();
        return;
      }
      // long combined sentences: keep listening through pauses (text is kept, never duplicated)
      if (combined && sessionText && restartsRef.current < 4 && Date.now() - roundStartRef.current < 80000) {
        committedRef.current += sessionText;
        sessionFinalRef.current = "";
        sessionInterimRef.current = "";
        sessionAltsRef.current = [];
        restartsRef.current += 1;
        try {
          rec.start();
          return;
        } catch {
          /* fall through */
        }
      }
      finishBrowser();
    };
    recRef.current = rec;
    try {
      rec.start();
    } catch {
      setErr("Couldn't open the mic — another app may be using it. Close it and retry, or type below.");
      return;
    }
    setListening(true);
    clearSafety();
    safetyTimer.current = window.setTimeout(() => {
      userStoppedRef.current = true;
      try {
        rec.stop();
      } catch {
        /* already ended */
      }
      finishBrowser();
    }, 90000);
  };

  const stopBrowser = () => {
    userStoppedRef.current = true;
    const rec = recRef.current;
    if (rec) {
      try {
        rec.stop();
        return;
      } catch {
        /* ended already */
      }
    }
    finishBrowser();
  };

  // ------------------------------------------------------------ ENGINE 2: Whisper AI on the device
  const stopWhisper = async () => {
    const rec = recorderRef.current;
    if (!rec || handledRef.current) return;
    handledRef.current = true;
    recorderRef.current = null;
    setListening(false);
    setLevel(0);
    setChecking(true);
    try {
      let audio = await rec.stop();
      const stats = audioStats(audio);
      if (stats.seconds < 0.4 || stats.voicedRatio < 0.12 || stats.rms < 0.006) {
        setErr("I couldn't hear your voice clearly. Move the phone closer, speak a little louder, and tap the mic again.");
        return;
      }
      audio = normalizeGain(audio);
      if (loadedModelRef.current !== modelId) setWState({ phase: "loading", pct: 0, msg: "" });
      const text = await transcribeWhisper(modelId, audio, (pct) => setWState({ phase: "loading", pct, msg: "" }));
      loadedModelRef.current = modelId;
      setWState({ phase: "ready", pct: 100, msg: "" });
      if (isLikelyHallucination(text, stats)) {
        setErr("I couldn't make out a Japanese sentence. Please try again a bit louder (or type).");
        return;
      }
      setLive(text);
      await runCheck([text], `Whisper AI (${WHISPER_MODELS.find((m) => m.id === modelId)?.label ?? "base"})`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setWState({ phase: "error", pct: 0, msg });
      setErr(`Whisper couldn't run: ${msg}. Check your internet for the one-time model download, or type your answer.`);
    } finally {
      setChecking(false);
    }
  };

  const startWhisper = async () => {
    setErr("");
    setResult(null);
    setLive("");
    handledRef.current = false;
    if (!whisperSupported()) {
      setErr("This browser can't record audio for Whisper. Type your answer below instead.");
      return;
    }
    void ensureModel().catch(() => undefined); // download/warm up while you speak
    try {
      const rec = await startRecorder({
        silenceMs: combined ? 2600 : 1600,
        maxMs: 28000,
        onLevel: setLevel,
        onAutoStop: () => void stopWhisper(),
      });
      recorderRef.current = rec;
      setListening(true);
    } catch (e) {
      const name = e instanceof Error ? e.name : "";
      setErr(
        name === "NotAllowedError" || name === "SecurityError"
          ? "Microphone permission is off. Allow the microphone for this site/app (Settings → Apps → Permissions → Microphone), then tap the mic again."
          : "Couldn't open the microphone. Close other apps that use it and try again — or type below.",
      );
    }
  };

  // ------------------------------------------------------------ mic button
  const onMic = () => {
    if (listening) {
      if (engine === "whisper") void stopWhisper();
      else stopBrowser();
    } else if (engine === "whisper") void startWhisper();
    else startBrowser();
  };

  // ------------------------------------------------------------ navigation
  const markCorrect = () => setResults((arr) => arr.map((v, k) => (k === i ? true : v)));
  const skipCount = Object.keys(skipped).length;

  const finishNow = () => {
    redoModeRef.current = false;
    const score = results.filter(Boolean).length;
    setDone(true);
    onFinish(score, items.length);
  };

  const nextSkippedIndex = (from: number) =>
    Object.keys(skipped)
      .map(Number)
      .filter((k) => k > from)
      .sort((a, b) => a - b)[0];

  const goTo = (idx: number) => {
    setI(idx);
    resetItem();
  };

  const skip = () => {
    setSkipped((s) => ({ ...s, [i]: true }));
    if (redoModeRef.current) {
      const nxt = nextSkippedIndex(i);
      if (nxt !== undefined) return goTo(nxt);
    }
    if (i + 1 >= items.length) finishNow();
    else goTo(i + 1);
  };

  const redoSkipped = () => {
    const first = Object.keys(skipped)
      .map(Number)
      .sort((a, b) => a - b)[0];
    if (first === undefined) return;
    redoModeRef.current = true;
    setDone(false);
    goTo(first);
  };

  const next = () => {
    if (redoModeRef.current) {
      const nxt = nextSkippedIndex(i);
      if (nxt !== undefined) return goTo(nxt);
      return finishNow();
    }
    if (i + 1 >= items.length) finishNow();
    else goTo(i + 1);
  };

  // ------------------------------------------------------------ finished screen
  if (done) {
    const score = results.filter(Boolean).length;
    const passed = score >= passMark;
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="text-center">
          <div className="text-5xl">{passed ? "🏆" : "💪"}</div>
          <div className="mt-2 text-2xl font-bold">
            {score} / {items.length} sentences correct
          </div>
          <p className="mt-1 text-slate-600">
            {passed ? "Excellent! This section is complete." : `You need ${passMark}/${items.length}. Review the answers below and try again.`}
          </p>
          {skipCount > 0 && (
            <>
              <p className="mt-1 text-sm font-semibold text-amber-700">
                ↷ {skipCount} of {items.length} skipped — redo them to complete the section fairly.
              </p>
              <button onClick={redoSkipped} className="mt-3 rounded-xl bg-amber-500 px-5 py-2 font-semibold text-white hover:bg-amber-600">
                ↷ Redo skipped sentences ({skipCount})
              </button>
            </>
          )}
        </div>
        <div className="mt-6 space-y-4">
          {items.map(([e, j, r], k) => (
            <div key={k} className="rounded-xl border border-slate-100 p-3">
              <div className="mb-1 flex items-center gap-2 text-sm">
                {skipped[k] ? <Pill tone="amber">↷ skipped</Pill> : results[k] ? <Pill tone="green">✓</Pill> : <Pill tone="red">✗</Pill>}
                <span className="text-slate-600">{e}</span>
              </div>
              <JpLine reading={r} jp={j} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const correctSoFar = results.filter(Boolean).length;
  const micAvailable = engine === "whisper" ? canWhisper : canBrowser;
  const model = WHISPER_MODELS.find((m) => m.id === modelId) ?? WHISPER_MODELS[1];

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="mb-2 flex justify-between text-sm text-slate-500">
        <span>
          {combined ? "Combined sentence" : "Sentence"} {i + 1} / {items.length}
        </span>
        <span>
          ✓ {correctSoFar} (need {passMark})
          {skipCount > 0 && <span className="ml-2 text-amber-600">· ↷ {skipCount} skipped</span>}
        </span>
      </div>
      <div className="mb-5 h-1.5 rounded bg-slate-100">
        <div className="h-1.5 rounded bg-indigo-500 transition-all" style={{ width: `${(i / items.length) * 100}%` }} />
      </div>

      <div className="rounded-xl bg-indigo-50 p-4">
        <div className="text-xs font-semibold uppercase tracking-wide text-indigo-500">Say this in Japanese</div>
        <div className={`${combined ? "text-lg" : "text-2xl"} mt-1 font-semibold text-indigo-950`}>{en}</div>
        <div className="mt-2">
          {showHint ? (
            <div className="flex flex-wrap gap-1.5">
              {rules
                .filter((r) => evaluate(jp, reading, jp, reading, [r]).patterns.length > 0)
                .map((r) => (
                  <Pill key={r.label} tone="indigo">
                    {r.label}
                  </Pill>
                ))}
            </div>
          ) : (
            <button onClick={() => setShowHint(true)} className="text-sm text-indigo-600 underline">
              Show grammar hint
            </button>
          )}
        </div>
      </div>

      {/* engine picker */}
      <div className="mt-4 rounded-xl border border-slate-200 p-3 text-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-slate-700">🎤 Mic engine:</span>
          <button
            onClick={() => chooseEngine("browser")}
            disabled={!canBrowser || listening}
            className={`rounded-lg px-3 py-1.5 font-semibold ${engine === "browser" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"} disabled:opacity-40`}
          >
            ☁️ Browser (fast)
          </button>
          <button
            onClick={() => chooseEngine("whisper")}
            disabled={!canWhisper || listening}
            className={`rounded-lg px-3 py-1.5 font-semibold ${engine === "whisper" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700"} disabled:opacity-40`}
          >
            🧠 Whisper AI (accurate · works in APK)
          </button>
        </div>
        {engine === "whisper" && (
          <div className="mt-2 space-y-2">
            <div className="flex flex-wrap items-center gap-1.5">
              {WHISPER_MODELS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => chooseModel(m.id)}
                  disabled={listening || checking}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${modelId === m.id ? "bg-indigo-100 text-indigo-800 ring-1 ring-indigo-400" : "bg-slate-100 text-slate-600"}`}
                  title={m.note}
                >
                  {m.label} · {m.size}
                </button>
              ))}
              {wState.phase !== "ready" && wState.phase !== "loading" && (
                <button onClick={() => void ensureModel().catch(() => undefined)} className="rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-300">
                  ⬇ Download now
                </button>
              )}
            </div>
            <p className="text-xs text-slate-500">
              {model.note}. Open-source OpenAI Whisper runs <b>on your phone</b> — the one-time download is saved, then it works offline.
            </p>
            {wState.phase === "loading" && (
              <div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div className="h-2 rounded-full bg-indigo-500 transition-all" style={{ width: `${Math.max(4, wState.pct)}%` }} />
                </div>
                <p className="mt-1 text-xs text-slate-500">Loading AI model… {wState.pct}% (only the first time)</p>
              </div>
            )}
            {wState.phase === "ready" && <p className="text-xs font-semibold text-emerald-700">✓ AI model ready</p>}
            {wState.phase === "error" && <p className="text-xs text-red-600">Model problem: {wState.msg}</p>}
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-col items-center gap-3">
        {micAvailable ? (
          <button
            onClick={onMic}
            disabled={checking}
            className={`flex h-24 w-24 items-center justify-center rounded-full text-4xl text-white shadow-lg transition ${
              listening ? "animate-pulse bg-red-500" : "bg-rose-600 hover:bg-rose-700"
            } disabled:opacity-60`}
            aria-label={listening ? "Stop and check" : "Start speaking"}
          >
            {listening ? "■" : checking ? "…" : "🎤"}
          </button>
        ) : (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
            {engine === "whisper"
              ? "This browser can't record audio. "
              : "The browser's speech service isn't available here (iPhone Safari, or the installed APK). "}
            {canWhisper && engine !== "whisper" ? "Switch to 🧠 Whisper AI above, or " : ""}type your answer below — it is checked exactly the same way.
          </p>
        )}
        {listening && engine === "whisper" && (
          <div className="h-2 w-48 overflow-hidden rounded-full bg-slate-100" aria-hidden>
            <div className="h-2 rounded-full bg-emerald-500 transition-all" style={{ width: `${Math.round(level * 100)}%` }} />
          </div>
        )}
        <p className="text-sm text-slate-500">
          {listening ? (
            <span className="font-semibold text-red-600">
              🔴 Listening… {engine === "whisper" ? "speak now — it stops by itself when you finish (or press ■)" : combined ? "short pauses are OK — press ■ when done" : "speak now — it checks when you pause"}
            </span>
          ) : checking ? (
            "Thinking… (checking the words and grammar)"
          ) : micAvailable ? (
            "Tap the mic and speak in Japanese"
          ) : (
            ""
          )}
        </p>
        {live && !result && <div className="max-w-full break-words text-center text-xl text-slate-700">{live}</div>}
        {err && <p className="max-w-md text-center text-sm text-red-600">{err}</p>}
        {srFailed && canWhisper && engine !== "whisper" && (
          <button onClick={() => chooseEngine("whisper")} className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">
            🧠 Use Whisper AI instead
          </button>
        )}
      </div>

      {!result && (
        <form
          className="mt-4 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            void runCheck([typed], "Typed");
          }}
        >
          <input
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder="Or type: 日本語 / ひらがな / romaji (e.g. sushi wo tabeta koto ga arimasu)"
            className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-base focus:border-rose-400 focus:outline-none"
          />
          <button className="rounded-xl bg-slate-900 px-4 py-2 font-semibold text-white" disabled={checking}>
            Check
          </button>
        </form>
      )}

      {result && (
        <div className={`mt-5 rounded-xl border-2 p-4 ${result.passed ? "border-emerald-400 bg-emerald-50" : "border-amber-300 bg-amber-50"}`}>
          <div className="text-lg font-bold">
            {result.passed ? "✅ Correct!" : result.grammarOk ? "🟡 Grammar OK, sentence differs" : "❌ Grammar pattern missing"}
          </div>
          <div className="mt-2 text-sm text-slate-500">You said:</div>
          <div className="text-xl">{result.heardReading || result.heard}</div>
          <div className="text-slate-500">（{result.heard}）</div>
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {result.patterns.map((p) => (
              <Pill key={p.label} tone={p.ok ? "green" : "red"}>
                {p.ok ? "✓" : "✗"} {p.label}
              </Pill>
            ))}
            <Pill tone="slate">Match {Math.round(result.similarity * 100)}%</Pill>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Engine: {result.engine}
            {result.tried > 1 ? ` · compared ${result.tried} possible hearings and kept the best one` : ""}
          </p>
          {result.others.length > 0 && (
            <details className="mt-1 text-xs text-slate-500">
              <summary className="cursor-pointer">Other things it may have heard</summary>
              <ul className="mt-1 list-disc pl-5">
                {result.others.map((o) => (
                  <li key={o}>{o}</li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}

      {(result || showAnswer) && (
        <div className="mt-4 rounded-xl bg-slate-50 p-4">
          <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Model answer</div>
          <JpLine reading={reading} jp={jp} />
          <WordBreakdown jp={jp} />
        </div>
      )}

      <div className="mt-5 flex flex-wrap justify-end gap-2">
        {!result && !showAnswer && (
          <>
            <button
              onClick={skip}
              disabled={checking}
              className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800 hover:bg-amber-100 disabled:opacity-50"
            >
              ↷ Skip for now
            </button>
            <button onClick={() => setShowAnswer(true)} className="rounded-xl border border-slate-300 px-4 py-2 text-sm">
              Show answer (counts as wrong)
            </button>
          </>
        )}
        {result && (
          <button onClick={resetItem} className="rounded-xl border border-slate-300 px-4 py-2 text-sm">
            ↻ Try again
          </button>
        )}
        {result && !result.passed && results[i] !== true && (
          <button onClick={markCorrect} className="rounded-xl border border-emerald-400 px-4 py-2 text-sm text-emerald-700" title="Use if the mic misheard you">
            Mic misheard — count as correct
          </button>
        )}
        {(result || showAnswer) && (
          <button onClick={next} className="rounded-xl bg-indigo-600 px-5 py-2 font-semibold text-white">
            {i + 1 >= items.length ? "Finish" : "Next sentence →"}
          </button>
        )}
      </div>
    </div>
  );
}
