import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { UnsafeImageError, sanitizeImage, sniffImageType } from "./image-safety";
import { isSameOrigin } from "./request-guard";

async function jpegWithGps() {
  return new Uint8Array(
    await sharp({ create: { width: 600, height: 900, channels: 3, background: "#ffffff" } })
      .jpeg()
      .withExif({ IFD0: { Make: "SecretPhone", Artist: "Somchai" }, IFD3: { GPSLatitudeRef: "N", GPSLatitude: "18/1 47/1 0/1" } })
      .toBuffer(),
  );
}

describe("sniffImageType", () => {
  it("trusts bytes, not names", async () => {
    expect(sniffImageType(await jpegWithGps())).toBe("image/jpeg");
    const png = new Uint8Array(await sharp({ create: { width: 10, height: 10, channels: 3, background: "#000" } }).png().toBuffer());
    expect(sniffImageType(png)).toBe("image/png");
    expect(sniffImageType(new TextEncoder().encode("<svg onload=alert(1)>"))).toBeNull();
    expect(sniffImageType(new TextEncoder().encode("%PDF-1.7"))).toBeNull();
  });
});

describe("sanitizeImage", () => {
  it("re-encodes and drops EXIF, including GPS", async () => {
    const input = await jpegWithGps();
    expect((await sharp(input).metadata()).exif).toBeDefined();
    const safe = await sanitizeImage(input);
    const meta = await sharp(safe.bytes).metadata();
    expect(meta.exif).toBeUndefined();
    expect(meta.format).toBe("jpeg");
    expect(Buffer.from(safe.bytes).includes(Buffer.from("SecretPhone"))).toBe(false);
  });

  it("drops bytes appended after the image", async () => {
    const input = await jpegWithGps();
    const tail = new TextEncoder().encode("<script>steal()</script>");
    const polyglot = new Uint8Array([...input, ...tail]);
    const safe = await sanitizeImage(polyglot);
    expect(Buffer.from(safe.bytes).includes(Buffer.from("steal()"))).toBe(false);
  });

  it("refuses non-images, broken files and tiny images", async () => {
    await expect(sanitizeImage(new TextEncoder().encode("GIF89a not really"))).rejects.toBeInstanceOf(UnsafeImageError);
    const broken = (await jpegWithGps()).slice(0, 200);
    await expect(sanitizeImage(broken)).rejects.toBeInstanceOf(UnsafeImageError);
    const tiny = new Uint8Array(await sharp({ create: { width: 50, height: 50, channels: 3, background: "#fff" } }).jpeg().toBuffer());
    await expect(sanitizeImage(tiny)).rejects.toThrow(/เล็กเกินไป/);
  });

  it("shrinks huge screenshots to a 2000px long edge", async () => {
    const big = new Uint8Array(await sharp({ create: { width: 1200, height: 4000, channels: 3, background: "#fff" } }).png().toBuffer());
    const safe = await sanitizeImage(big);
    expect(Math.max(safe.width, safe.height)).toBe(2000);
  });
});

describe("isSameOrigin", () => {
  const req = (h: Record<string, string>) => new Request("https://slipjot.vercel.app/api/slips", { method: "POST", headers: h });

  it("accepts our own pages", () => {
    expect(isSameOrigin(req({ "sec-fetch-site": "same-origin" }))).toBe(true);
    expect(isSameOrigin(req({ origin: "https://slipjot.vercel.app", host: "slipjot.vercel.app" }))).toBe(true);
  });

  it("refuses other sites and missing evidence", () => {
    expect(isSameOrigin(req({ "sec-fetch-site": "cross-site", origin: "https://evil.example" }))).toBe(false);
    expect(isSameOrigin(req({ origin: "https://evil.example", host: "slipjot.vercel.app" }))).toBe(false);
    expect(isSameOrigin(req({}))).toBe(false);
    expect(isSameOrigin(req({ "sec-fetch-site": "none" }))).toBe(false);
  });

  it("lets the share sheet's top-level navigation through only where asked", () => {
    expect(isSameOrigin(req({ "sec-fetch-site": "none" }), { allowNavigation: true })).toBe(true);
    expect(isSameOrigin(req({ "sec-fetch-site": "same-site" }), { allowNavigation: true })).toBe(false);
  });
});
