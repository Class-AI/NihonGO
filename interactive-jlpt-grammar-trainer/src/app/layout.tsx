import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { ProgressProvider } from "@/lib/progress-context";
import "./globals.css";

// The web app manifest comes from src/app/manifest.ts (Next.js adds <link rel="manifest"> automatically).
export const metadata: Metadata = {
  title: "Nihongo Path — JLPT N4 & N3 for Tamil speakers",
  description:
    "Learn JLPT N4/N3 grammar step by step: lesson → quiz → speaking test → combined review. Vocabulary, reading & listening with Tamil comparisons.",
  applicationName: "Nihongo Path",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Nihongo Path" },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#e11d48",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

// Runs before React loads: registers the service worker and captures Chrome's install prompt early
const PWA_BOOT = `(function(){try{
window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();window.__npInstall=e;window.dispatchEvent(new Event('np-install-ready'));});
window.addEventListener('appinstalled',function(){window.__npInstall=null;window.dispatchEvent(new Event('np-install-ready'));});
if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js',{scope:'/'}).catch(function(){});});}
}catch(e){}})();`;

const nav = [
  { href: "/", label: "📚 Grammar" },
  { href: "/fast-track", label: "⚡ Fast-track" },
  { href: "/vocab", label: "🗂 Words" },
  { href: "/tamil-words", label: "🔤 Tamil words" },
  { href: "/reading", label: "📖 Reading" },
  { href: "/listening", label: "🎧 Listening" },
  { href: "/tamil", label: "🪷 Tamil" },
  { href: "/exam", label: "🎯 Exam" },
  { href: "/install", label: "📲 App" },
];

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script id="np-pwa-boot" dangerouslySetInnerHTML={{ __html: PWA_BOOT }} />
      </head>
      <body className="min-h-screen bg-[#faf7f2] text-slate-900 antialiased">
        <ProgressProvider>
          <header className="sticky top-0 z-20 border-b border-rose-100 bg-white/90 backdrop-blur">
            <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-3">
              <Link href="/" className="flex items-center gap-2 text-lg font-bold">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-600 text-white">日</span>
                Nihongo Path <span className="text-sm font-normal text-slate-500">N4 · N3</span>
              </Link>
              <nav className="flex flex-wrap gap-1 text-sm">
                {nav.map((n) => (
                  <Link
                    key={n.href}
                    href={n.href}
                    className="rounded-lg px-2.5 py-1.5 font-medium text-slate-700 hover:bg-rose-50 hover:text-rose-700"
                  >
                    {n.label}
                  </Link>
                ))}
              </nav>
            </div>
          </header>
          <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
          <footer className="px-4 py-8 text-center text-xs text-slate-400">
            頑張って！ (gambatte!) — முயற்சி திருவினையாக்கும் · Works offline after install ·{" "}
            <Link href="/install" className="underline">
              Get the Android app (APK)
            </Link>
          </footer>
        </ProgressProvider>
      </body>
    </html>
  );
}
