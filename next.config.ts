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
  async headers() {
    // The service worker must never be served stale, or share-target fixes never reach phones.
    return [{ source: "/sw.js", headers: [{ key: "cache-control", value: "no-cache" }] }];
  },
};

export default nextConfig;
