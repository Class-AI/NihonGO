"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { InstallButton } from "@/components/PwaRegister";
import { allGrammar, units } from "@/data";

type Check = { label: string; ok: boolean; detail: string };
interface ManifestLite {
  name?: string;
  short_name?: string;
  start_url?: string;
  display?: string;
  icons?: { sizes?: string; purpose?: string }[];
  screenshots?: unknown[];
}

const PRIVATE_HOST = /(arena\.site|arena\.ai|e2b\.app|e2b\.dev)$|^localhost$|^127\.|\.local$/i;

async function runChecks(): Promise<Check[]> {
  const out: Check[] = [];
  const host = location.hostname;
  const isPrivate = PRIVATE_HOST.test(host);
  out.push({
    label: "Public web address",
    ok: !isPrivate,
    detail: isPrivate
      ? `${host} is a private preview address — PWABuilder can't open it (it gets "Preview Unavailable"). Do Step 1 first.`
      : `${location.origin} — PWABuilder can read this address.`,
  });
  out.push({ label: "HTTPS (secure connection)", ok: window.isSecureContext && location.protocol === "https:", detail: location.protocol });

  const link = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
  out.push({ label: "Manifest linked in the page", ok: !!link, detail: link ? link.getAttribute("href") ?? "" : "No <link rel=\"manifest\"> found" });

  let m: ManifestLite | null = null;
  try {
    const r = await fetch(link?.href ?? "/manifest.webmanifest", { cache: "no-store" });
    m = r.ok ? ((await r.json()) as ManifestLite) : null;
  } catch {
    m = null;
  }
  out.push({
    label: "Manifest: name, start page, standalone",
    ok: !!(m?.name && m.short_name && m.start_url && m.display === "standalone"),
    detail: m ? `${m.short_name} · start ${m.start_url} · ${m.display}` : "Couldn't load the manifest",
  });
  const icons = m?.icons ?? [];
  const has = (size: string, purpose?: string) =>
    icons.some((i) => (i.sizes ?? "").split(" ").includes(size) && (!purpose || (i.purpose ?? "any").split(" ").includes(purpose)));
  out.push({ label: "Icons: 192px, 512px and maskable", ok: has("192x192") && has("512x512") && has("512x512", "maskable"), detail: `${icons.length} icons listed` });
  out.push({ label: "Screenshots for the install dialog", ok: (m?.screenshots?.length ?? 0) > 0, detail: `${m?.screenshots?.length ?? 0} screenshots` });

  // download every icon / shortcut icon / screenshot, exactly like PWABuilder does
  const files = [
    ...((m?.icons ?? []) as { src?: string }[]).map((i) => i.src),
    ...((m?.screenshots ?? []) as { src?: string }[]).map((i) => i.src),
    ...(((m as { shortcuts?: { icons?: { src?: string }[] }[] } | null)?.shortcuts ?? []).flatMap((s) => (s.icons ?? []).map((i) => i.src))),
  ].filter((x): x is string => !!x);
  const unique = Array.from(new Set(files));
  const bad: string[] = [];
  for (const src of unique) {
    try {
      const r = await fetch(src, { cache: "no-store" });
      if (!r.ok || !(r.headers.get("content-type") ?? "").startsWith("image/png")) bad.push(`${src} (${r.status})`);
    } catch {
      bad.push(`${src} (failed)`);
    }
  }
  out.push({ label: "All icons, shortcut icons & screenshots download as PNG", ok: unique.length > 0 && bad.length === 0, detail: bad.length ? `Problem: ${bad.join(", ")}` : `${unique.length} files OK` });

  let active = false;
  let scope = "";
  try {
    const reg = await navigator.serviceWorker?.getRegistration();
    active = !!reg?.active;
    scope = reg?.scope ?? "";
  } catch {
    active = false;
  }
  out.push({ label: "Service worker active (offline support)", ok: active, detail: active ? `scope ${scope}` : "Not active yet — reload this page once and check again" });

  let offlineSaved = false;
  try {
    offlineSaved = typeof caches !== "undefined" && !!(await caches.match("/offline", { ignoreSearch: true, ignoreVary: true }));
  } catch {
    offlineSaved = false;
  }
  out.push({ label: "Offline page saved on this device", ok: offlineSaved, detail: offlineSaved ? "The app opens even without internet" : "Saved automatically after the service worker installs (reload once)" });
  return out;
}

