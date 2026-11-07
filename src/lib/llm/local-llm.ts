import { assertLocalOnly, DEFAULT_LOCAL_LLM_URL } from "@slipjot/slip-reader";

// Dev-only switch: SLIP_LLM_PROVIDER=freellmapi sends slip reads and category guesses to
// FreeLLMAPI on this machine instead of Gemini. Free tiers may keep what they receive, so use
// it ONLY with synthetic slips (eval/fixtures, public/demo). Production ignores it.
// Also imported by the eval scripts, so no "server-only" and no "@/" imports here.

export interface LocalLlmConfig {
  baseUrl: string;
  apiKey: string | undefined;
  model: string;
}

/** The local router config, or null when it is off, misconfigured, or we are in production. */
export function localLlmConfig(env: Record<string, string | undefined> = process.env): LocalLlmConfig | null {
  if (env.SLIP_LLM_PROVIDER !== "freellmapi") return null;
  const cfg = {
    baseUrl: env.FREELLMAPI_URL || DEFAULT_LOCAL_LLM_URL,
    apiKey: env.FREELLMAPI_KEY || undefined,
    model: env.FREELLMAPI_MODEL || "gemini-3.5-flash-lite",
  };
  try {
    assertLocalOnly(cfg.baseUrl);
  } catch (err) {
    console.warn(`SLIP_LLM_PROVIDER=freellmapi ignored: ${(err as Error).message}`);
    return null;
  }
  return cfg;
}
