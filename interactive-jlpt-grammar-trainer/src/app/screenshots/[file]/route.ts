import { PWA_ASSETS } from "@/lib/pwa-assets";

// Serves /screenshots/*.png from text embedded in the source (see scripts/embed_assets.py).
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
    .filter((k) => k.startsWith("screenshots/"))
    .map((k) => ({ file: k.slice("screenshots/".length) }));
}

export async function GET(_req: Request, ctx: { params: Promise<{ file: string }> }) {
  const { file } = await ctx.params;
  const b64 = PWA_ASSETS[`screenshots/${file}`];
  if (!b64) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(Buffer.from(b64, "base64")), {
    headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=604800, immutable", ...CORS },
  });
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}
