import Link from "next/link";

export const metadata = { title: "Offline — Nihongo Path" };

export default function OfflinePage() {
  return (
    <div className="mx-auto max-w-lg rounded-3xl bg-white p-8 text-center shadow-sm">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-600 text-3xl font-bold text-white">日</div>
      <h1 className="mt-4 text-2xl font-bold">You&apos;re offline</h1>
      <p className="mt-2 text-slate-600">
        This page hasn&apos;t been saved on your phone yet. Lessons you opened before (and everything you saved with <b>“Save all lessons for offline”</b>) still work.
      </p>
      <p className="mt-2 text-sm text-slate-500">🎤 Speaking tests and 🔊 audio need internet (they use your phone&apos;s online speech service).</p>
      <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">இணைய இணைப்பு இல்லை. முன்பு திறந்த பாடங்கள் offline-லும் வேலை செய்யும்.</p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        <Link href="/" className="rounded-xl bg-rose-600 px-5 py-2 font-semibold text-white">Grammar path</Link>
        <Link href="/vocab" className="rounded-xl border border-slate-300 px-5 py-2 font-semibold">Vocabulary</Link>
      </div>
    </div>
  );
}
