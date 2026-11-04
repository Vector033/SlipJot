import "server-only";
import { createClient } from "@supabase/supabase-js";

/** Service-role client for account creation and deletion. Never import from client code. */
export function createAdminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** The shared demo account (fictional data) that visitors can open without signing up. */
export function demoEmail(): string | null {
  return process.env.DEMO_EMAIL && process.env.DEMO_PASSWORD ? process.env.DEMO_EMAIL : null;
}

export function isDemoUser(email: string | null | undefined) {
  const demo = demoEmail();
  return !!demo && email?.toLowerCase() === demo.toLowerCase();
}
