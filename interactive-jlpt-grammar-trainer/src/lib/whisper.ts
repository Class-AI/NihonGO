"use client";

/**
 * On-device speech recognition with OpenAI Whisper (open source, ONNX via transformers.js).
 * - Works in the installed APK (needs only getUserMedia, not the Google speech service).
 * - Model downloads once (cached by the browser), then works offline.
 * - A silence detector stops recording after you finish and prevents Whisper's silence hallucinations.
 */

export interface WhisperModelInfo {
  id: string;
  label: string;
  size: string;
  note: string;
}

export const WHISPER_MODELS: WhisperModelInfo[] = [
  { id: "onnx-community/whisper-tiny", label: "Fast", size: "≈ 41 MB", note: "quickest, fine for short sentences" },
  { id: "onnx-community/whisper-base", label: "Balanced", size: "≈ 77 MB", note: "recommended for most phones" },
  { id: "onnx-community/whisper-small", label: "Accurate", size: "≈ 250 MB", note: "best Japanese accuracy — use Wi-Fi, slower on old phones" },
];

type Listener = (m: Record<string, unknown>) => void;

let worker: Worker | null = null;
const listeners = new Set<Listener>();
let seq = 0;

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker("/whisper-worker.js", { type: "module" });
    worker.onmessage = (e: MessageEvent) => listeners.forEach((l) => l(e.data as Record<string, unknown>));
    worker.onerror = (e) => listeners.forEach((l) => l({ type: "error", id: -1, message: e.message || "worker failed" }));
  }
  return worker;
}

export function whisperSupported(): boolean {
  return typeof window !== "undefined" && typeof Worker !== "undefined" && !!navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== "undefined";
}

function call<T>(msg: Record<string, unknown>, transfer: Transferable[], onProgress?: (pct: number, loaded: number, total: number) => void): Promise<T> {
  const id = ++seq;
  return new Promise<T>((resolve, reject) => {
    const l: Listener = (m) => {
      if (m.id !== id && m.id !== -1) return;
      if (m.type === "progress") onProgress?.(Number(m.pct) || 0, Number(m.loaded) || 0, Number(m.total) || 0);
      else if (m.type === "ready" && msg.type === "load") {
        listeners.delete(l);
        resolve(undefined as T);
      } else if (m.type === "result") {
        listeners.delete(l);
        resolve(String(m.text ?? "") as T);
      } else if (m.type === "error") {
        listeners.delete(l);
        reject(new Error(String(m.message ?? "speech engine error")));
      }
    };
    listeners.add(l);
    getWorker().postMessage({ ...msg, id }, transfer);
  });
}

export function loadWhisper(model: string, onProgress?: (pct: number, loaded: number, total: number) => void) {
  return call<void>({ type: "load", model }, [], onProgress);
}

export function transcribeWhisper(model: string, audio: Float32Array, onProgress?: (pct: number, loaded: number, total: number) => void) {
  return call<string>({ type: "transcribe", model, audio }, [audio.buffer], onProgress);
}

// ---------------------------------------------------------------- recording

export interface Recorder {
  /** Stops recording and resolves with 16 kHz mono audio. */
  stop: () => Promise<Float32Array>;
  cancel: () => void;
}

export interface RecorderOptions {
  silenceMs: number; // stop this long after the last speech
  maxMs: number;
  onLevel?: (level: number) => void;
  onAutoStop?: () => void;
}

export async function startRecorder(opts: RecorderOptions): Promise<Recorder> {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true },
  });
  const mimeCandidates = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"];
  const mimeType = mimeCandidates.find((m) => MediaRecorder.isTypeSupported?.(m));
  const rec = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
  const chunks: Blob[] = [];
  rec.ondataavailable = (e) => {
    if (e.data.size) chunks.push(e.data);
  };

  // level meter + voice-activity detection
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const meterCtx = new AC();
  const analyser = meterCtx.createAnalyser();
  analyser.fftSize = 1024;
  meterCtx.createMediaStreamSource(stream).connect(analyser);
  const buf = new Float32Array(analyser.fftSize);
  const startedAt = Date.now();
  let lastSpeech = 0;
  let heard = false;
  let stopped = false;
  let noiseFloor = 0.004;

  const cleanup = () => {
    window.clearInterval(timer);
    stream.getTracks().forEach((t) => t.stop());
    void meterCtx.close().catch(() => undefined);
  };

  const stopRecording = () =>
    new Promise<Blob>((resolve) => {
      if (rec.state === "inactive") {
        resolve(new Blob(chunks, { type: rec.mimeType }));
        return;
      }
      rec.onstop = () => resolve(new Blob(chunks, { type: rec.mimeType || mimeType || "audio/webm" }));
      rec.stop();
    });

  let autoStopped = false;
  const timer = window.setInterval(() => {
    analyser.getFloatTimeDomainData(buf);
    let sum = 0;
    for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i];
    const rms = Math.sqrt(sum / buf.length);
    const now = Date.now();
    if (!heard) noiseFloor = Math.max(0.002, noiseFloor * 0.9 + rms * 0.1); // adapt to room noise until speech starts
    const threshold = Math.max(0.015, noiseFloor * 3);
    if (rms > threshold) {
      heard = true;
      lastSpeech = now;
    }
    opts.onLevel?.(Math.min(1, rms * 12));
    if (!stopped && !autoStopped && ((heard && now - lastSpeech > opts.silenceMs) || now - startedAt > opts.maxMs)) {
      autoStopped = true;
      opts.onAutoStop?.();
    }
  }, 90);

  rec.start(250);

  return {
    stop: async () => {
      stopped = true;
      const blob = await stopRecording();
      cleanup();
      return decodeTo16k(blob);
    },
    cancel: () => {
      stopped = true;
      try {
        if (rec.state !== "inactive") rec.stop();
      } catch {
        /* already stopped */
      }
      cleanup();
    },
  };
}

