import { readFile } from "node:fs/promises";
import { expect, test, type Page } from "@playwright/test";

// One fresh account per run walks the whole flow. Slips are the fictional ones in eval/fixtures.
const slip = (id: string) => `eval/fixtures/synthetic/${id}.jpg`;
const email = `e2e-${Date.now()}@slipjot.test`;
const password = "e2e-password-123";

async function upload(page: Page, ...ids: string[]) {
  await page.goto("/app/upload");
  await page.getByTestId("slip-input").setInputFiles(ids.map(slip));
  // Every row leaves the waiting/reading states.
  await expect(page.getByTestId("upload-row")).toHaveCount(ids.length);
  await expect(page.getByText(/รอคิว|กำลังอ่านสลิป/)).toHaveCount(0, { timeout: 90_000 });
}

test.describe.configure({ mode: "serial" });

test("sign up lands on an empty dashboard", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("tab", { name: "สมัครใช้งาน" }).click();
  await page.getByLabel("อีเมล").fill(email);
  await page.getByLabel("รหัสผ่าน").fill(password);
  await page.getByRole("button", { name: "สร้างบัญชี" }).click();
  await expect(page).toHaveURL(/\/app$/);
  await expect(page.getByText("ยังไม่มีรายจ่ายในเดือนนี้")).toBeVisible();
});

test.describe("signed in", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("อีเมล").fill(email);
    await page.getByLabel("รหัสผ่าน").fill(password);
    await page.getByRole("button", { name: "เข้าสู่ระบบ" }).click();
    await expect(page).toHaveURL(/\/app$/);
  });

  test("reads slips, skips the duplicate, and categorises by shop name", async ({ page }) => {
    await upload(page, "bbl-03", "bbl-01");
    await expect(page.getByText("ร้านตัดผมสไตล์ช่างเอ")).toBeVisible();
    await expect(page.getByText("฿208.69")).toBeVisible();
    await expect(page.getByText("สุขภาพ").first()).toBeVisible(); // "ตัดผม" keyword

    await upload(page, "bbl-03");
    await expect(page.getByText("อัปโหลดรูปนี้ไปแล้ว")).toBeVisible();
  });

  test("a user's category change is remembered for the next slip to that payee", async ({ page }) => {
    await page.goto(`/app/expenses?month=${await monthOfLabel("bbl-03")}`);
    const row = page.getByTestId("expense-row").filter({ hasText: "ร้านตัดผม" });
    await row.click();
    await page.waitForURL(/\/app\/expenses\/[0-9a-f-]{36}$/);
    await page.getByRole("combobox", { name: "หมวด" }).selectOption({ label: "🛍️ ช้อปปิ้ง" });
    await page.getByRole("button", { name: "บันทึก" }).click();
    await expect(page).toHaveURL(/\/app\/expenses\?month=/);

    await upload(page, "bbl-10"); // same shop, another day
    await expect(page.getByText("ช้อปปิ้ง")).toBeVisible();
    await page.goto(`/app/expenses?month=${await monthOfLabel("bbl-10")}`);
    await expect(page.getByText("ช้อปปิ้ง (จำจากครั้งก่อน)").first()).toBeVisible();
  });

  test("unsure reads wait in the review queue until confirmed", async ({ page }) => {
    await upload(page, "kbank-02");
    await page.goto("/app/review");
    const item = page.getByTestId("review-item").first();
    await expect(item).toBeVisible();
    await expect(item.getByRole("img", { name: "รูปสลิป" })).toBeVisible();
    await item.getByLabel("ผู้รับ / ร้าน").fill("ร้านข้าวมันไก่ป้าแดง");
    await item.getByRole("button", { name: "ยืนยัน" }).click();
    await expect(page.getByText("ไม่มีรายการค้างตรวจ")).toBeVisible();
  });

  test("dashboard, CSV export and wipe", async ({ page }) => {
    await page.goto(`/app?month=${await monthOfLabel("bbl-03")}`);
    await expect(page.getByTestId("month-total")).not.toHaveText("฿0");

    const download = page.waitForEvent("download");
    await page.goto("/app/settings");
    await page.getByRole("link", { name: "ดาวน์โหลด CSV" }).click();
    const csv = await readFile((await (await download).path())!, "utf8");
    expect(csv.charCodeAt(0)).toBe(0xfeff);
    expect(csv).toContain("ร้านตัดผมสไตล์ช่างเอ");

    await page.getByLabel("ยืนยันการลบข้อมูล").fill("ลบ");
    await page.getByRole("button", { name: "ลบข้อมูลทั้งหมด" }).click();
    await expect(page.getByText("ลบข้อมูลทั้งหมดแล้ว")).toBeVisible();
  });
});

async function monthOfLabel(id: string) {
  const labels = JSON.parse(await readFile("eval/fixtures/synthetic/labels.json", "utf8")) as { id: string; dateTime: string }[];
  return labels.find((l) => l.id === id)!.dateTime.slice(0, 7);
}
