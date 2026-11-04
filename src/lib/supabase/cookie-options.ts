import type { CookieOptionsWithName } from "@supabase/ssr";

// SlipJot never uses the Supabase client in the browser, so the session cookie can be
// httpOnly: injected script cannot read or exfiltrate it. Secure outside local dev.
export const sessionCookieOptions: CookieOptionsWithName = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
};
