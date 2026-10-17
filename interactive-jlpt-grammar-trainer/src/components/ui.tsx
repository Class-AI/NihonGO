"use client";

import { speakJa } from "@/lib/speech";

export function SpeakBtn({ text, label = "🔊", className = "" }: { text: string; label?: string; className?: string }) {
  return (
    <button
      type="button"
      onClick={() => speakJa(text)}
      title="Listen"
      className={`inline-flex items-center justify-center rounded-full bg-rose-50 px-2.5 py-1 text-sm text-rose-700 hover:bg-rose-100 ${className}`}
    >
      {label}
    </button>
  );
}

/** Shows hiragana first, kanji in brackets — the format requested for answers. */
export function JpLine({ reading, jp, en, big = false }: { reading: string; jp: string; en?: string; big?: boolean }) {
  return (
    <div className="flex items-start gap-3">
      <SpeakBtn text={jp} className="mt-1 shrink-0" />
      <div>
        <div className={`${big ? "text-2xl" : "text-lg"} font-medium leading-relaxed text-slate-900`}>{reading}</div>
        <div className={`${big ? "text-lg" : "text-base"} text-slate-500`}>（{jp}）</div>
        {en && <div className="text-sm italic text-slate-500">{en}</div>}
      </div>
    </div>
  );
}

export function Pill({ children, tone = "slate" }: { children: React.ReactNode; tone?: "slate" | "green" | "red" | "amber" | "rose" | "indigo" }) {
  const tones: Record<string, string> = {
    slate: "bg-slate-100 text-slate-700",
    green: "bg-emerald-100 text-emerald-800",
    red: "bg-red-100 text-red-700",
    amber: "bg-amber-100 text-amber-800",
    rose: "bg-rose-100 text-rose-700",
    indigo: "bg-indigo-100 text-indigo-700",
  };
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${tones[tone]}`}>{children}</span>;
}
