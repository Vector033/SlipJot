// OpenAI-compatible vision provider for LOCAL dev and evals only, e.g. FreeLLMAPI at
// http://127.0.0.1:31415/v1, which routes to free tiers of many providers.
//
// Free tiers may keep or train on what they receive, so this path must only ever see synthetic,
// fictional slips. Two guards make that hard to get wrong:
//   1. the base URL must be a loopback address (a deployed server cannot reach it anyway), and
//   2. it refuses to run in production (NODE_ENV=production or VERCEL_ENV=production).
// Same prompt and JSON schema as the Gemini path, so results are directly comparable.

import { z } from "zod";
import { fetchWithRetry, fromGemini, geminiSlipSchema, SlipReaderError, SLIP_SYSTEM_PROMPT } from "./gemini.ts";
import { parseSlipQr } from "./qr-payload.ts";
import type { RawSlip } from "./types.ts";

export const DEFAULT_LOCAL_LLM_URL = "http://127.0.0.1:31415/v1";

const LOOPBACK = new Set(["127.0.0.1", "localhost", "::1", "[::1]"]);

/** Throws unless `baseUrl` points at this machine and we are not running in production. */
export function assertLocalOnly(baseUrl: string): void {
  const env: Record<string, string | undefined> = typeof process !== "undefined" ? process.env : {};
  if (env.NODE_ENV === "production" || env.VERCEL_ENV === "production" || env.VERCEL === "1")
    throw new SlipReaderError("The local LLM provider is for dev and evals only; it is disabled in production.");
  let host: string;
  try {
    host = new URL(baseUrl).hostname;
  } catch {
    throw new SlipReaderError(`Local LLM base URL is not a URL: ${baseUrl}`);
  }
  if (!LOOPBACK.has(host))
    throw new SlipReaderError(`Local LLM base URL must be a loopback address (127.0.0.1/localhost), got ${host}.`);
}

export interface LocalLlmOptions {
  baseUrl?: string;
  apiKey?: string;
  /** Router model id, e.g. "gemini-3.5-flash-lite", "gemma-4-31b" or "auto". */
  model?: string;
  timeoutMs?: number;
}

type ChatContent = string | ({ type: "text"; text: string } | { type: "image_url"; image_url: { url: string } })[];

/** Strips ```json fences and leading prose some free models add around the JSON. */
export function extractJson(text: string): unknown {
  const fenced = /```(?:json)?\s*([\s\S]*?)```/i.exec(text);
  const body = fenced ? fenced[1] : text;
  const start = body.indexOf("{");
  const end = body.lastIndexOf("}");
  if (start < 0 || end < start) return null;
  try {
    return JSON.parse(body.slice(start, end + 1));
  } catch {
    return null;
  }
}

/**
 * One chat completion that must answer with JSON matching `schema`. Asks for strict
 * json_schema output; models that ignore it still get the schema in the prompt.
 */
export async function chatJson<T extends z.ZodType>(
  schema: T,
  system: string,
  user: ChatContent,
  opts: LocalLlmOptions & { budgetMs?: number },
): Promise<{ data: z.infer<T>; model: string; inputTokens: number; outputTokens: number }> {
  const baseUrl = (opts.baseUrl || DEFAULT_LOCAL_LLM_URL).replace(/\/+$/, "");
  assertLocalOnly(baseUrl);
  const jsonSchema = z.toJSONSchema(schema, { target: "draft-7" });
  const res = await fetchWithRetry(
    `${baseUrl}/chat/completions`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(opts.apiKey ? { authorization: `Bearer ${opts.apiKey}` } : {}),
      },
      body: JSON.stringify({
        model: opts.model || "auto",
        temperature: 0,
        messages: [
          { role: "system", content: `${system}\n\nAnswer with one JSON object only, matching this JSON Schema:\n${JSON.stringify(jsonSchema)}` },
          { role: "user", content: user },
        ],
        response_format: { type: "json_schema", json_schema: { name: "answer", schema: jsonSchema } },
      }),
    },
    // Free routers are slower and fail over between providers; give them more room than Gemini.
    { attempts: 2, attemptTimeoutMs: opts.timeoutMs ?? 90_000, budgetMs: opts.budgetMs ?? 120_000 },
  );
  if (!res.ok) throw new SlipReaderError(`Local LLM ${res.status}: ${(await res.text()).slice(0, 300)}`, res.status);
  const body = (await res.json()) as {
    model?: string;
    choices?: { message?: { content?: string | null } }[];
    usage?: { prompt_tokens?: number; completion_tokens?: number };
  };
  const text = body.choices?.[0]?.message?.content ?? "";
  const parsed = schema.safeParse(extractJson(text));
  if (!parsed.success) throw new SlipReaderError(`Local LLM output failed validation: ${text.slice(0, 200)}`);
  return {
    data: parsed.data,
    model: body.model || opts.model || "auto",
    inputTokens: body.usage?.prompt_tokens ?? 0,
    outputTokens: body.usage?.completion_tokens ?? 0,
  };
}

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(binary);
}

export async function readWithLocalLlm(
  image: Uint8Array,
  mimeType: string,
  opts: LocalLlmOptions & { now?: Date; qrPayload?: string | null },
): Promise<RawSlip> {
  const out = await chatJson(geminiSlipSchema, SLIP_SYSTEM_PROMPT, [
    { type: "image_url", image_url: { url: `data:${mimeType};base64,${toBase64(image)}` } },
    { type: "text", text: "Read this slip." },
  ], opts);
  const raw = fromGemini(out.data, opts.now);
  const qr = opts.qrPayload ? parseSlipQr(opts.qrPayload) : null;
  if (qr?.reference) raw.reference = { value: qr.reference, confidence: 0.98 };
  raw.qrPayload = opts.qrPayload ?? null;
  raw.source = "local-llm";
  raw.model = `local:${out.model}`;
  // Free tier: no money spent, but keep the token counts for comparison.
  raw.usage = { inputTokens: out.inputTokens, outputTokens: out.outputTokens, costUsd: 0 };
  return raw;
}
