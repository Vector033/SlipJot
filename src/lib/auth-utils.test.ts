import { describe, expect, it } from "vitest";
import { describeAgent, safeNext } from "./auth-utils";
import { passwordProblem, passwordRules } from "./password";

describe("safeNext", () => {
  it("keeps local paths", () => {
    expect(safeNext("/app/settings?linked=google")).toBe("/app/settings?linked=google");
  });
  it("rejects other sites and protocol-relative URLs", () => {
    for (const bad of ["https://evil.example", "//evil.example", "/\\evil.example", "javascript:alert(1)", "", null]) {
      expect(safeNext(bad)).toBe("/app");
    }
  });
});

describe("describeAgent", () => {
  it("names common browsers and systems", () => {
    expect(
      describeAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Safari/537.36"),
    ).toEqual({ device: "Chrome บน Windows", kind: "desktop" });
    expect(
      describeAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1"),
    ).toEqual({ device: "Safari บน iOS", kind: "mobile" });
    expect(describeAgent("Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 Chrome/141.0 Safari/537.36 Edg/141.0").device).toBe(
      "Edge บน Windows",
    );
    expect(describeAgent("node").device).toBe("Script");
    expect(describeAgent(null).device).toBe("อุปกรณ์ที่ไม่รู้จัก");
  });
});

describe("password rules", () => {
  it("accepts a long mixed password", () => {
    expect(passwordProblem("Doi-Suthep-2027z", "alex@example.com")).toBeNull();
  });
  it("explains the first broken rule", () => {
    expect(passwordProblem("short1", "a@b.co")).toMatch(/10 ตัวอักษร/);
    expect(passwordProblem("onlyletterslong", "a@b.co")).toMatch(/ตัวอักษรและตัวเลข/);
    expect(passwordProblem("alexdemo-2026-x", "alexdemo@example.com")).toMatch(/อีเมล/);
  });
  it("lists all three rules for the live checklist", () => {
    expect(passwordRules("").map((r) => r.ok)).toEqual([false, false, false]);
  });
});

describe("password rules in Thai", () => {
  it("counts Thai letters as letters", () => {
    expect(passwordProblem("รถแดงเชียงใหม่2569", "a@b.co")).toBeNull();
  });
});
