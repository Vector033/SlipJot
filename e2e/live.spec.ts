import { expect, test } from "@playwright/test";

// Smoke test for a deployed site: E2E_BASE_URL=https://slipjot.vercel.app npx playwright test live
// Uses only the shared demo account (opened by its button, no password typed), reads one
// fictional slip end to end, then deletes what it added so the demo stays clean.

const base = process.env.E2E_BASE_URL;
test.skip(!base || /127\.0\.0\.1|localhost/.test(base), "set E2E_BASE_URL to a deployed site");

test("live: demo dashboard loads and a slip is read and saved", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: /บัญชีเดโม/ }).click();
  await expect(page).toHaveURL(/\/app$/);

  await page.goto("/app?month=2026-10");
  await expect(page.getByTestId("month-total").locator(".sr-only")).not.toHaveText("0.00");

  await page.goto("/app/upload");
  await page.getByTestId("slip-input").setInputFiles("eval/fixtures/holdout/scb-01.jpg");
  const row = page.getByTestId("upload-row").first();
  await expect(row.getByText(/บันทึกแล้ว|รอตรวจ|ข้าม/)).toBeVisible({ timeout: 90_000 });
  if (await row.getByText("ข้าม").isVisible()) return; // already uploaded by an earlier run

  // Remove the expense this run added (matched by the slip's amount in its month).
  const slip = await label("scb-01");
  const amount = slip.amount.toLocaleString("en-US", { minimumFractionDigits: 2 });
  await page.goto("/app/expenses?month=" + slip.dateTime.slice(0, 7));
  await page.getByTestId("expense-row").filter({ hasText: `฿${amount}` }).first().click();
  await page.getByText("ลบรายการ", { exact: true }).click(); // opens the confirm row
  await page.getByRole("button", { name: "ลบรายการนี้ถาวร" }).click();
  await expect(page).toHaveURL(/\/app\/expenses\?month=/);
});

async function label(id: string) {
  const { readFile } = await import("node:fs/promises");
  const labels = JSON.parse(await readFile("eval/fixtures/holdout/labels.json", "utf8")) as {
    id: string;
    dateTime: string;
    amount: number;
  }[];
  return labels.find((l) => l.id === id)!;
}