function ReadinessCheck() {
  const [checks, setChecks] = useState<Check[] | null>(null);
  const [busy, setBusy] = useState(false);
  const run = async () => {
    setBusy(true);
    setChecks(await runChecks());
    setBusy(false);
  };
  useEffect(() => {
    void run();
  }, []);
  const allOk = !!checks && checks.every((c) => c.ok);
  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-bold">✅ Step 2 — PWA readiness check (for this address)</h2>
        <button onClick={run} disabled={busy} className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50">
          {busy ? "Checking…" : "↻ Check again"}
        </button>
      </div>
      <p className="mt-1 text-sm text-slate-600">Open this page on your public address. When every line is green, PWABuilder will accept it.</p>
      <ul className="mt-3 space-y-2">
        {(checks ?? []).map((c) => (
          <li key={c.label} className={`flex gap-3 rounded-xl p-3 ${c.ok ? "bg-emerald-50" : "bg-red-50"}`}>
            <span className="text-lg">{c.ok ? "✅" : "❌"}</span>
            <div>
              <div className={`font-semibold ${c.ok ? "text-emerald-900" : "text-red-900"}`}>{c.label}</div>
              <div className="break-all text-sm text-slate-600">{c.detail}</div>
            </div>
          </li>
        ))}
      </ul>
      {checks && (
        <p className={`mt-3 rounded-xl p-3 text-sm font-semibold ${allOk ? "bg-emerald-100 text-emerald-900" : "bg-amber-50 text-amber-900"}`}>
          {allOk ? "🎉 Ready! Paste this address into PWABuilder (Step 3)." : "Fix the red lines first. A private preview address will always fail the first check — that's expected."}
        </p>
      )}
    </section>
  );
}

function OfflineSaver() {
  const [state, setState] = useState<{ done: number; failed: number; total: number; finished: boolean } | null>(null);
  const [error, setError] = useState("");
  const urls = ["/", "/vocab", "/reading", "/listening", "/tamil", "/exam", "/install", "/offline", ...allGrammar.map((g) => `/grammar/${g.id}`), ...units.map((u) => `/review/${u.id}`)];

  const start = async () => {
    setError("");
    if (!("serviceWorker" in navigator)) {
      setError("This browser doesn't support offline saving.");
      return;
    }
    const reg = await Promise.race([navigator.serviceWorker.ready, new Promise<null>((r) => setTimeout(() => r(null), 8000))]);
    const sw = reg?.active;
    if (!sw) {
      setError("The service worker isn't active yet — reload the page once and try again.");
      return;
    }
    setState({ done: 0, failed: 0, total: urls.length, finished: false });
    const ch = new MessageChannel();
    ch.port1.onmessage = (e: MessageEvent<{ type: string; done: number; failed: number; total: number }>) =>
      setState({ done: e.data.done, failed: e.data.failed, total: e.data.total, finished: e.data.type === "complete" });
    sw.postMessage({ type: "PRECACHE_PAGES", urls }, [ch.port2]);
  };

  const pct = state ? Math.round(((state.done + state.failed) / state.total) * 100) : 0;
  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold">📥 Save all lessons for offline</h2>
      <p className="mt-1 text-slate-600">
        Downloads all {allGrammar.length} grammar lessons, {units.length} combined exams, vocabulary, reading and listening pages (a few MB) so they open with no internet — on a train, in class, anywhere.
      </p>
      <button onClick={start} disabled={!!state && !state.finished} className="mt-3 rounded-xl bg-rose-600 px-5 py-2.5 font-semibold text-white disabled:opacity-60">
        {state && !state.finished ? `Saving… ${pct}%` : state?.finished ? "↻ Save again (update)" : "📥 Save everything for offline"}
      </button>
      {state && (
        <div className="mt-3">
          <div className="h-2 rounded-full bg-slate-100">
            <div className="h-2 rounded-full bg-rose-500 transition-all" style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-1 text-sm text-slate-600">
            {state.done}/{state.total} pages saved{state.failed ? ` · ${state.failed} failed (try again online)` : ""} {state.finished && !state.failed ? "— all set! ✅" : ""}
          </p>
        </div>
      )}
      {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
      <p className="mt-2 text-xs text-slate-500">🎤 Speaking tests and 🔊 audio use your phone&apos;s online speech service, so they still need internet.</p>
    </section>
  );
}

