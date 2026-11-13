// Screenshots of the landing and the demo account (needs `npm run seed:demo` and a server).
// Run: node scripts/screenshots.mts [baseUrl] [outDir]   → docs/screenshots/*.png by default
// The mobile flow shots upload two fictional slips from eval/fixtures/synthetic. Start the server with
// GEMINI_API_KEY= (local OCR, as in e2e) so kbank-02 lands in review, and reseed the demo before each run.
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

  if (kind === "mobile") {
    // The read flow: slips being read, the results, then the unsure one waiting in review with its image.
    const slip = (id: string) => fileURLToPath(new URL(`../eval/fixtures/synthetic/${id}.jpg`, import.meta.url));
    await page.goto(`${base}/app/upload`);
    await page.getByTestId("slip-input").setInputFiles([slip("bbl-03"), slip("kbank-02")]);
    await page.getByText("กำลังอ่าน").first().waitFor();
    await page.waitForTimeout(600);
    await page.screenshot({ path: `${out}${kind}-flow-reading.png` });
    await page.waitForFunction(() => !/รอคิว|กำลังอ่าน/.test(document.body.innerText), null, { timeout: 90_000 });
    await shoot("flow-saved");
    await page.goto(`${base}/app/review`);
    const item = page.getByTestId("review-item").filter({ has: page.getByRole("img", { name: "เปิดรูปสลิปขนาดเต็ม" }) });
    await item.first().evaluate((el) => el.scrollIntoView({ block: "start" }));
    await page.evaluate(() => scrollBy(0, -72)); // clear the sticky header
    await shoot("flow-review");
  }
  await ctx.close();
}
await browser.close();
console.log(`screenshots written to ${out}`);
