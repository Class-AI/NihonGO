import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["kuromoji"],
  outputFileTracingIncludes: {
    "/api/reading": ["./node_modules/kuromoji/dict/**/*"],
  },
  async rewrites() {
    return [
      { source: "/.well-known/assetlinks.json", destination: "/api/assetlinks" },
      { source: "/favicon.ico", destination: "/icons/favicon.ico" },
    ];
  },
  async headers() {
    return [
      {
        // Browsers must always get the newest service worker
        source: "/sw.js",
        headers: [
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
          // PWA validators read these from another origin
          { key: "Access-Control-Allow-Origin", value: "*" },
        ],
      },
      {
        source: "/manifest.webmanifest",
        headers: [
          { key: "Content-Type", value: "application/manifest+json; charset=utf-8" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Cache-Control", value: "public, max-age=300" },
        ],
      },
      {
        source: "/icons/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=604800" }],
      },
    ];
  },
};

export default nextConfig;
