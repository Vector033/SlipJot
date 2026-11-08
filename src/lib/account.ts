import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { sql } from "@/db";
import { createClient } from "./supabase/server";
import { isDemoUser } from "./supabase/admin";
import { describeAgent } from "./auth-utils";

export type Account = {
  id: string;
  email: string;
  createdAt: string | null;
  lastSignInAt: string | null;
  hasPassword: boolean;
  google: { email: string | null; identityId: string } | null;
  identityCount: number;
  sessionId: string | null;
  demo: boolean;
};

/** The signed-in user's account details for the settings pages. Cached per request. */
export const getAccount = cache(async (): Promise<Account> => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) redirect("/login");
  const user = data.user;
  const identities = user.identities ?? [];
  const google = identities.find((i) => i.provider === "google");
  const { data: claims } = await supabase.auth.getClaims();
  return {
    id: user.id,
    email: user.email ?? "",
    createdAt: user.created_at ?? null,
    lastSignInAt: user.last_sign_in_at ?? null,
    hasPassword: identities.some((i) => i.provider === "email"),
    google: google
      ? { email: (google.identity_data?.email as string | undefined) ?? null, identityId: google.identity_id }
      : null,
    identityCount: identities.length,
    sessionId: (claims?.claims?.session_id as string | undefined) ?? null,
    demo: isDemoUser(user.email),
  };
});

export type DeviceSession = {
  id: string;
  device: string;
  kind: "desktop" | "mobile";
  ip: string | null;
  lastActive: Date;
  createdAt: Date;
  current: boolean;
};

/**
 * Signed-in sessions from Supabase's auth.sessions, newest activity first. Returns
 * null when the database role cannot read the auth schema, so the page can fall back
 * to the "sign out everywhere else" button alone.
 */
export async function listSessions(account: Account): Promise<DeviceSession[] | null> {
  try {
    const rows = await sql<
      { id: string; user_agent: string | null; ip: string | null; created_at: Date; last_active: Date }[]
    >`
      select id, user_agent, host(ip) as ip, created_at,
             coalesce(refreshed_at, updated_at, created_at) as last_active
      from auth.sessions
      where user_id = ${account.id} and (not_after is null or not_after > now())
      order by last_active desc
      limit 20`;
    return rows.map((r) => ({
      id: r.id,
      ...describeAgent(r.user_agent),
      ip: r.ip,
      lastActive: new Date(r.last_active),
      createdAt: new Date(r.created_at),
      current: r.id === account.sessionId,
    }));
  } catch (e) {
    console.error("listSessions failed", e instanceof Error ? e.message : e);
    return null;
  }
}

/** Ends one of the user's own sessions (never the current one). */
export async function revokeSession(account: Account, sessionId: string) {
  if (sessionId === account.sessionId) return;
  try {
    await sql`delete from auth.sessions where id = ${sessionId} and user_id = ${account.id}`;
  } catch (e) {
    // Same fallback as listSessions: without access to the auth schema the list is hidden anyway.
    console.error("revokeSession failed", e instanceof Error ? e.message : e);
  }
}
