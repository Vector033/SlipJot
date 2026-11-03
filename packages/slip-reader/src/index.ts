// @slipjot/slip-reader: Thai transfer slip image in, validated JSON with per-field
// confidence out. Gemini when a key is available, local Thai OCR + rules otherwise.
//
// The Gemini path uses only web APIs. Node-only pieces (tesseract, sharp, jsQR) are
// imported lazily, so bundling this for an edge route only fails if you ask for OCR or QR.

import { readWithGemini, SlipReaderError } from "./gemini.ts";
import { parseSlipText } from "./parse.ts";
import type { ReadSlipOptions, RawSlip, SlipReadResult } from "./types.ts";
import { finalize } from "./validate.ts";

export * from "./types.ts";
export { BANK_NAMES_TH, detectBank } from "./banks.ts";
export { accountLast4, normalizeThaiName, parseAmount, parseThaiDateTime } from "./normalize.ts";
export { parseSlipQr } from "./qr-payload.ts";
export { parseSlipText, type OcrLine } from "./parse.ts";
export { DEFAULT_GEMINI_MODEL, SlipReaderError, fromGemini } from "./gemini.ts";
export { REVIEW_THRESHOLD, finalize } from "./validate.ts";

function envKey(): string | undefined {
  return typeof process !== "undefined" ? process.env.GEMINI_API_KEY || undefined : undefined;
}

async function tryDecodeQr(image: Uint8Array): Promise<string | null> {
  try {
    const { decodeQr } = await import("./node/image.ts");
    return await decodeQr(image);
  } catch {
    return null;
  }
}

export async function readSlip(
  image: Uint8Array,
  mimeType: string,
  opts: ReadSlipOptions = {},
): Promise<SlipReadResult> {
  const started = Date.now();
  const now = opts.now ?? new Date();
  const apiKey = opts.apiKey ?? envKey();
  const provider = opts.provider ?? "auto";
  const useGemini = provider === "gemini" || (provider === "auto" && !!apiKey);

  let raw: RawSlip;
  if (useGemini) {
    if (!apiKey) throw new SlipReaderError("GEMINI_API_KEY is not set");
    const qrPayload = opts.decodeQr ? await tryDecodeQr(image) : null;
    raw = await readWithGemini(image, mimeType, { apiKey, model: opts.model, now, qrPayload });
  } else {
    const { ocrLines } = await import("./node/ocr.ts");
    const qrPayload = opts.decodeQr === false ? null : await tryDecodeQr(image);
    raw = parseSlipText(await ocrLines(image), { now, qrPayload });
  }
  return { ...finalize(raw, now), elapsedMs: Date.now() - started };
}
