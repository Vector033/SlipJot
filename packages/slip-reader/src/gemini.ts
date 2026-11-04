// Gemini vision provider. Uses only fetch/btoa so it runs in Node, edge and browsers.

import { z } from "zod";
import { detectBank } from "./banks.ts";
import { accountLast4, parseThaiDateTime } from "./normalize.ts";
import { parseSlipQr } from "./qr-payload.ts";
import { BANK_CODES, type BankCode, type Field, type Party, type RawSlip } from "./types.ts";
import { empty } from "./validate.ts";

export class SlipReaderError extends Error {
  readonly status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.status = status;
  }
}

const RETRYABLE = new Set([429, 500, 502, 503, 504]);

/** Seconds Google asks us to wait (RetryInfo.retryDelay), and whether a per-day quota ran out. */
async function quotaHint(res: Response): Promise<{ waitS: number | null; daily: boolean }> {
  try {
    const body = (await res.clone().json()) as {
      error?: { details?: { retryDelay?: string; violations?: { quotaId?: string }[] }[] };
    };
    const details = body.error?.details ?? [];
    const delay = details.find((d) => d.retryDelay)?.retryDelay;
    const daily = details.some((d) => d.violations?.some((v) => /PerDay/i.test(v.quotaId ?? "")));
    return { waitS: delay ? parseFloat(delay) : null, daily };
  } catch {
    return { waitS: null, daily: false };
  }
}

/**
 * Gemini returns 503 "high demand" and per-minute 429s routinely; back off and retry.
 * A per-day quota is not retried: waiting minutes inside a request helps nobody.
 */
export async function fetchWithRetry(url: string, init: RequestInit, attempts = 4): Promise<Response> {
  for (let i = 0; ; i++) {
    const res = await fetch(url, { ...init, signal: AbortSignal.timeout(60_000) });
    if (res.ok || !RETRYABLE.has(res.status) || i === attempts - 1) return res;
    const hint = res.status === 429 ? await quotaHint(res) : { waitS: null, daily: false };
    if (hint.daily) return res;
    const retryAfter = Number(res.headers.get("retry-after")) || hint.waitS;
    const delay = retryAfter ? retryAfter * 1000 + 500 : 1000 * 2 ** i + Math.random() * 500;
    await new Promise((r) => setTimeout(r, Math.min(delay, 65_000)));
  }
}

// Flash-Lite reads synthetic slips as well as Flash (eval/results), costs less, and its free tier
// is not capped at 5 requests/minute like Flash, which matters for batch uploads.
export const DEFAULT_GEMINI_MODEL = "gemini-flash-lite-latest";

const conf = z.number().min(0).max(1).describe("How sure you are this value is exactly what is printed, 0 to 1");
const party = z.object({
  name: z.string().nullable().describe("Name exactly as printed, including any title like นาย/น.ส./MR."),
  name_confidence: conf,
  bank: z.enum(BANK_CODES).nullable().describe("Bank or wallet of this party; OTHER if a bank is shown but not in the list"),
  bank_confidence: conf,
  account_masked: z
    .string()
    .nullable()
    .describe("Account or PromptPay number exactly as printed, masks included, e.g. xxx-x-x1234-x"),
  account_confidence: conf,
});

export const geminiSlipSchema = z.object({
  is_transfer_slip: z.boolean().describe("false if the image is not a Thai bank/wallet transfer or payment slip"),
  amount: z.number().nullable().describe("Transferred amount in THB, without the fee"),
  amount_confidence: conf,
  date_text: z.string().nullable().describe("Date and time exactly as printed, e.g. '4 พ.ย. 69 12:34 น.'"),
  datetime_iso: z
    .string()
    .nullable()
    .describe("Same moment as ISO 8601 with +07:00. Convert Buddhist-era years (2569 or 69) to Gregorian (2026)."),
  datetime_confidence: conf,
  sender: party,
  receiver: party,
  reference: z.string().nullable().describe("Transaction reference / เลขที่รายการ / รหัสอ้างอิง exactly as printed"),
  reference_confidence: conf,
  memo: z.string().nullable().describe("Memo / บันทึกช่วยจำ written by the payer, if any"),
  memo_confidence: conf,
});
export type GeminiSlip = z.infer<typeof geminiSlipSchema>;

