import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Playwright and the preview pane load the dev server via 127.0.0.1.
  allowedDevOrigins: ["127.0.0.1"],
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
};

export default nextConfig;
