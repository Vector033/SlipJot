// @slipjot/slip-reader: Thai transfer slip image in, validated JSON with per-field
// confidence out. Gemini when a key is available, local Thai OCR + rules otherwise.
//
// The Gemini path uses only web APIs. Node-only pieces (tesseract, sharp, jsQR) are
// imported lazily, so bundling this for an edge route only fails if you ask for OCR or QR.

import { readWithGemini, SlipReaderError } from "./gemini.ts";
import { readWithLocalLlm } from "./openai-compat.ts";
import { parseSlipText } from "./parse.ts";
import type { ReadSlipOptions, RawSlip, SlipReadResult } from "./types.ts";
import { finalize } from "./validate.ts";

export * from "./types.ts";
export { BANK_NAMES_TH, detectBank } from "./banks.ts";
export { accountLast4, normalizeThaiName, parseAmount, parseThaiDateTime } from "./normalize.ts";
export { parseSlipQr } from "./qr-payload.ts";
export { parseSlipText, type OcrLine } from "./parse.ts";
export { DEFAULT_GEMINI_MODEL, SLIP_SYSTEM_PROMPT, SlipReaderError, fetchWithRetry, fromGemini } from "./gemini.ts";
export { DEFAULT_LOCAL_LLM_URL, assertLocalOnly, chatJson, extractJson, readWithLocalLlm } from "./openai-compat.ts";
export { REVIEW_THRESHOLD, finalize } from "./validate.ts";

const OCR_TIMEOUT_MS = 20_000;

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

  const readWithOcr = async () => {
    const { ocrLines } = await import("./node/ocr.ts");
    const qrPayload = opts.decodeQr === false ? null : await tryDecodeQr(image);
    // A stuck OCR worker must fail the read, not the whole request.
    const lines = await Promise.race([
      ocrLines(image),
      new Promise<never>((_, reject) => setTimeout(() => reject(new SlipReaderError("OCR timed out")), OCR_TIMEOUT_MS)),
    ]);
    return parseSlipText(lines, { now, qrPayload });
  };

  let raw: RawSlip;
  if (provider === "local-llm") {
    // Explicit only, never chosen by "auto". Errors surface so evals see them.
    const qrPayload = opts.decodeQr ? await tryDecodeQr(image) : null;
    raw = await readWithLocalLlm(image, mimeType, { baseUrl: opts.baseUrl, apiKey: opts.apiKey, model: opts.model, now, qrPayload });
  } else if (useGemini) {
    if (!apiKey) throw new SlipReaderError("GEMINI_API_KEY is not set");
    const qrPayload = opts.decodeQr ? await tryDecodeQr(image) : null;
    try {
      raw = await readWithGemini(image, mimeType, { apiKey, model: opts.model, now, qrPayload });
    } catch (err) {
      // "auto" never leaves the user without a result: if Gemini is down or over quota
      // after retries, read locally instead. An explicit "gemini" (evals) surfaces the error.
      if (provider !== "auto") throw err;
      raw = await readWithOcr();
    }
  } else {
    raw = await readWithOcr();
  }
  return { ...finalize(raw, now), elapsedMs: Date.now() - started };
}
