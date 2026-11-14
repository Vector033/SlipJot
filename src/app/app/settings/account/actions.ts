"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient as createStatelessClient } from "@supabase/supabase-js";
import { getAccount, revokeSession } from "@/lib/account";
import { isBreachedPassword } from "@/lib/breached-password";
import { passwordProblem } from "@/lib/password";
import { LIMITS, RateLimitError, enforce, retryText } from "@/lib/rate-limit";
import { googleEnabled, requestOrigin } from "@/lib/site";
import { createClient } from "@/lib/supabase/server";

export type AccountState = { error?: string; message?: string };

const DEMO = "บัญชีเดโมใช้ร่วมกันหลายคน จึงเปลี่ยนการเข้าสู่ระบบไม่ได้";

/**
 * Checks the current password without touching the browser's session: a throwaway
 * client signs in, and that extra session is ended straight away.
 */
async function verifyPassword(email: string, password: string) {
  const temp = createStatelessClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error } = await temp.auth.signInWithPassword({ email, password });
  if (error) return false;
  await temp.auth.signOut({ scope: "local" });
  return true;
}

export async function changePasswordAction(_prev: AccountState, fd: FormData): Promise<AccountState> {
  const account = await getAccount();
  if (account.demo) return { error: DEMO };
  const current = String(fd.get("current") ?? "");
  const next = String(fd.get("password") ?? "");
  const confirm = String(fd.get("confirm") ?? "");

  try {
    // Same budget as signing in: this form can be used to guess the current password.
    await enforce([LIMITS.signinEmail, account.email]);
  } catch (e) {
    if (e instanceof RateLimitError) return { error: `ลองหลายครั้งเกินไป รออีก ${retryText(e.retryAfterSec)} แล้วลองใหม่` };
    throw e;
  }

  const problem = passwordProblem(next, account.email);
  if (problem) return { error: problem };
  if (next !== confirm) return { error: "รหัสผ่านใหม่สองช่องไม่ตรงกัน พิมพ์อีกครั้ง" };
  if (account.hasPassword) {
    if (!current) return { error: "กรอกรหัสผ่านปัจจุบันก่อน" };
    if (current === next) return { error: "รหัสผ่านใหม่ต้องไม่ซ้ำกับรหัสเดิม" };
    if (!(await verifyPassword(account.email, current))) return { error: "รหัสผ่านปัจจุบันไม่ถูกต้อง" };
  }
  if (await isBreachedPassword(next)) {
    return { error: "รหัสผ่านนี้เคยหลุดในเหตุข้อมูลรั่วของเว็บอื่นแล้ว เลือกรหัสใหม่ที่ไม่ซ้ำกับที่เคยใช้" };
  }

  const supabase = await createClient();
  // Send the current password too: Supabase demands it (when the project setting "Require current
  // password" is on) for accounts that already have one, and ignores it otherwise.
  const { error } = await supabase.auth.updateUser({ password: next, ...(current && { current_password: current }) });
  if (error) {
    // The account may already have this password (set from another app on the same Supabase project).
    if (error.code?.startsWith("current_password")) return { error: "รหัสผ่านปัจจุบันไม่ถูกต้อง" };
    if (error.code === "same_password") return { error: "รหัสผ่านนี้ตั้งไว้แล้ว ใช้เข้าสู่ระบบได้เลย หรือเลือกรหัสใหม่" };
    console.error("updateUser password failed", error.code ?? error.message);
    return { error: "บันทึกรหัสผ่านใหม่ไม่สำเร็จ ลองใหม่ในอีกสักครู่" };
  }
  if (fd.get("signOutOthers") === "on") await supabase.auth.signOut({ scope: "others" });
  revalidatePath("/app/settings/account");
  return {
    message: account.hasPassword
      ? "เปลี่ยนรหัสผ่านแล้ว"
      : "ตั้งรหัสผ่านแล้ว จากนี้เข้าสู่ระบบด้วยอีเมลได้ด้วย นอกจาก Google",
  };
}

export async function signOutOthersAction(): Promise<AccountState> {
  const account = await getAccount();
  if (account.demo) return { error: DEMO };
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut({ scope: "others" });
  if (error) return { error: "ออกจากระบบเครื่องอื่นไม่สำเร็จ ลองอีกครั้ง" };
  revalidatePath("/app/settings/account");
  return { message: "ออกจากระบบทุกเครื่องแล้ว ยกเว้นเครื่องนี้" };
}

export async function revokeSessionAction(fd: FormData): Promise<void> {
  const account = await getAccount();
  const id = String(fd.get("sessionId") ?? "");
  if (account.demo || !/^[0-9a-f-]{36}$/i.test(id)) return;
  await revokeSession(account, id);
  revalidatePath("/app/settings/account");
}

/** "เชื่อม Google": Supabase links the Google identity, then returns here. */
export async function linkGoogleAction(): Promise<AccountState> {
  const account = await getAccount();
  if (account.demo) return { error: DEMO };
  if (!googleEnabled()) return { error: "เซิร์ฟเวอร์นี้ยังไม่ได้เปิดใช้ Google" };
  const supabase = await createClient();
  const { data, error } = await supabase.auth.linkIdentity({
    provider: "google",
    options: {
      redirectTo: `${await requestOrigin()}/auth/callback?next=${encodeURIComponent("/app/settings/account?linked=google")}`,
    },
  });
  if (error || !data.url) {
    return {
      error: /manual linking/i.test(error?.message ?? "")
        ? "เซิร์ฟเวอร์นี้ปิดการเชื่อมบัญชีไว้"
        : "ติดต่อ Google ไม่ได้ ลองอีกครั้ง",
    };
  }
  redirect(data.url);
}

export async function unlinkGoogleAction(): Promise<AccountState> {
  const account = await getAccount();
  if (account.demo) return { error: DEMO };
  if (!account.google) return {};
  // Never remove the last way in.
  if (!account.hasPassword) return { error: "ตั้งรหัสผ่านก่อน จะได้ยังเข้าสู่ระบบได้โดยไม่ต้องใช้ Google" };
  // Supabase refuses to unlink a user's last identity; a password alone adds none.
  if (account.identityCount < 2) return { error: "Google เป็นทางเข้าเดียวที่ผูกกับบัญชีนี้ จึงยกเลิกการเชื่อมไม่ได้" };
  const supabase = await createClient();
  const { data } = await supabase.auth.getUserIdentities();
  const identity = data?.identities.find((i) => i.provider === "google");
  if (!identity) return {};
  const { error } = await supabase.auth.unlinkIdentity(identity);
  if (error) return { error: "ยกเลิกการเชื่อม Google ไม่สำเร็จ ลองอีกครั้ง" };
  revalidatePath("/app/settings/account");
  return { message: "ยกเลิกการเชื่อม Google แล้ว จากนี้เข้าสู่ระบบด้วยอีเมลและรหัสผ่าน" };
}
