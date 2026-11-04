import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";

export type SessionUser = { id: string; email: string };

/** Verified current user, or a redirect to /login. Cached per request. */
export const requireUser = cache(async (): Promise<SessionUser> => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) redirect("/login");
  return { id: data.user.id, email: data.user.email ?? "" };
});

export const getOptionalUser = cache(async (): Promise<SessionUser | null> => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return data.user ? { id: data.user.id, email: data.user.email ?? "" } : null;
});
