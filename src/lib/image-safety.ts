import "server-only";
import sharp from "sharp";

// Every uploaded file passes through here before anything reads, hashes or stores it.
// The declared MIME type is ignored: the bytes decide what the file is. Accepted images
// are decoded and re-encoded, which drops EXIF (GPS, device, owner), ICC tricks and any
// payload appended after the image data.

const SIGNATURES: { type: "image/jpeg" | "image/png" | "image/webp"; test: (b: Uint8Array) => boolean }[] = [
  { type: "image/jpeg", test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { type: "image/png", test: (b) => [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((v, i) => b[i] === v) },
  {
    type: "image/webp",
    test: (b) => String.fromCharCode(...b.subarray(0, 4)) === "RIFF" && String.fromCharCode(...b.subarray(8, 12)) === "WEBP",
  },
];

/** Max decoded pixels (a 4000x6000 photo). Stops decompression bombs before they allocate. */
const MAX_PIXELS = 24_000_000;
/** Long edge kept for reading and review; slips stay sharp, files stay small. */
const MAX_EDGE = 2000;

export class UnsafeImageError extends Error {}

export function sniffImageType(bytes: Uint8Array) {
  return SIGNATURES.find((s) => s.test(bytes))?.type ?? null;
}

export interface SafeImage {
  bytes: Uint8Array;
  mimeType: "image/jpeg";
  width: number;
  height: number;
}

export async function sanitizeImage(input: Uint8Array): Promise<SafeImage> {
  if (!sniffImageType(input)) throw new UnsafeImageError("รองรับเฉพาะรูป JPG, PNG หรือ WebP");
  try {
    const img = sharp(input, { limitInputPixels: MAX_PIXELS, failOn: "error", animated: false });
    const meta = await img.metadata();
    if (!meta.width || !meta.height) throw new UnsafeImageError("อ่านขนาดรูปไม่ได้");
    if (meta.width < 200 || meta.height < 200) throw new UnsafeImageError("รูปเล็กเกินไปจะอ่านสลิปไม่ออก");
    const { data, info } = await img
      .rotate() // apply EXIF orientation, then drop the EXIF
      .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: "inside", withoutEnlargement: true })
      .flatten({ background: "#ffffff" })
      .jpeg({ quality: 88, mozjpeg: true })
      .toBuffer({ resolveWithObject: true });
    return { bytes: new Uint8Array(data), mimeType: "image/jpeg", width: info.width, height: info.height };
  } catch (err) {
    if (err instanceof UnsafeImageError) throw err;
    throw new UnsafeImageError("ไฟล์นี้ไม่ใช่รูปที่เปิดได้ หรือใหญ่เกินไป");
  }
}
