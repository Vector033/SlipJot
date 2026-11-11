import Link from "next/link";
import type { Metadata } from "next";
import { Download } from "lucide-react";
import { ConfirmDelete } from "@/components/confirm-delete";
import { ThaiPhrases } from "@/components/thai-phrases";
import { getOptionalUser } from "@/lib/auth";
import { DEFAULT_CATEGORIES } from "@/lib/core/categories";
import { getCategories, getInsights, getSettings } from "@/lib/data";
import { llmLabel } from "@/lib/llm/categorize-llm";
import { isDemoUser } from "@/lib/supabase/admin";
import {
  deleteAllDataAction,
  deleteCategoryAction,
  setKeepImagesAction,
} from "../actions";
import { CategoryRow } from "./category-row";
import { SoundToggle } from "./sound-toggle";
import { SettingsTabs } from "./tabs";

export const metadata: Metadata = { title: "ตั้งค่า" };

const pct = (n: number, d: number) => (d ? `${Math.round((100 * n) / d)}%` : "–");

export default async function SettingsPage({ searchParams }: PageProps<"/app/settings">) {
  const sp = (await searchParams) as { confirm?: string };
  const [user, cats, settings, insights] = await Promise.all([
    getOptionalUser(),
    getCategories(),
    getSettings(),
    getInsights(),
  ]);
  const s = insights.bySource;
  const categorised = (s.rule ?? 0) + (s.keyword ?? 0) + (s.llm ?? 0) + (s.none ?? 0);
  const withoutLlm = (s.rule ?? 0) + (s.keyword ?? 0);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <h1 className="text-2xl font-bold">ตั้งค่า</h1>
      <SettingsTabs />
      {isDemoUser(user?.email) && (
        <p role="status" className="notice bg-plate-soft">
          <ThaiPhrases text="นี่คือบัญชีเดโมที่ทุกคนใช้ร่วมกัน:| ลองแก้หมวด ตั้งงบ หรือส่งสลิปได้| แต่ลบข้อมูล ลบบัญชี| และเปลี่ยนการเก็บรูปไม่ได้" />
        </p>
      )}

      <section id="categories" className="board paper-texture relative overflow-hidden">
        <span aria-hidden className="halftone-corners pointer-events-none absolute inset-0 z-0 text-ink opacity-[0.08]" />
        <div className="board-head relative z-10">
          <h2>หมวดและงบรายเดือน</h2>
        </div>
        <div className="relative z-10 p-5">
          <p className="text-sm text-ink-2">
            <ThaiPhrases text="ตั้งงบแล้วจะเตือนที่หน้าภาพรวม|เมื่อใช้ถึง 80%| หรือเมื่อคาดว่าจะเกิน|ภายในสิ้นเดือน" />
          </p>
          <div className="rows">
            {cats.map((c) => (
              <CategoryRow key={c.id} c={c}>
                <ConfirmDelete
                  action={deleteCategoryAction}
                  label={`ลบหมวด ${c.name}`}
                  confirmLabel={`ลบหมวด ${c.name}`}
                  note="รายการในหมวดนี้ไม่ถูกลบ จะกลายเป็นยังไม่จัดหมวด"
                  iconOnly
                />
              </CategoryRow>
            ))}
            <CategoryRow c={{ name: "", icon: "other", color: nextRouteColour(cats.map((c) => c.color)), monthlyBudget: null }} />
          </div>
        </div>
      </section>

      <section className="board paper-texture relative overflow-hidden">
        <span aria-hidden className="halftone-corners pointer-events-none absolute inset-0 z-0 text-ink opacity-[0.08]" />
        <div className="board-head relative z-10">
          <h2>รูปสลิปและเสียงแจ้งเตือน</h2>
        </div>
        <div className="relative z-10 space-y-5 p-5">
          <form action={setKeepImagesAction} className="space-y-3">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                name="keep"
                defaultChecked={settings.keepImages}
                className="mt-1 size-5 accent-red"
              />
              <span>
                <span className="font-medium">เก็บรูปสลิปไว้</span>
                <span className="block text-sm text-ink-2">
                  <ThaiPhrases text="ปิดอยู่เป็นค่าเริ่มต้น:| รูปถูกลบทันทีเมื่อคุณยืนยันรายการ| และรูปที่ค้างตรวจ|จะถูกลบเองภายใน 7 วัน" />
                </span>
              </span>
            </label>
            <button className="btn">บันทึก</button>
          </form>
          <div className="border-t-2 border-line pt-4">
            <SoundToggle />
          </div>
        </div>
      </section>

      <section className="board paper-texture relative overflow-hidden">
        <span aria-hidden className="halftone-corners pointer-events-none absolute inset-0 z-0 text-ink opacity-[0.08]" />
        <div className="board-head relative z-10">
          <h2>ระบบอ่านและจัดหมวด</h2>
        </div>
        <div className="relative z-10 p-5">
          <dl className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            <Stat label="สลิปที่อ่านแล้ว" value={String(insights.slips)} />
            <Stat label="จัดหมวดโดยไม่ใช้ AI" value={pct(withoutLlm, categorised)} />
            <Stat label="เรียก AI" value={`${insights.aiCalls} ครั้ง`} />
            <Stat
              label="ค่า AI ต่อสลิป"
              value={insights.slips ? `$${(insights.aiCostUsd / insights.slips).toFixed(4)}` : "–"}
            />
          </dl>
          <p className="mt-3 text-xs text-ink-3">
            {llmLabel() === "local" ? (
              <ThaiPhrases text="โหมดพัฒนา:| อ่านสลิปและจัดหมวดด้วย LLM ฟรีในเครื่อง (FreeLLMAPI)| ใช้กับสลิปจำลองเท่านั้น" />
            ) : llmLabel() === "gemini" ? (
              <ThaiPhrases text="อ่านสลิปด้วย Gemini| และใช้ AI จัดหมวดเฉพาะเมื่อ|กฎจากประวัติและชื่อร้านไม่รู้จักผู้รับ" />
            ) : (
              <ThaiPhrases text="ยังไม่ได้ตั้งค่า Gemini:| อ่านสลิปด้วย OCR ในเซิร์ฟเวอร์| และจัดหมวดด้วยกฎอย่างเดียว" />
            )}
          </p>
        </div>
      </section>

      <section id="danger" className="board paper-texture relative overflow-hidden">
        <span aria-hidden className="halftone-corners pointer-events-none absolute inset-0 z-0 text-ink opacity-[0.08]" />
        <div className="board-head relative z-10">
          <h2>ข้อมูลของคุณ</h2>
        </div>
        <div className="relative z-10 p-5">
          <div className="mt-3 flex flex-wrap gap-2">
            <a href="/api/export" className="btn">
              <Download className="size-4" aria-hidden /> ดาวน์โหลด CSV
            </a>
          </div>

          <form action={deleteAllDataAction} className="danger-stripe mt-6 space-y-2 rounded-2xl border border-red/20 p-4 sm:p-5">
            <p className="text-sm font-medium">
              <ThaiPhrases text="ลบรายการ หมวด และกฎที่ระบบเรียนรู้ทั้งหมด| (บัญชียังอยู่)" />
            </p>
            <label htmlFor="confirm-wipe" className="label">
              พิมพ์ &quot;ลบ&quot; เพื่อยืนยัน
            </label>
            {sp.confirm === "wipe" && (
              <p role="alert" className="text-sm text-red-deep">
                <ThaiPhrases text='พิมพ์คำว่า "ลบ" ให้ตรง|ก่อนกดลบข้อมูลทั้งหมด' />
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              <input id="confirm-wipe" name="confirm" autoComplete="off" className="input max-w-56" />
              <button className="btn-danger border-2 border-red/30">ลบข้อมูลทั้งหมด</button>
            </div>
          </form>

          <p className="mt-4 text-sm text-ink-3">
            <span className="inline-block">ลบบัญชี เปลี่ยนรหัสผ่าน หรือเชื่อม Google ได้ที่</span>{" "}
            <Link href="/app/settings/account" className="inline-block font-semibold text-ink underline">
              บัญชีและความปลอดภัย
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="steel-speckled relative overflow-hidden rounded-xl border border-line/80 p-3 shadow-[inset_0_1px_0_rgb(255_255_255/0.8)]">
      <span aria-hidden className="led-matrix pointer-events-none absolute inset-0 z-0 opacity-[0.09]" />
      <dt className="relative z-10 text-ink-3">{label}</dt>
      <dd className="font-plate num relative z-10 mt-1 text-xl font-bold">{value}</dd>
    </div>
  );
}

/** A new category starts on the first songthaew route colour no category uses yet. */
function nextRouteColour(used: string[]) {
  const taken = new Set(used.map((c) => c.toLowerCase()));
  const route = DEFAULT_CATEGORIES.map((c) => c.color);
  return route.find((c) => !taken.has(c.toLowerCase())) ?? route[used.length % route.length];
}
