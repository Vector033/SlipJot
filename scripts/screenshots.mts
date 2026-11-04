// Screenshots of the demo account for the README (needs `npm run seed:demo` and a server).
// Run: node scripts/screenshots.mts [baseUrl]   → docs/screenshots/*.png
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { chromium, devices } from "@playwright/test";

const base = process.argv[2] ?? "http://127.0.0.1:3015";
const out = fileURLToPath(new URL("../docs/screenshots/", import.meta.url));
await mkdir(out, { recursive: true });

const browser = await chromium.launch();
for (const [kind, opts] of [
  ["mobile", { ...devices["Pixel 7"] }],
  ["desktop", { viewport: { width: 1280, height: 860 } }],
] as const) {
  const ctx = await browser.newContext({ ...opts, locale: "th-TH", timezoneId: "Asia/Bangkok" });
  const page = await ctx.newPage();
  await page.goto(`${base}/login`);
  await page.getByLabel("อีเมล").fill("demo@slipjot.test");
  await page.getByLabel("รหัสผ่าน").fill("slipjot-demo-2026");
  await page.getByRole("button", { name: "เข้าสู่ระบบ" }).click();
  await page.waitForURL(/\/app$/);
  for (const [name, path] of [
    ["dashboard", "/app?month=2026-10"],
    ["expenses", "/app/expenses?month=2026-10"],
    ["review", "/app/review"],
    ["upload", "/app/upload"],
    ["settings", "/app/settings"],
  ]) {
    await page.goto(base + path);
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: `${out}${kind}-${name}.png`, fullPage: false });
  }
  await ctx.close();
}
await browser.close();
console.log("screenshots written to docs/screenshots/");
