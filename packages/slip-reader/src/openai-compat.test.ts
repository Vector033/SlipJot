import { afterEach, describe, expect, it, vi } from "vitest";
import { assertLocalOnly, extractJson } from "./openai-compat.ts";

describe("assertLocalOnly", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("allows loopback URLs in dev", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("VERCEL", "");
    vi.stubEnv("VERCEL_ENV", "");
    for (const url of ["http://127.0.0.1:31415/v1", "http://localhost:31415/v1", "http://[::1]:31415/v1"])
      expect(() => assertLocalOnly(url)).not.toThrow();
  });

  it("refuses remote hosts, so slips never leave the machine through this path", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("VERCEL", "");
    vi.stubEnv("VERCEL_ENV", "");
    expect(() => assertLocalOnly("https://api.example.com/v1")).toThrow(/loopback/);
    expect(() => assertLocalOnly("http://127.0.0.1.evil.test/v1")).toThrow(/loopback/);
    expect(() => assertLocalOnly("not a url")).toThrow();
  });

  it("refuses to run in production even on loopback", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(() => assertLocalOnly("http://127.0.0.1:31415/v1")).toThrow(/production/);
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("VERCEL_ENV", "production");
    expect(() => assertLocalOnly("http://127.0.0.1:31415/v1")).toThrow(/production/);
  });
});

describe("extractJson", () => {
  it("reads plain, fenced and prose-wrapped JSON", () => {
    expect(extractJson('{"a":1}')).toEqual({ a: 1 });
    expect(extractJson('```json\n{"a":2}\n```')).toEqual({ a: 2 });
    expect(extractJson('Sure! Here it is: {"a":3} Hope that helps.')).toEqual({ a: 3 });
  });
  it("returns null for no JSON", () => {
    expect(extractJson("no json here")).toBeNull();
    expect(extractJson("{broken")).toBeNull();
  });
});
