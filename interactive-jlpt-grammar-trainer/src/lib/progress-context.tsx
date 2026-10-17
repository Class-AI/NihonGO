"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { allGrammar, units } from "@/data";

export interface ItemProgress {
  itemId: string;
  learned: boolean;
  quizScore: number | null;
  speakingScore: number | null;
  completed: boolean;
}

interface Ctx {
  ready: boolean;
  user: string;
  map: Record<string, ItemProgress>;
  cram: boolean;
  setCram: (v: boolean) => void;
  save: (itemId: string, patch: Partial<Omit<ItemProgress, "itemId">>) => Promise<void>;
  reset: () => Promise<void>;
  isGrammarUnlocked: (id: string) => boolean;
  isReviewUnlocked: (unitId: number) => boolean;
}

const ProgressCtx = createContext<Ctx | null>(null);

function getUserKey() {
  const k = "jlpt-tamil-user";
  let v = localStorage.getItem(k);
  if (!v) {
    v = (crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`).slice(0, 40);
    localStorage.setItem(k, v);
  }
  return v;
}

// Progress is stored on the device (works offline / in the installed app) and synced to the server when available.
const LOCAL_KEY = "jlpt-progress-v1";

function mergeItem(a: ItemProgress | undefined, b: ItemProgress | undefined): ItemProgress {
  const base = a ?? b!;
  const maxOrNull = (x: number | null | undefined, y: number | null | undefined) => (x == null && y == null ? null : Math.max(x ?? 0, y ?? 0));
  return {
    itemId: base.itemId,
    learned: !!(a?.learned || b?.learned),
    completed: !!(a?.completed || b?.completed),
    quizScore: maxOrNull(a?.quizScore, b?.quizScore),
    speakingScore: maxOrNull(a?.speakingScore, b?.speakingScore),
  };
}

function sameItem(a: ItemProgress, b: ItemProgress | undefined) {
  return !!b && a.learned === !!b.learned && a.completed === !!b.completed && (a.quizScore ?? null) === (b.quizScore ?? null) && (a.speakingScore ?? null) === (b.speakingScore ?? null);
}

function readLocal(): Record<string, ItemProgress> {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    const parsed = raw ? (JSON.parse(raw) as Record<string, ItemProgress>) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState("");
  const [map, setMap] = useState<Record<string, ItemProgress>>({});
  const [ready, setReady] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [cram, setCramState] = useState(false);

  useEffect(() => {
    const u = getUserKey();
    setUser(u);
    setCramState(localStorage.getItem("jlpt-cram") === "1");
    const local = readLocal();
    setMap(local);
    setHydrated(true);
    setReady(true); // device progress is enough to start — no need to wait for the network

    fetch(`/api/progress?user=${encodeURIComponent(u)}`)
      .then((r) => (r.ok ? r.json() : { rows: [] }))
      .then(async (d: { rows?: ItemProgress[] }) => {
        const server: Record<string, ItemProgress> = {};
        for (const r of d.rows ?? []) server[r.itemId] = r;
        const merged: Record<string, ItemProgress> = { ...server };
        for (const [id, item] of Object.entries(local)) merged[id] = mergeItem(item, server[id]);
        setMap((current) => {
          const next = { ...merged };
          for (const [id, item] of Object.entries(current)) next[id] = mergeItem(item, next[id]);
          return next;
        });
        // push progress made offline (or before the database existed) up to the server
        const ahead = Object.values(merged).filter((item) => !sameItem(item, server[item.itemId])).slice(0, 300);
        for (const item of ahead) {
          await fetch("/api/progress", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user: u, ...item }),
          }).catch(() => undefined);
        }
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(map));
    } catch {
      /* storage full or blocked — server copy still works */
    }
  }, [map, hydrated]);

  const setCram = useCallback((v: boolean) => {
    setCramState(v);
    localStorage.setItem("jlpt-cram", v ? "1" : "0");
  }, []);

  const save = useCallback(
    async (itemId: string, patch: Partial<Omit<ItemProgress, "itemId">>) => {
      setMap((m) => {
        const prev = m[itemId] ?? { itemId, learned: false, quizScore: null, speakingScore: null, completed: false };
        return {
          ...m,
          [itemId]: {
            ...prev,
            learned: prev.learned || !!patch.learned,
            completed: prev.completed || !!patch.completed,
            quizScore: patch.quizScore != null ? Math.max(prev.quizScore ?? 0, patch.quizScore) : prev.quizScore,
            speakingScore:
              patch.speakingScore != null ? Math.max(prev.speakingScore ?? 0, patch.speakingScore) : prev.speakingScore,
          },
        };
      });
      if (!user) return;
      await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user, itemId, ...patch }),
      }).catch(() => {});
    },
    [user],
  );

  const reset = useCallback(async () => {
    setMap({});
    if (user) await fetch(`/api/progress?user=${encodeURIComponent(user)}`, { method: "DELETE" }).catch(() => {});
  }, [user]);

  const isReviewUnlocked = useCallback(
    (unitId: number) => {
      if (cram) return true;
      const u = units.find((x) => x.id === unitId);
      return !!u && u.grammar.every((g) => map[`g:${g.id}`]?.completed);
    },
    [map, cram],
  );

  const isGrammarUnlocked = useCallback(
    (id: string) => {
      if (cram) return true;
      const idx = allGrammar.findIndex((g) => g.id === id);
      if (idx <= 0) return idx === 0;
      const g = allGrammar[idx];
      const prev = allGrammar[idx - 1];
      if (prev.unit !== g.unit) return !!map[`u:${prev.unit}`]?.completed;
      return !!map[`g:${prev.id}`]?.completed;
    },
    [map, cram],
  );

  const value = useMemo(
    () => ({ ready, user, map, cram, setCram, save, reset, isGrammarUnlocked, isReviewUnlocked }),
    [ready, user, map, cram, setCram, save, reset, isGrammarUnlocked, isReviewUnlocked],
  );
  return <ProgressCtx.Provider value={value}>{children}</ProgressCtx.Provider>;
}

export function useProgress() {
  const c = useContext(ProgressCtx);
  if (!c) throw new Error("useProgress must be used within ProgressProvider");
  return c;
}
