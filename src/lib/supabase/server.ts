import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies, headers } from "next/headers";
import { sessionCookieOptions } from "./cookie-options";

export async function createClient() {
  const cookieStore = await cookies();
  const h = await headers();
  // Sign-in runs in a server action, so without this Supabase would record the server's user
  // agent and IP on every session, and the account page could not tell devices apart.
  const forwarded: Record<string, string> = {};
  const ua = h.get("user-agent");
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip");
  if (ua) forwarded["user-agent"] = ua;
  if (ip) forwarded["x-forwarded-for"] = ip;
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookieOptions: sessionCookieOptions,
      global: { headers: forwarded },
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) cookieStore.set(name, value, { ...options, ...sessionCookieOptions });
          } catch {
            // Called from a Server Component, where cookies are read-only. The
            // proxy refreshes the session, so this is safe to ignore.
          }
        },
      },
    },
  );
}
