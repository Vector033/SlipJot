import "server-only";
import { headers } from "next/headers";

/** Google sign-in shows only where the provider is configured (README "Google sign-in"). */
export function googleEnabled() {
  return process.env.GOOGLE_AUTH_ENABLED === "true";
}

/** The site's own origin, from the request, for OAuth redirect URLs. */
export async function requestOrigin() {
  const h = await headers();
  const origin = h.get("origin");
  if (origin) return origin;
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  return `${proto}://${host}`;
}