export default function InstallPage() {
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  useEffect(() => {
    setOrigin(window.location.origin);
    setIsPrivate(PRIVATE_HOST.test(window.location.hostname));
  }, []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(origin);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked */
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-gradient-to-br from-rose-600 to-orange-500 p-8 text-white shadow">
        <h1 className="text-3xl font-bold">📲 Get Nihongo Path as an Android app (APK)</h1>
        <p className="mt-2 max-w-3xl text-rose-50">
          The app is a complete PWA: manifest, icons, screenshots, offline service worker. PWABuilder turns it into an APK — it just needs a <b>public web address</b>.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <InstallButton className="rounded-xl bg-white px-5 py-3 font-semibold text-rose-700 shadow hover:bg-rose-50" label="📲 Install now (1 tap, no APK needed)" />
          <span className="text-sm text-rose-100">Or Chrome menu ⋮ → “Install app” / “Add to Home screen”.</span>
        </div>
      </section>

      <section className="rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-6">
        <h2 className="text-xl font-bold text-emerald-950">✅ Icons & screenshots can no longer go missing</h2>
        <p className="mt-2 text-emerald-950">
          PWABuilder showed &quot;Fix the links to your icons&quot; when a deploy dropped the picture files (a 404 on <code className="rounded bg-white px-1 text-sm">/icons/icon-512.png</code>). The app now stores every icon,
          screenshot and the favicon as <b>text inside the source code</b> and serves them at the same addresses — a text file cannot be dropped by an upload.
        </p>
        <p className="mt-2 text-emerald-950">
          To double-check after you deploy: open <code className="rounded bg-white px-1 text-sm">https://YOUR-SITE/icons/icon-512.png</code> — you must see the red 日 icon — then press <b>↻</b> in PWABuilder.
          The readiness check in Step 2 below also downloads every file for you.
        </p>
        {isPrivate && (
          <p className="mt-3 rounded-xl bg-white p-3 text-sm font-semibold text-red-700">
            You are on a private preview address right now ({origin}). Don&apos;t paste this one into PWABuilder — use your public address.
          </p>
        )}
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold">🎤 Speaking test inside the app</h2>
        <p className="mt-1 text-slate-700">
          The phone browser&apos;s speech service often isn&apos;t available inside an installed APK. In the speaking test choose <b>🧠 Whisper AI</b>: an open-source speech model that runs on the phone (one download, then it works offline).
          If it can&apos;t hear you, allow the microphone: <b>Settings → Apps → Nihongo Path → Permissions → Microphone</b>. You can always type the sentence or press <b>Skip</b>.
        </p>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold">🌐 Step 1 — Put the app on a public address (free, ~10 min)</h2>
        <p className="mt-1 text-slate-600">No database or settings are needed — progress is saved on the phone. (If you add a <code>DATABASE_URL</code>, progress is also backed up online.)</p>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-slate-700">
          <li>
            If Arena Code has a <b>Publish / Deploy</b> option with a public link, use it — test that the link opens in a <b>private/incognito window</b>. If it doesn&apos;t, use Vercel:
          </li>
          <li>
            Download / export this project from Arena Code (or connect it to <b>GitHub</b>).
          </li>
          <li>
            Go to <a href="https://vercel.com/new" target="_blank" rel="noreferrer" className="font-semibold text-rose-700 underline">vercel.com/new</a> (free account) → <b>Import</b> the GitHub repository → <b>Deploy</b>. No settings to change.
            <span className="block text-sm text-slate-500">No GitHub? Install Node.js, open the project folder in a terminal and run <code className="rounded bg-slate-100 px-1">npx vercel --prod</code>.</span>
          </li>
          <li>
            You get an address like <code className="rounded bg-slate-100 px-1">https://nihongo-path.vercel.app</code>. Open <b>/install</b> on it and run the check in Step 2.
          </li>
        </ol>
      </section>

      <ReadinessCheck />

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold">📦 Step 3 — Make the APK with PWABuilder</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-slate-700">
          <li>
            Copy your <b>public</b> address{" "}
            {!isPrivate && origin && (
              <>
                <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-sm">{origin}</span>{" "}
                <button onClick={copy} className="rounded-lg bg-slate-900 px-3 py-1 text-sm text-white">{copied ? "✓ Copied" : "Copy"}</button>
              </>
            )}
          </li>
          <li>
            Open <a href="https://www.pwabuilder.com" target="_blank" rel="noreferrer" className="font-semibold text-rose-700 underline">pwabuilder.com</a>, paste it → <b>Start</b>. If old results show, press the <b>↻ retest</b> button.
          </li>
          <li><b>Package for Stores → Android → Generate Package</b> (the default options are fine).</li>
          <li>
            Download the zip. It contains the <b>.apk</b> (install on your phone), the <b>.aab</b> (for Google Play), <b>signing.keystore</b> + key info (keep them safe — needed for updates) and <b>assetlinks.json</b>.
          </li>
          <li>Copy the .apk to your phone → tap it → allow <b>“Install unknown apps”</b> → Install. 🎉</li>
        </ol>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold">🩺 PWABuilder still shows “Fix the links/types/sizes of icons & screenshots”?</h2>
        <p className="mt-1 text-slate-600">
          That whole group of red/yellow items has one meaning: PWABuilder downloaded your manifest but got an <b>error page instead of the image files</b>. The app&apos;s manifest,
          icons and screenshots are all verified correct — so this is always the <b>address you tested</b>, never the app. Do these in order:
        </p>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-slate-700">
          <li>
            Make sure you tested the <b>public</b> address (Step 1) — not an <code className="rounded bg-slate-100 px-1">arena.site</code> / <code className="rounded bg-slate-100 px-1">e2b.app</code> preview, which answers every file with “Preview Unavailable”.
          </li>
          <li>
            Open <code className="rounded bg-slate-100 px-1">your-address/manifest.webmanifest</code> in a browser — you must see JSON text, not a web page. Then open{" "}
            <code className="rounded bg-slate-100 px-1">your-address/icons/icon-512.png</code> — you must see the red 日 icon.
          </li>
          <li>
            If you redeployed, press PWABuilder&apos;s <b>↻ retest</b> button — it caches the old failed result.
          </li>
          <li>
            Still red? Your host may be blocking the <code className="rounded bg-slate-100 px-1">/icons/</code> or <code className="rounded bg-slate-100 px-1">/screenshots/</code> folders — redeploy the full project including the <code className="rounded bg-slate-100 px-1">public</code> folder.
          </li>
        </ol>
        <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
          ℹ️ The blue/purple suggestions (<code>related_applications</code>, IARC rating, <code>scope_extensions</code>, <code>file_handlers</code>, <code>protocol_handlers</code>) are optional extras for other kinds of apps — they do <b>not</b> block the APK and this app correctly doesn&apos;t use them.
        </p>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold">🧹 Step 4 — Remove the browser address bar inside the APK (recommended)</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-slate-700">
          <li>Open <b>assetlinks.json</b> from the PWABuilder zip. Note the <code>package_name</code> and the <code>sha256_cert_fingerprints</code> value.</li>
          <li>
            In Vercel → Project → <b>Settings → Environment Variables</b> add <code className="rounded bg-slate-100 px-1">ANDROID_PACKAGE_NAME</code> and{" "}
            <code className="rounded bg-slate-100 px-1">ANDROID_SHA256_FINGERPRINTS</code> → <b>Redeploy</b>.
          </li>
          <li>
            Check <code className="rounded bg-slate-100 px-1">{(origin && !isPrivate ? origin : "https://your-app.vercel.app") + "/.well-known/assetlinks.json"}</code> shows your values. Reopen the app — the address bar is gone.
          </li>
        </ol>
        <p className="mt-2 text-sm text-slate-500">Or just send me the assetlinks.json content and I&apos;ll add it for you.</p>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold">🔎 The few grey/blue items PWABuilder may still list</h2>
        <p className="mt-1 text-sm text-slate-600">Icons, screenshots, service worker, handle_links, display_override, edge_side_panel, share_target, file handlers and protocol handlers are all implemented (sharing text into the app searches the vocabulary; opening a CSV/TXT word list opens the importer). These optional ones stay on purpose:</p>
        <ul className="mt-3 space-y-2 text-sm text-slate-700">
          <li className="rounded-xl bg-slate-50 p-3"><b>related_applications</b> — fills in automatically once <code className="rounded bg-white px-1">ANDROID_PACKAGE_NAME</code> is set (Step 4). It needs your real Play listing id.</li>
          <li className="rounded-xl bg-slate-50 p-3"><b>scope_extensions</b> — only for apps on several domains. Set <code className="rounded bg-white px-1">PWA_EXTRA_ORIGINS</code> (comma-separated) if you ever add one.</li>
          <li className="rounded-xl bg-slate-50 p-3"><b>iarc_rating_id</b> — the age-rating id Google Play gives you after its questionnaire at publish time; it can&apos;t be invented before that.</li>
          <li className="rounded-xl bg-slate-50 p-3"><b>widgets, push, background sync…</b> — extra capabilities this study app doesn&apos;t need. None of them block the APK.</li>
        </ul>
      </section>

      <OfflineSaver />

      <section className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-6">
        <h2 className="text-lg font-bold">🪷 தமிழில் சுருக்கம் (Tamil summary)</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-amber-900">
          <li>
            <b>PWABuilder ஏன் “Missing Name” காட்டியது?</b> நீங்கள் கொடுத்த arena.site link ஒரு <b>private preview</b>. arena.ai-க்கு வெளியே அது “Preview Unavailable” பக்கம் மட்டும் காட்டும் — அதனால் PWABuilder ஆப்பைப் பார்க்கவே இல்லை. ஆப்பில் எந்தத் தவறும் இல்லை.
          </li>
          <li>
            <b>படி 1:</b> ஆப்பை public address-ல் வையுங்கள் (vercel.com — இலவசம், database தேவையில்லை).
          </li>
          <li>
            <b>படி 2:</b> அந்த address-ல் /install திறந்து check-ல் எல்லாம் ✅ பச்சையா என்று பாருங்கள்.
          </li>
          <li>
            <b>படி 3:</b> pwabuilder.com-ல் அந்த public link-ஐ paste → Package for Stores → Android → .apk download → phone-ல் install.
          </li>
          <li>
            <b>குறிப்பு:</b> 🎤 பேச்சுத் தேர்வு + 🔊 ஆடியோவுக்கு internet வேண்டும். “Save everything for offline” அழுத்தினால் மற்ற பாடங்கள் offline-லும் திறக்கும்.
          </li>
        </ul>
      </section>

      <p className="text-center text-sm text-slate-500">
        <Link href="/" className="underline">← Back to study</Link>
      </p>
    </div>
  );
}
