import { PWA_ASSETS } from "@/lib/pwa-assets";

// Serves /icons/*.png and /icons/favicon.ico from text embedded in the source (see scripts/embed_assets.py),
// so the files exist on every host even if binary files are dropped during upload.
// PWABuilder (and browsers) verify these files cross-origin, so they must be readable from any site.
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
  "Cross-Origin-Resource-Policy": "cross-origin",
};

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(PWA_ASSETS)
    .filter((k) => k.startsWith("icons/"))
    .map((k) => ({ file: k.slice("icons/".length) }));
}

export async function GET(_req: Request, ctx: { params: Promise<{ file: string }> }) {
  const { file } = await ctx.params;
  const b64 = PWA_ASSETS[`icons/${file}`];
  if (!b64) return new Response("Not found", { status: 404 });
  const type = file.endsWith(".ico") ? "image/x-icon" : "image/png";
  return new Response(new Uint8Array(Buffer.from(b64, "base64")), {
    headers: { "Content-Type": type, "Cache-Control": "public, max-age=604800, immutable", ...CORS },
  });
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}
