import Link from "next/link";
import type { Metadata } from "next";
import { ZoomIn } from "lucide-react";
import { BANK_NAMES_TH, type BankCode } from "@slipjot/slip-reader";
import { ConfirmDelete } from "@/components/confirm-delete";
import { ExpenseForm } from "@/components/expense-form";
import { SongthaewIllo } from "@/components/songthaew-art";
import { ThaiPhrases } from "@/components/thai-phrases";
import { formatBaht, toLocalInput } from "@/lib/core/format";
import { getCategories, getReviewQueue, getSettings } from "@/lib/data";
import { deleteExpenseAction, saveExpenseAction } from "../actions";

export const metadata: Metadata = { title: "รอตรวจ" };

function lowFieldsFrom(issues: string[]) {
  const text = issues.join(" ");
  const out: ("amount" | "occurredAt" | "payeeName")[] = [];
  if (/ยอด/.test(text)) out.push("amount");
  if (/วัน|เวลา/.test(text)) out.push("occurredAt");
  if (/ผู้รับ/.test(text)) out.push("payeeName");
  return out;
}

export default async function ReviewPage() {
  const [queue, cats, settings] = await Promise.all([getReviewQueue(), getCategories(), getSettings()]);
  const options = cats.map((c) => ({ id: c.id, name: c.name, icon: c.icon, color: c.color, slug: c.slug }));

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header>
        <h1 className="text-2xl font-bold">รอตรวจ</h1>
        <p className="mt-1 text-ink-2">
          {queue.length ? (
            <ThaiPhrases
              text={`${queue.length} รายการที่ระบบไม่แน่ใจ| ช่องสีเหลืองคือที่ควรดู| ตรวจแล้วกดยืนยัน| ${settings.keepImages ? "รูปสลิปจะเก็บไว้ตามที่คุณตั้งค่า" : "รูปสลิปจะถูกลบทันที"}`}
            />
          ) : (
            "ไม่มีรายการค้างตรวจ"
          )}
        </p>
      </header>

      {queue.length === 0 && (
        <div className="board paper-texture overflow-hidden">
          <div className="board-head">
            <span>คิวรอตรวจ</span>
            <span className="meta whitespace-nowrap">ครบถ้วน</span>
          </div>
          <div className="flex flex-col items-center px-6 py-10 text-center sm:py-12">
            <SongthaewIllo variant="cleared" className="mb-2 h-24 w-52" />
            <p className="sign text-xl">เรียบร้อยหมดแล้ว</p>
            <Link href="/app/upload" className="btn mt-5">
              ส่งสลิปเพิ่ม
            </Link>
          </div>
        </div>
      )}

      <ul className="space-y-8">
        {queue.map(({ expense: e, hasImage }) => (
          <li key={e.id} className="board paper-texture overflow-x-clip" data-testid="review-item">
            <div className="board-head">
              <h2 className="min-w-0 line-clamp-2 [overflow-wrap:anywhere]" title={e.payeeName || undefined}>
                {e.payeeName || "ไม่ทราบผู้รับ"}
              </h2>
              <span className="font-plate num shrink-0 text-lg font-semibold whitespace-nowrap text-plate">
                {e.amount > 0 ? formatBaht(e.amount, true) : "฿ –"}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row">
              {hasImage && (
                <a
                  href={`/api/slips/${e.id}/image`}
                  target="_blank"
                  rel="noopener"
                  className="steel-speckled group relative block shrink-0 overflow-hidden border-b border-line sm:w-56 sm:rounded-bl-[15px] sm:border-r sm:border-b-0"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- private per-user image route */}
                  <img
                    src={`/api/slips/${e.id}/image`}
                    alt="เปิดรูปสลิปขนาดเต็ม"
                    className="mx-auto max-h-72 w-full object-contain object-top sm:max-h-none"
                  />
                  {/* High-contrast pill over light/white bank slips */}
                  <span className="pointer-events-none absolute right-2.5 bottom-2.5 inline-flex items-center gap-1.5 rounded-full bg-ink/90 px-3 py-1 text-xs font-semibold text-white shadow-sm ring-1 ring-white/25 backdrop-blur-xs transition-transform group-hover:scale-105">
                    <ZoomIn className="size-3.5" aria-hidden /> ขยายดูรูป
                  </span>
                </a>
              )}
              <div className="flex-1 space-y-4 p-4 sm:p-5">
                {e.issues.length > 0 && (
                  <ul className="flex flex-wrap gap-1.5" aria-label="สิ่งที่ระบบไม่แน่ใจ">
                    {e.issues.map((issue) => (
                      <li key={issue} className="plate-sm text-[0.8rem] font-medium">
                        {issue}
                      </li>
                    ))}
                  </ul>
                )}
                <p className="text-sm text-ink-3">
                  <span className="inline-block">
                    {e.readSource === "gemini"
                      ? "อ่านด้วย Gemini"
                      : e.readSource === "ocr"
                        ? "อ่านด้วย OCR"
                        : e.readSource === "local-llm"
                          ? "อ่านด้วย LLM ในเครื่อง"
                          : "เพิ่มเอง"}
                  </span>
                  {e.confidence !== null && (
                    <span className="inline-block"> · มั่นใจ {Math.round(e.confidence * 100)}%</span>
                  )}
                  {e.payeeBank && (
                    <span className="inline-block"> · {BANK_NAMES_TH[e.payeeBank as BankCode] ?? e.payeeBank}</span>
                  )}
                  {e.payeeLast4 && <span className="inline-block"> ••{e.payeeLast4}</span>}
                </p>
                <ExpenseForm
                  action={saveExpenseAction}
                  confirm
                  stickyAction
                  values={{
                    id: e.id,
                    amount: e.amount > 0 ? e.amount : null,
                    occurredAt: toLocalInput(e.occurredAt),
                    payeeName: e.payeeName,
                    categoryId: e.categoryId,
                    memo: e.memo,
                  }}
                  categories={options}
                  submitLabel="ยืนยันและบันทึก"
                  lowFields={lowFieldsFrom(e.issues)}
                >
                  <ConfirmDelete
                    action={deleteExpenseAction}
                    label="ลบ"
                    confirmLabel="ลบรายการนี้ถาวร"
                    note="ลบรายการและรูปสลิปนี้ ย้อนกลับไม่ได้"
                    className="ml-auto"
                  />
                </ExpenseForm>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
