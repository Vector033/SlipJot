"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createAdminClient, demoEmail } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type AuthState = { error?: string; message?: string };

const credentials = z.object({
  email: z.email("กรอกอีเมลให้ถูกต้อง"),
  password: z.string().min(8, "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร"),
  mode: z.enum(["signin", "signup"]),
});

const AUTH_ERRORS_TH: Record<string, string> = {
  "Invalid login credentials": "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
  "User already registered": "อีเมลนี้สมัครไว้แล้ว ลองเข้าสู่ระบบแทน",
  "A user with this email address has already been registered": "อีเมลนี้สมัครไว้แล้ว ลองเข้าสู่ระบบแทน",
};

const th = (message: string) => AUTH_ERRORS_TH[message] ?? message;

export async function authAction(_prev: AuthState, fd: FormData): Promise<AuthState> {
  const parsed = credentials.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { email, password, mode } = parsed.data;

  if (mode === "signup") {
    // Accounts are created server-side and marked confirmed: SlipJot sends no email, so there
    // is no confirmation link (or redirect URL) to configure on the shared Supabase project.
    const { error } = await createAdminClient().auth.admin.createUser({ email, password, email_confirm: true });
    if (error) return { error: th(error.message) };
  }
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: th(error.message) };
  redirect("/app");
}

/** Opens the shared demo account. The credentials stay on the server. */
export async function demoLoginAction(): Promise<AuthState> {
  const email = demoEmail();
  if (!email) return { error: "ไม่มีบัญชีเดโมในเซิร์ฟเวอร์นี้" };
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password: process.env.DEMO_PASSWORD! });
  if (error) return { error: "เปิดบัญชีเดโมไม่สำเร็จ" };
  redirect("/app");
}