const SYSTEM = `You read Thai bank and e-wallet transfer slips (K PLUS, SCB EASY, Bangkok Bank, Krungthai NEXT, KMA, ttb, MyMo, TrueMoney, PromptPay).
Copy values exactly as printed. Never guess a value that is not visible: use null and confidence 0.
"sender" is the payer (จาก / From / ผู้โอน), "receiver" is the payee (ไปยัง / To / ผู้รับ).
Amount is the transfer amount, not the fee (ค่าธรรมเนียม) and not the balance.`;

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
}

function f<T>(value: T | null | undefined, confidence: number): Field<T> {
  return value === null || value === undefined || value === "" ? empty<T>() : { value, confidence };
}

function toParty(p: GeminiSlip["sender"]): Party {
  const bank: BankCode | null = p.bank ?? (p.name ? detectBank(p.name) : null);
  return {
    name: f(p.name?.trim(), p.name_confidence),
    bank: f(bank, p.bank ? p.bank_confidence : 0.5),
    accountLast4: f(p.account_masked ? accountLast4(p.account_masked) : null, p.account_confidence),
  };
}

/** Converts the model's JSON into the shared shape. Our own date parser wins over the model's ISO. */
export function fromGemini(g: GeminiSlip, now = new Date()): RawSlip {
  const parsedDate = g.date_text ? parseThaiDateTime(g.date_text, now) : null;
  const iso = parsedDate ?? (g.datetime_iso && !Number.isNaN(Date.parse(g.datetime_iso)) ? g.datetime_iso : null);
  // Disagreement between the printed text and the model's conversion is a red flag.
  const dateConf =
    parsedDate && g.datetime_iso && Date.parse(parsedDate) !== Date.parse(g.datetime_iso)
      ? Math.min(g.datetime_confidence, 0.6)
      : g.datetime_confidence;
  const notSlip = g.is_transfer_slip ? 1 : 0.2;
  return {
    amount: f(g.amount, g.amount_confidence * notSlip),
    dateTime: f(iso, dateConf * notSlip),
    sender: toParty(g.sender),
    receiver: toParty(g.receiver),
    reference: f(g.reference?.trim(), g.reference_confidence),
    memo: f(g.memo?.trim(), g.memo_confidence),
    qrPayload: null,
    source: "gemini",
  };
}

/** USD per 1M tokens. Override with GEMINI_PRICE_IN / GEMINI_PRICE_OUT when the price list changes. */
function prices() {
  const env: Record<string, string | undefined> = typeof process !== "undefined" ? process.env : {};
  return {
    input: Number(env.GEMINI_PRICE_IN ?? 0.3),
    output: Number(env.GEMINI_PRICE_OUT ?? 2.5),
  };
}

export async function readWithGemini(
  image: Uint8Array,
  mimeType: string,
  opts: { apiKey: string; model?: string; now?: Date; qrPayload?: string | null },
): Promise<RawSlip> {
  const model = opts.model || DEFAULT_GEMINI_MODEL;
  const res = await fetchWithRetry(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-goog-api-key": opts.apiKey },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM }] },
      contents: [
        {
          role: "user",
          parts: [
            { inlineData: { mimeType, data: toBase64(image) } },
            { text: "Read this slip." },
          ],
        },
      ],
      generationConfig: {
        temperature: 0,
        responseMimeType: "application/json",
        responseJsonSchema: z.toJSONSchema(geminiSlipSchema, { target: "draft-7" }),
      },
    }),
  });
  if (!res.ok) throw new SlipReaderError(`Gemini ${res.status}: ${(await res.text()).slice(0, 300)}`, res.status);
  const body = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
    usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number; thoughtsTokenCount?: number };
  };
  const text = body.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new SlipReaderError("Gemini did not return JSON");
  }
  const result = geminiSlipSchema.safeParse(parsed);
  if (!result.success) throw new SlipReaderError(`Gemini output failed validation: ${result.error.message}`);

  const raw = fromGemini(result.data, opts.now);
  const qr = opts.qrPayload ? parseSlipQr(opts.qrPayload) : null;
  if (qr?.reference) raw.reference = { value: qr.reference, confidence: 0.98 };
  raw.qrPayload = opts.qrPayload ?? null;

  const inputTokens = body.usageMetadata?.promptTokenCount ?? 0;
  // Thinking tokens are billed as output.
  const outputTokens = (body.usageMetadata?.candidatesTokenCount ?? 0) + (body.usageMetadata?.thoughtsTokenCount ?? 0);
  const p = prices();
  raw.model = model;
  raw.usage = {
    inputTokens,
    outputTokens,
    costUsd: (inputTokens * p.input + outputTokens * p.output) / 1_000_000,
  };
  return raw;
}