async function decodeTo16k(blob: Blob): Promise<Float32Array> {
  const data = await blob.arrayBuffer();
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  let decoded: AudioBuffer;
  try {
    const ctx = new AC({ sampleRate: 16000 });
    decoded = await ctx.decodeAudioData(data.slice(0));
    void ctx.close().catch(() => undefined);
  } catch {
    const ctx = new AC();
    decoded = await ctx.decodeAudioData(data.slice(0));
    void ctx.close().catch(() => undefined);
  }
  const ch = decoded.getChannelData(0);
  if (decoded.sampleRate === 16000) return new Float32Array(ch);
  // linear resample to 16 kHz
  const ratio = decoded.sampleRate / 16000;
  const out = new Float32Array(Math.floor(ch.length / ratio));
  for (let i = 0; i < out.length; i++) {
    const p = i * ratio;
    const i0 = Math.floor(p);
    const i1 = Math.min(i0 + 1, ch.length - 1);
    out[i] = ch[i0] + (ch[i1] - ch[i0]) * (p - i0);
  }
  return out;
}

export function audioStats(a: Float32Array): { peak: number; rms: number; seconds: number; voicedRatio: number } {
  let peak = 0;
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const v = Math.abs(a[i]);
    if (v > peak) peak = v;
    sum += a[i] * a[i];
  }
  const rms = Math.sqrt(sum / Math.max(1, a.length));
  // share of 50 ms frames that are clearly louder than the quietest frames
  const frame = 800;
  const energies: number[] = [];
  for (let s = 0; s + frame <= a.length; s += frame) {
    let e = 0;
    for (let i = s; i < s + frame; i++) e += a[i] * a[i];
    energies.push(Math.sqrt(e / frame));
  }
  const sorted = [...energies].sort((x, y) => x - y);
  const floor = sorted[Math.floor(sorted.length * 0.2)] ?? 0;
  const voiced = energies.filter((e) => e > Math.max(0.012, floor * 2.5)).length;
  return { peak, rms, seconds: a.length / 16000, voicedRatio: energies.length ? voiced / energies.length : 0 };
}

/** Normalise quiet recordings so Whisper hears them clearly. */
export function normalizeGain(a: Float32Array): Float32Array {
  let peak = 0;
  for (let i = 0; i < a.length; i++) peak = Math.max(peak, Math.abs(a[i]));
  if (peak < 0.02 || peak > 0.6) return a;
  const g = 0.7 / peak;
  const out = new Float32Array(a.length);
  for (let i = 0; i < a.length; i++) out[i] = a[i] * g;
  return out;
}

// Whisper invents these phrases when it is given silence/noise (its training data was subtitled videos)
const HALLUCINATIONS = [
  "ご視聴ありがとうございました",
  "ご視聴ありがとうございます",
  "ご清聴ありがとうございました",
  "チャンネル登録",
  "最後までご視聴",
  "字幕",
  "おやすみなさい",
  "ありがとうございました",
  "ありがとうございます",
];

export function isLikelyHallucination(text: string, stats: { rms: number; voicedRatio: number }): boolean {
  const t = text.replace(/[\s、。！!？?…・\-ー]/g, "");
  if (!t) return true;
  if (stats.voicedRatio < 0.12 || stats.rms < 0.006) return true;
  return HALLUCINATIONS.some((h) => t === h || (t.startsWith(h) && t.length <= h.length + 2)) && stats.voicedRatio < 0.35;
}
