import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Playwright and the preview pane load the dev server via 127.0.0.1.
  allowedDevOrigins: ["127.0.0.1"],
  devIndicators: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // The slip reader is a workspace package shipped as TypeScript source.
  transpilePackages: ["@slipjot/slip-reader"],
  // Native / worker-based packages must be required at runtime, not bundled.
  serverExternalPackages: ["tesseract.js", "sharp"],
  // tesseract.js starts its OCR worker from a file path that output tracing can't follow,
  // so ship the worker and what it requires with every route that reads slips.
  outputFileTracingIncludes: Object.fromEntries(
    ["/api/slips", "/share-target"].map((route) => [
      route,
      [
        "./node_modules/tesseract.js/**/*",
        "./node_modules/tesseract.js-core/**/*",
        "./node_modules/{bmp-js,idb-keyval,is-url,node-fetch,regenerator-runtime,wasm-feature-detect,zlibjs}/**/*",
        "./node_modules/{whatwg-url,tr46,webidl-conversions}/**/*",
      ],
    ]),
  ),
  poweredByHeader: false,
  async headers() {
    return [
      // Baseline hardening on every response. The per-request CSP (with its nonce) is set in src/proxy.ts.
      {
        source: "/:path*",
        headers: [
          { key: "strict-transport-security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "x-content-type-options", value: "nosniff" },
          { key: "x-frame-options", value: "DENY" },
          { key: "referrer-policy", value: "strict-origin-when-cross-origin" },
          { key: "permissions-policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()" },
          { key: "cross-origin-opener-policy", value: "same-origin" },
          { key: "x-dns-prefetch-control", value: "off" },
        ],
      },
      // The service worker must never be served stale, or share-target fixes never reach phones.
      { source: "/sw.js", headers: [{ key: "cache-control", value: "no-cache" }] },
    ];
  },
};

export default nextConfig;
