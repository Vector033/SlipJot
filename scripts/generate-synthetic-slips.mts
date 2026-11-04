// Renders the fictional slips in synthetic-slips.mts to JPEGs for the eval and tests.
// Run: npm run slips:generate  (needs `npx playwright install chromium` once)
// Output: eval/fixtures/synthetic/<id>.jpg + labels.json. Seeded, so reruns are stable.
// Held-out set (never used while tuning the parser):
//   node scripts/generate-synthetic-slips.mts 8 --seed 777 --out holdout

import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";
import QRCode from "qrcode";
import { makeSlip, rng, slipHtml, type LayoutCode, type SyntheticSlip } from "./synthetic-slips.mts";

const args = process.argv.slice(2);
const flag = (name: string) => (args.includes(`--${name}`) ? args[args.indexOf(`--${name}`) + 1] : undefined);
const PER_LAYOUT = Number(args[0] && !args[0].startsWith("--") ? args[0] : 12);
const SEED = Number(flag("seed") ?? 20261104);
const SET = flag("out") ?? "synthetic";
const LAYOUTS: LayoutCode[] = ["KBANK", "SCB", "BBL", "KTB", "BAY"];
const outDir = fileURLToPath(new URL(`../eval/fixtures/${SET}/`, import.meta.url));

await mkdir(outDir, { recursive: true });
const r = rng(SEED);
const browser = await chromium.launch();
const labels: (SyntheticSlip & { file: string })[] = [];

for (const layout of LAYOUTS) {
  for (let i = 0; i < PER_LAYOUT; i++) {
    const slip = makeSlip(layout, i, r);
    // Phone screenshots are 2–3x device pixels; vary it and the JPEG quality a little.
    const scale = [2, 2.5, 3][Math.floor(r() * 3)];
    const quality = 70 + Math.floor(r() * 25);
    const page = await browser.newPage({ deviceScaleFactor: scale, viewport: { width: 420, height: 900 } });
    const qr = await QRCode.toDataURL(slip.qrPayload, { margin: 1, width: 180 });
    await page.setContent(slipHtml(slip, qr), { waitUntil: "load" });
    const file = `${slip.id}.jpg`;
    await page.locator(".slip").screenshot({ path: outDir + file, type: "jpeg", quality });
    await page.close();
    labels.push({ ...slip, file });
  }
}
await browser.close();
await writeFile(outDir + "labels.json", JSON.stringify(labels, null, 2) + "\n");
console.log(`wrote ${labels.length} slips to ${outDir}`);
