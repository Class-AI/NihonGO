// Served at /.well-known/assetlinks.json (see rewrites in next.config.ts).
// Android uses this file to trust the APK made by PWABuilder, which removes the browser address bar.
// After packaging, set these on your host:
//   ANDROID_PACKAGE_NAME            e.g. com.nihongopath.app
//   ANDROID_SHA256_FINGERPRINTS     the "SHA-256 fingerprint" from PWABuilder (comma-separate several)
export const dynamic = "force-dynamic";

export async function GET() {
  const pkg = process.env.ANDROID_PACKAGE_NAME?.trim();
  const fingerprints = (process.env.ANDROID_SHA256_FINGERPRINTS ?? "")
    .split(",")
    .map((f) => f.trim().toUpperCase())
    .filter((f) => /^([0-9A-F]{2}:){31}[0-9A-F]{2}$/.test(f));

  const body =
    pkg && fingerprints.length
      ? [
          {
            relation: ["delegate_permission/common.handle_all_urls"],
            target: { namespace: "android_app", package_name: pkg, sha256_cert_fingerprints: fingerprints },
          },
        ]
      : [];

  return Response.json(body, { headers: { "Cache-Control": "public, max-age=300" } });
}
