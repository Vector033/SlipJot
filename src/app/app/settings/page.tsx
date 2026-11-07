import type { Metadata } from "next";
import { getOptionalUser } from "@/lib/auth";
import { getCategories, getInsights, getSettings } from "@/lib/data";
import { llmEnabled } from "@/lib/llm/categorize-llm";
import { isDemoUser } from "@/lib/supabase/admin";
import {
  deleteAccountAction,
  deleteAllDataAction,
  deleteCategoryAction,
  setKeepImagesAction,
  signOutAction,
} from "../actions";
import { Download, LogOut, Trash2 } from "lucide-react";
import { CategoryRow } from "./category-row";

export const metadata: Metadata = { title: "ตั้งค่า" };

const pct = (n: number, d: number) => (d ? `${Math.round((100 * n) / d)}%` : "–");

export default async function SettingsPage() {
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
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">ตั้งค่า</h1>
      {isDemoUser(user?.email) && (
        <p role="status" className="notice bg-plate-soft">
          นี่คือบัญชีเดโมที่ทุกคนใช้ร่วมกัน: ลองแก้หมวด ตั้งงบ หรือส่งสลิปได้ แต่ลบข้อมูล ลบบัญชี
          และเปลี่ยนการเก็บรูปไม่ได้
        </p>
      )}

      <section id="categories" className="board overflow-hidden">
        <div className="board-head">
          <h2>หมวดและงบรายเดือน</h2>
        </div>
        <div className="p-5">
          <p className="text-sm text-ink-2">
            ตั้งงบแล้วจะเตือนที่หน้าภาพรวมเมื่อใช้ถึง 80% หรือเมื่อคาดว่าจะเกินภายในสิ้นเดือน
          </p>
          <div className="rows">
            {cats.map((c) => (
              <CategoryRow key={c.id} c={c}>
                <button
                  formAction={deleteCategoryAction}
                  formNoValidate
                  className="btn-danger px-2.5"
                  aria-label={`ลบหมวด ${c.name}`}
                >
                  <Trash2 className="size-4" aria-hidden />
                </button>
              </CategoryRow>
            ))}
            <CategoryRow c={{ name: "", icon: "other", color: "#7a5230", monthlyBudget: null }} />
          </div>
        </div>
      </section>

      <section className="board overflow-hidden">
        <div className="board-head">
          <h2>รูปสลิป</h2>
        </div>
        <div className="p-5">
          <form action={setKeepImagesAction} className="mt-3 space-y-3">
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
                  ปิดอยู่เป็นค่าเริ่มต้น: รูปถูกลบทันทีเมื่อคุณยืนยันรายการ และรูปที่ค้างตรวจจะถูกลบเองภายใน 7 วัน
                </span>
              </span>
            </label>
            <button className="btn">บันทึก</button>
          </form>
        </div>
      </section>

      <section className="board overflow-hidden">
        <div className="board-head">
          <h2>ระบบอ่านและจัดหมวด</h2>
        </div>
        <div className="p-5">
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
            {llmEnabled()
              ? "อ่านสลิปด้วย Gemini และใช้ AI จัดหมวดเฉพาะเมื่อกฎจากประวัติและชื่อร้านไม่รู้จักผู้รับ"
              : "ยังไม่ได้ตั้งค่า Gemini: อ่านสลิปด้วย OCR ในเซิร์ฟเวอร์ และจัดหมวดด้วยกฎอย่างเดียว"}
          </p>
        </div>
      </section>

      <section className="board overflow-hidden">
        <div className="board-head">
          <h2>ข้อมูลของคุณ</h2>
        </div>
        <div className="p-5">
          <div className="mt-3 flex flex-wrap gap-2">
            <a href="/api/export" className="btn">
              <Download className="size-4" aria-hidden /> ดาวน์โหลด CSV
            </a>
            <form action={signOutAction}>
              <button className="btn">
                <LogOut className="size-4" aria-hidden /> ออกจากระบบ{" "}
                <span className="max-w-[16ch] truncate text-ink-3">{user?.email}</span>
              </button>
            </form>
          </div>

          <form action={deleteAllDataAction} className="mt-6 space-y-2 border-t-2 border-line pt-5">
            <p className="text-sm font-medium">ลบรายการ หมวด และกฎที่ระบบเรียนรู้ทั้งหมด (บัญชียังอยู่)</p>
            <div className="flex flex-wrap gap-2">
              <input
                name="confirm"
                placeholder='พิมพ์ "ลบ" เพื่อยืนยัน'
                className="input max-w-56"
                aria-label="ยืนยันการลบข้อมูล"
              />
              <button className="btn-danger border-2 border-red/30">ลบข้อมูลทั้งหมด</button>
            </div>
          </form>

          <form action={deleteAccountAction} className="mt-4 space-y-2">
            <p className="text-sm font-medium">ลบบัญชีและข้อมูลทั้งหมดถาวร</p>
            <div className="flex flex-wrap gap-2">
              <input
                name="confirm"
                placeholder='พิมพ์ "ลบบัญชี" เพื่อยืนยัน'
                className="input max-w-56"
                aria-label="ยืนยันการลบบัญชี"
              />
              <button className="btn-danger border-2 border-red/30">ลบบัญชี</button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-steel p-3">
      <dt className="text-ink-3">{label}</dt>
      <dd className="num mt-1 text-xl font-bold">{value}</dd>
    </div>
  );
}
