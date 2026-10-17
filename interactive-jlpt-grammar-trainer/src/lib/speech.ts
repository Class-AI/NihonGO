"use client";

/** Text-to-speech in Japanese using the browser voice. */
export function speakJa(text: string, rate = 0.9) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "ja-JP";
  u.rate = rate;
  const voice = window.speechSynthesis.getVoices().find((v) => v.lang.startsWith("ja"));
  if (voice) u.voice = voice;
  window.speechSynthesis.speak(u);
}

// Minimal typings for the Web Speech API (not in lib.dom for all TS versions)
export interface SRAlternative {
  transcript: string;
  confidence: number;
}
export interface SRResult {
  isFinal: boolean;
  length: number;
  [i: number]: SRAlternative;
}
export interface SREvent {
  resultIndex: number;
  results: { length: number; [i: number]: SRResult };
}
export interface SRInstance {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: SREvent) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
}

export function isAndroid(): boolean {
  return typeof navigator !== "undefined" && /android/i.test(navigator.userAgent);
}

export function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(display-mode: standalone)").matches || (navigator as unknown as { standalone?: boolean }).standalone === true;
}

/**
 * Android Chrome's `continuous` mode re-sends the whole transcript with every result, which made
 * words appear several times ("日本日本日本"). On Android we therefore use single-utterance sessions;
 * on desktop continuous mode is fine.
 */
export function createRecognizer(opts: { continuous?: boolean } = {}): SRInstance | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SRInstance;
    webkitSpeechRecognition?: new () => SRInstance;
  };
  const C = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  if (!C) return null;
  const r = new C();
  r.lang = "ja-JP";
  r.interimResults = true;
  r.continuous = opts.continuous ?? !isAndroid();
  r.maxAlternatives = 5;
  return r;
}

/**
 * Removes accidental repetition ("日本日本日本" → "日本", a sentence heard twice → once) but keeps
 * doubled words that the EXPECTED answer really contains (いろいろ, ますます, だんだん…).
 */
export function collapseRepeats(text: string, refs: string[] = []): string {
  let t = text.replace(/\s+/g, " ").trim();
  const refStr = refs.join("|").replace(/\s+/g, "");
  for (let pass = 0; pass < 6; pass++) {
    const before = t;
    t = t.replace(/(.{2,80}?)(?: ?\1)+/gu, (m: string, unit: string) => {
      const u = unit.trim();
      if (!u) return m;
      if (refStr.includes(u + u)) return m;
      return unit;
    });
    if (t === before) break;
  }
  return t;
}

/** Collects up to N distinct hypotheses (n-best list) from a finished recognition result list. */
export function collectAlternatives(results: SREvent["results"]): string[] {
  const depth = 5;
  const out: string[] = [];
  for (let a = 0; a < depth; a++) {
    let s = "";
    let any = false;
    for (let k = 0; k < results.length; k++) {
      const r = results[k];
      const alt = r[a] ?? (a === 0 ? r[0] : undefined);
      if (alt) {
        s += alt.transcript;
        any = true;
      }
    }
    if (any && s.trim() && !out.includes(s.trim())) out.push(s.trim());
  }
  return out;
}

export async function toReading(text: string): Promise<string> {
  try {
    const res = await fetch("/api/reading", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    const d = (await res.json()) as { reading?: string };
    return d.reading ?? "";
  } catch {
    return "";
  }
}
