/* Nihongo Path service worker — offline support for the installed app / APK */
const VERSION = "v4";
const SHELL = "np-shell-" + VERSION;
const RUNTIME = "np-runtime-" + VERSION;
const OFFLINE_URL = "/offline";
const CORE_PAGES = ["/", "/vocab", "/reading", "/listening", "/tamil", "/tamil-words", "/fast-track", "/exam", "/install", OFFLINE_URL];
const CORE_FILES = ["/manifest.webmanifest", "/icons/icon-96.png", "/icons/icon-192.png", "/icons/icon-512.png", "/icons/maskable-512.png"];
const ASSET_RE = /\/_next\/static\/[^"'\\\s)<>]+/g;
const MATCH_PAGE = { ignoreSearch: true, ignoreVary: true };

// Fetch a page, store it, and also store every JS/CSS chunk it needs (so it works offline, not just shows HTML)
async function cachePage(cache, path) {
  const res = await fetch(path, { credentials: "same-origin", cache: "no-cache" });
  if (!res.ok) throw new Error(path + " -> " + res.status);
  const html = await res.clone().text();
  await cache.put(path, res);
  const assets = Array.from(new Set(html.match(ASSET_RE) || []));
  await Promise.all(
    assets.map((a) =>
      caches
        .match(a)
        .then((hit) => hit || fetch(a).then((r) => (r.ok ? caches.open(RUNTIME).then((rc) => rc.put(a, r)) : null)))
        .catch(() => null),
    ),
  );
  return assets.length;
}

async function trimRuntime(max) {
  const cache = await caches.open(RUNTIME);
  const keys = await cache.keys();
  for (let i = 0; i < keys.length - max; i++) await cache.delete(keys[i]);
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL);
      await Promise.all(CORE_FILES.map((u) => cache.add(u).catch(() => null)));
      for (const p of CORE_PAGES) {
        try {
          await cachePage(cache, p);
        } catch (e) {
          /* page unavailable right now — cached later when visited */
        }
      }
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== SHELL && k !== RUNTIME).map((k) => caches.delete(k)));
      await self.clients.claim();
    })(),
  );
});

async function cacheFirst(request) {
  const hit = await caches.match(request);
  if (hit) return hit;
  const res = await fetch(request);
  if (res.ok) {
    const cache = await caches.open(RUNTIME);
    await cache.put(request, res.clone());
    trimRuntime(500);
  }
  return res;
}

async function networkFirstPage(request) {
  const url = new URL(request.url);
  try {
    const res = await fetch(request);
    if (res.ok && res.type === "basic") {
      const cache = await caches.open(RUNTIME);
      cache.put(url.origin + url.pathname, res.clone());
    }
    return res;
  } catch (e) {
    return (
      (await caches.match(request, MATCH_PAGE)) ||
      (await caches.match(url.pathname, MATCH_PAGE)) ||
      (await caches.match(OFFLINE_URL, MATCH_PAGE)) ||
      new Response("<h1>Offline</h1><p>Open the app once while online.</p>", { headers: { "Content-Type": "text/html; charset=utf-8" } })
    );
  }
}

async function networkFirst(request) {
  try {
    const res = await fetch(request);
    if (res.ok && res.type === "basic") {
      const cache = await caches.open(RUNTIME);
      cache.put(request, res.clone());
    }
    return res;
  } catch (e) {
    const hit = await caches.match(request);
    return hit || Response.error();
  }
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/") || url.pathname === "/sw.js" || url.pathname.startsWith("/.well-known/")) return;
  // Next.js client-side navigation payloads: let the network handle them (the router falls back to a full page load offline)
  if (url.searchParams.has("_rsc") || req.headers.get("RSC") === "1") return;

  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/") || url.pathname.startsWith("/screenshots/")) {
    event.respondWith(cacheFirst(req));
    return;
  }
  if (req.mode === "navigate") {
    event.respondWith(networkFirstPage(req));
    return;
  }
  event.respondWith(networkFirst(req));
});

// Messages from the page: activate updates now, or download every lesson for offline study
self.addEventListener("message", (event) => {
  const data = event.data || {};
  if (data.type === "SKIP_WAITING") self.skipWaiting();
  if (data.type === "PRECACHE_PAGES" && Array.isArray(data.urls)) {
    const port = event.ports && event.ports[0];
    event.waitUntil(
      (async () => {
        const cache = await caches.open(SHELL);
        const total = data.urls.length;
        let done = 0;
        let failed = 0;
        for (const u of data.urls) {
          try {
            await cachePage(cache, u);
            done++;
          } catch (e) {
            failed++;
          }
          if (port) port.postMessage({ type: "progress", done, failed, total });
        }
        if (port) port.postMessage({ type: "complete", done, failed, total });
      })(),
    );
  }
});
