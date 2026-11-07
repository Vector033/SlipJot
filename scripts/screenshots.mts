// Screenshots of the landing and the demo account (needs `npm run seed:demo` and a server).
// Run: node scripts/screenshots.mts [baseUrl] [outDir]   → docs/screenshots/*.png by default
// Entrance motion is settled before each capture so nothing is caught mid-animation.
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { chromium, devices } from "@playwright/test";

const base = process.argv[2] ?? "http://127.0.0.1:3015";
const out = process.argv[3] ?? fileURLToPath(new URL("../docs/screenshots/", import.meta.url));
await mkdir(out, { recursive: true });

const browser = await chromium.launch();
for (const [kind, opts] of [
  ["mobile", { ...devices["Pixel 7"] }],
  ["desktop", { viewport: { width: 1440, height: 900 } }],
] as const) {
  const ctx = await browser.newContext({ ...opts, locale: "th-TH", timezoneId: "Asia/Bangkok" });
  const page = await ctx.newPage();
  const shoot = async (name: string, fullPage = false) => {
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2600); // route board read + plate digits settle
    await page.screenshot({ path: `${out}${kind}-${name}.png`, fullPage });
  };

  await page.goto(`${base}/`);
  await shoot("landing");
  await shoot("landing-full", true);
  await page.goto(`${base}/login`);
  await shoot("login");

  await page.getByRole("button", { name: /บัญชีเดโม/ }).click();
  await page.waitForURL(/\/app$/);
  for (const [name, path] of [
    ["dashboard", "/app?month=2026-10"],
    ["expenses", "/app/expenses?month=2026-10"],
    ["review", "/app/review"],
    ["upload", "/app/upload"],
    ["settings", "/app/settings"],
  ]) {
    await page.goto(base + path);
    await shoot(name);
  }
  await ctx.close();
}
await browser.close();
console.log(`screenshots written to ${out}`);
