import { expect, test } from "@playwright/test";

// Security behaviour that must hold on every build. Safe to run against a deployed site:
// it creates nothing and only uses the demo account when the button exists.

test("pages ship a nonce CSP and the hardening headers", async ({ request }) => {
  const res = await request.get("/login");
  const h = res.headers();
  expect(h["content-security-policy"]).toMatch(/script-src 'self' 'nonce-[A-Za-z0-9+/=]+' 'strict-dynamic'/);
  expect(h["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(h["content-security-policy"]).toContain("object-src 'none'");
  expect(h["x-frame-options"]).toBe("DENY");
  expect(h["x-content-type-options"]).toBe("nosniff");
  expect(h["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(h["strict-transport-security"]).toContain("max-age=");
  expect(h["x-powered-by"]).toBeUndefined();
  // A fresh nonce per request.
  const again = (await request.get("/login")).headers()["content-security-policy"];
  expect(again).not.toBe(h["content-security-policy"]);
});

test("the page runs with no CSP violations", async ({ page }) => {
  const violations: string[] = [];
  page.on("console", (m) => {
    if (/Content Security Policy|Refused to/i.test(m.text())) violations.push(m.text());
  });
  await page.goto("/");
  await page.goto("/login");
  await page.getByRole("button", { name: "สมัครใช้งาน", exact: true }).click(); // proves hydration ran under the CSP
  await expect(page.getByRole("button", { name: "สร้างบัญชี" })).toBeVisible();
  expect(violations).toEqual([]);
});

test("cross-site and anonymous requests are refused", async ({ request }) => {
  const cross = await request.post("/api/slips", {
    headers: { origin: "https://evil.example", "sec-fetch-site": "cross-site" },
    multipart: { file: { name: "x.jpg", mimeType: "image/jpeg", buffer: Buffer.from([0xff, 0xd8, 0xff]) } },
  });
  expect(cross.status()).toBe(403);
  const anon = await request.post("/api/slips", { headers: { "sec-fetch-site": "same-origin" } });
  expect(anon.status()).toBe(401);
  expect((await request.get("/api/export")).status()).toBe(401);
  expect((await request.get("/api/slips/00000000-0000-0000-0000-000000000000/image")).status()).toBe(404);
});

test("the session cookie is httpOnly", async ({ page, context }) => {
  await page.goto("/login");
  const demo = page.getByRole("button", { name: /บัญชีเดโม/ });
  test.skip(!(await demo.isVisible()), "no demo account on this server");
  await demo.click();
  await expect(page).toHaveURL(/\/app$/);
  const session = (await context.cookies()).filter((c) => c.name.startsWith("sb-"));
  expect(session.length).toBeGreaterThan(0);
  for (const c of session) expect(c.httpOnly).toBe(true);
  expect(await page.evaluate(() => document.cookie)).not.toContain("sb-");
});
