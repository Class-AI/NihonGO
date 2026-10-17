import type { MetadataRoute } from "next";

/**
 * Next.js serves this at /manifest.webmanifest and injects <link rel="manifest"> into every page.
 * Some modern fields (edge_side_panel, scope_extensions, handle_links …) are not in Next's TypeScript type yet,
 * so the manifest is assembled loosely and cast at the end.
 * id stays "/" (the identity already published on the live site) — start_url may carry tracking params.
 */

const PNG = "image/png";
const icon96 = { src: "/icons/icon-96.png", sizes: "96x96", type: PNG };

export default function manifest(): MetadataRoute.Manifest {
  const pkg = process.env.ANDROID_PACKAGE_NAME?.trim();
  const extraOrigins = (process.env.PWA_EXTRA_ORIGINS ?? "")
    .split(",")
    .map((o) => o.trim())
    .filter((o) => /^https:\/\/[a-z0-9.-]+(:\d+)?$/i.test(o));

  const manifest: Record<string, unknown> = {
    id: "/",
    name: "Nihongo Path — JLPT N4 & N3 for Tamil speakers",
    short_name: "Nihongo Path",
    description:
      "Pass JLPT N4 and N3: 100 grammar lessons with quizzes and speaking tests, 1,000+ words with Tamil memory hooks, word-by-word English meanings, reading and listening practice.",
    start_url: "/?source=pwa",
    scope: "/",
    display: "standalone",
    display_override: ["standalone", "minimal-ui", "window-controls-overlay", "fullscreen", "browser"],
    orientation: "portrait",
    background_color: "#faf7f2",
    theme_color: "#e11d48",
    lang: "en",
    dir: "ltr",
    categories: ["education", "books", "productivity"],
    prefer_related_applications: false,
    launch_handler: { client_mode: ["navigate-existing", "auto"] },
    handle_links: "auto",
    edge_side_panel: { preferred_width: 480 },
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: PNG, purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: PNG, purpose: "any" },
      { src: "/icons/maskable-192.png", sizes: "192x192", type: PNG, purpose: "maskable" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: PNG, purpose: "maskable" },
    ],
    screenshots: [
      { src: "/screenshots/home-narrow.png", sizes: "1080x1920", type: PNG, form_factor: "narrow", label: "Grammar path with progress, vocabulary, reading and listening" },
      { src: "/screenshots/speaking-narrow.png", sizes: "1080x1920", type: PNG, form_factor: "narrow", label: "Speaking test: say the sentence in Japanese, get hiragana and kanji feedback" },
      { src: "/screenshots/home-wide.png", sizes: "1920x1080", type: PNG, form_factor: "wide", label: "Nihongo Path on desktop" },
    ],
    shortcuts: [
      { name: "Grammar path", short_name: "Grammar", description: "Continue your N4/N3 grammar lessons", url: "/?source=shortcut", icons: [icon96] },
      { name: "Vocabulary", short_name: "Words", description: "Daily 20 words with Tamil hooks", url: "/vocab?source=shortcut", icons: [icon96] },
      { name: "Reading practice", short_name: "Reading", description: "JLPT reading passages", url: "/reading?source=shortcut", icons: [icon96] },
      { name: "Listening practice", short_name: "Listening", description: "JLPT listening practice with audio", url: "/listening?source=shortcut", icons: [icon96] },
    ],
    // Real integrations: sharing text to the app searches the vocabulary, opening a word-list file opens the importer,
    // and web+nihongo: links open a vocabulary search.
    share_target: { action: "/vocab", method: "GET", params: { title: "qt", text: "q", url: "qu" } },
    file_handlers: [
      {
        action: "/vocab",
        accept: {
          "text/csv": [".csv"],
          "text/tab-separated-values": [".tsv", ".csv"],
          "text/plain": [".txt", ".csv"],
        },
      },
    ],
    protocol_handlers: [{ protocol: "web+nihongo", url: "/vocab?q=%s" }],
  };

  // Filled in after the Android package exists (see Step 4 on the /install page)
  if (pkg) {
    manifest.related_applications = [{ platform: "play", url: `https://play.google.com/store/apps/details?id=${pkg}`, id: pkg }];
  }
  if (extraOrigins.length) {
    manifest.scope_extensions = extraOrigins.map((origin) => ({ origin }));
  }

  return manifest as unknown as MetadataRoute.Manifest;
}
