"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import * as data from "@/lib/data";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { fromLocalInput } from "@/lib/core/format";

const form = (fd: FormData) => Object.fromEntries(fd) as Record<string, string>;
const uuid = z.uuid();

const expenseSchema = z.object({
  amount: z.coerce.number().positive("ยอดต้องมากกว่า 0").max(10_000_000),
  occurredAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "กรอกวันเวลาให้ครบ")
    .transform(fromLocalInput),
  payeeName: z.string().trim().max(200),
  categoryId: z
    .string()
    .trim()
    .transform((s) => s || null)
    .pipe(uuid.nullable()),
  memo: z
    .string()
    .trim()
    .max(300)
    .transform((s) => s || null),
});

export type FormState = { error?: string; ok?: boolean };

function firstIssue(err: z.ZodError) {
  return err.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง";
}

function revalidateAll() {
  revalidatePath("/app", "layout");
}

/** Save edits from the review queue or the edit page. `intent=confirm` also marks it checked. */
export async function saveExpenseAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const f = form(fd);
  const id = uuid.safeParse(f.id);
  if (!id.success) return { error: "ไม่พบรายการ" };
  const parsed = expenseSchema.safeParse(f);
  if (!parsed.success) return { error: firstIssue(parsed.error) };
  await data.updateExpense(id.data, parsed.data, f.intent === "confirm");
  revalidateAll();
  if (f.redirectTo?.startsWith("/app")) redirect(f.redirectTo);
  return { ok: true };
}

export async function createExpenseAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const parsed = expenseSchema.safeParse(form(fd));
  if (!parsed.success) return { error: firstIssue(parsed.error) };
  await data.createManualExpense(parsed.data);
  revalidateAll();
  redirect("/app/expenses");
}

export async function deleteExpenseAction(fd: FormData) {
  const id = uuid.parse(form(fd).id);
  await data.deleteExpense(id);
  revalidateAll();
  const to = form(fd).redirectTo;
  if (to?.startsWith("/app")) redirect(to);
}

const categorySchema = z.object({
  id: z
    .string()
    .transform((s) => s || undefined)
    .pipe(uuid.optional()),
  name: z.string().trim().min(1, "ตั้งชื่อหมวด").max(40),
  icon: z.string().trim().min(1).max(8),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  monthlyBudget: z
    .string()
    .trim()
    .transform((s) => (s ? Number(s.replace(/,/g, "")) : null))
    .pipe(z.number().nonnegative().max(10_000_000).nullable()),
});

export async function saveCategoryAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const parsed = categorySchema.safeParse(form(fd));
  if (!parsed.success) return { error: firstIssue(parsed.error) };
  try {
    await data.saveCategory({ ...parsed.data, monthlyBudget: parsed.data.monthlyBudget || null });
  } catch {
    return { error: "มีหมวดชื่อนี้แล้ว" };
  }
  revalidateAll();
  return { ok: true };
}

export async function deleteCategoryAction(fd: FormData) {
  await data.deleteCategory(uuid.parse(form(fd).id));
  revalidateAll();
}

export async function setKeepImagesAction(fd: FormData) {
  await data.setKeepImages(form(fd).keep === "on");
  revalidateAll();
}

export async function deleteAllDataAction(fd: FormData) {
  if (form(fd).confirm !== "ลบ") return;
  await data.deleteAllData();
  revalidateAll();
  redirect("/app?wiped=1");
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function deleteAccountAction(fd: FormData) {
  const user = await requireUser();
  if (form(fd).confirm !== "ลบบัญชี") return;
  const admin = createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, {
    auth: { persistSession: false },
  });
  // Deleting the auth user cascades to every SlipJot table.
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) throw new Error(error.message);
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/?deleted=1");
}
