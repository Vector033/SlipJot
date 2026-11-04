"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
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
};

export async function authAction(_prev: AuthState, fd: FormData): Promise<AuthState> {
  const parsed = credentials.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { email, password, mode } = parsed.data;
  const supabase = await createClient();

  if (mode === "signup") {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { error: AUTH_ERRORS_TH[error.message] ?? error.message };
    if (!data.session) return { message: "เช็กอีเมลเพื่อยืนยันบัญชี แล้วกลับมาเข้าสู่ระบบ" };
  } else {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: AUTH_ERRORS_TH[error.message] ?? error.message };
  }
  redirect("/app");
}
