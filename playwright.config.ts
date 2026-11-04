import { defineConfig, devices } from "@playwright/test";

// E2E against the local Supabase stack (npm run db:start) and a Next server on :3015.
// Set E2E_BASE_URL to reuse a server that is already running.
const port = 3015;
const baseURL = process.env.E2E_BASE_URL ?? `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "e2e",
  timeout: 120_000,
  expect: { timeout: 30_000 },
  fullyParallel: false,
  workers: 1,
  reporter: process.env.CI ? "github" : "list",
  use: { baseURL, trace: "retain-on-failure", locale: "th-TH", timezoneId: "Asia/Bangkok" },
  projects: [{ name: "mobile", use: { ...devices["Pixel 7"] } }],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: process.env.CI ? `npx next start -p ${port}` : `npx next dev -p ${port}`,
        url: baseURL,
        timeout: 180_000,
        reuseExistingServer: !process.env.CI,
        // Pin slip reading to local OCR so results don't depend on an external API
        // (the review-queue test needs a slip OCR is unsure about). Next won't override it from .env.local.
        env: { GEMINI_API_KEY: "" },
      },
});
