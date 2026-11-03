// Node-only image helpers (sharp, jsQR). Imported lazily by readSlip so the Gemini
// path stays free of native modules.
import { createHash } from "node:crypto";
import jsQR from "jsqr";
import sharp from "sharp";

/** Grayscale, upscaled so text is at least ~1000 px wide, contrast stretched: what tesseract likes. */
export async function preprocessForOcr(image: Uint8Array): Promise<Buffer> {
  const img = sharp(image).rotate();
  const meta = await img.metadata();
  const width = meta.width ?? 1000;
  return img
    .resize({ width: width < 1000 ? 1000 : Math.min(width, 1600) })
    .grayscale()
    .normalize()
    .png()
    .toBuffer();
}

/** Text of the first QR code in the image, or null. */
export async function decodeQr(image: Uint8Array): Promise<string | null> {
  const base = sharp(image).rotate();
  const meta = await base.metadata();
  // jsQR struggles on very large images; QR modules on slips stay readable at ~800 px.
  const width = Math.min(meta.width ?? 800, 800);
  const { data, info } = await base.resize({ width }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const code = jsQR(new Uint8ClampedArray(data.buffer, data.byteOffset, data.length), info.width, info.height, {
    inversionAttempts: "dontInvert",
  });
  return code?.data || null;
}

export function sha256(image: Uint8Array): string {
  return createHash("sha256").update(image).digest("hex");
}

/**
 * 64-bit difference hash as 16 hex chars. Screenshots of the same slip at another
 * size or JPEG quality land within a few bits of each other.
 */
export async function dHash(image: Uint8Array): Promise<string> {
  const { data } = await sharp(image)
    .rotate()
    .grayscale()
    .resize(9, 8, { fit: "fill" })
    .raw()
    .toBuffer({ resolveWithObject: true });
  let bits = 0n;
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      bits = (bits << 1n) | (data[y * 9 + x] > data[y * 9 + x + 1] ? 1n : 0n);
    }
  }
  return bits.toString(16).padStart(16, "0");
}

export function hammingHex(a: string, b: string): number {
  let x = BigInt("0x" + a) ^ BigInt("0x" + b);
  let n = 0;
  while (x) {
    n += Number(x & 1n);
    x >>= 1n;
  }
  return n;
}
