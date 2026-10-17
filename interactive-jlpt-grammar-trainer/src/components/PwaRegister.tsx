"use client";

import { useEffect, useState } from "react";

// The service worker is registered by the inline boot script in app/layout.tsx.
// That script also stores Chrome's `beforeinstallprompt` event on window.__npInstall.

interface BIPEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
}

type NpWindow = Window & { __npInstall?: BIPEvent | null };

export function getInstallPrompt(): BIPEvent | null {
  if (typeof window === "undefined") return null;
  return (window as NpWindow).__npInstall ?? null;
}

export function clearInstallPrompt() {
  if (typeof window !== "undefined") (window as NpWindow).__npInstall = null;
}

export function isStandaloneMode() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(display-mode: standalone)").matches || (navigator as unknown as { standalone?: boolean }).standalone === true;
}

export function InstallButton({ className = "", label = "📲 Install app" }: { className?: string; label?: string }) {
  const [canInstall, setCanInstall] = useState(false);
  const [standalone, setStandalone] = useState(false);

  useEffect(() => {
    const check = () => {
      const s = isStandaloneMode();
      setStandalone(s);
      setCanInstall(!!getInstallPrompt() && !s);
    };
    check();
    window.addEventListener("np-install-ready", check);
    return () => window.removeEventListener("np-install-ready", check);
  }, []);

  if (standalone) {
    return <span className={`inline-flex items-center rounded-xl bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-800 ${className}`}>✓ Installed</span>;
  }
  if (!canInstall) return null;
  return (
    <button
      className={className || "rounded-xl bg-rose-600 px-5 py-2.5 font-semibold text-white shadow hover:bg-rose-700"}
      onClick={async () => {
        const p = getInstallPrompt();
        if (!p) return;
        await p.prompt();
        await p.userChoice.catch(() => undefined);
        clearInstallPrompt();
        setCanInstall(false);
      }}
    >
      {label}
    </button>
  );
}
