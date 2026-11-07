import Link from "next/link";
import type { Metadata } from "next";
import { CircleCheckBig } from "lucide-react";
import { BANK_NAMES_TH, type BankCode } from "@slipjot/slip-reader";
import { ExpenseForm } from "@/components/expense-form";
import { formatBaht, toLocalInput } from "@/lib/core/format";
import { getCategories, getReviewQueue } from "@/lib/data";
import { deleteExpenseAction, saveExpenseAction } from "../actions";
import { ConfirmDelete } from "@/components/confirm-delete";

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
  const [queue, cats] = await Promise.all([getReviewQueue(), getCategories()]);
  const options = cats.map((c) => ({ id: c.id, name: c.name, icon: c.icon }));

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <header>
        <h1 className="text-2xl font-bold">รอตรวจ</h1>
        <p className="mt-1 text-ink-2">
          {queue.length
            ? `${queue.length} รายการที่ระบบไม่แน่ใจ ช่องสีเหลืองคือที่ควรดู ตรวจแล้วกดยืนยัน รูปสลิปจะถูกลบทันที`
            : "ไม่มีรายการค้างตรวจ"}
        </p>
      </header>

      {queue.length === 0 && (
        <div className="board flex flex-col items-center px-6 py-12 text-center">
          <CircleCheckBig className="size-10 text-ok" aria-hidden />
          <p className="sign mt-3 text-xl">เรียบร้อยหมดแล้ว</p>
          <Link href="/app/upload" className="btn mt-5">
            ส่งสลิปเพิ่ม
          </Link>
        </div>
      )}

      <ul className="space-y-5">
        {queue.map(({ expense: e, hasImage }) => (
          <li key={e.id} className="board overflow-hidden" data-testid="review-item">
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
                  className="block shrink-0 border-b border-line bg-steel sm:w-56 sm:border-r sm:border-b-0"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- private per-user image route */}
                  <img
                    src={`/api/slips/${e.id}/image`}
                    alt="เปิดรูปสลิปขนาดเต็ม"
                    className="mx-auto max-h-72 w-full object-contain object-top sm:max-h-none"
                  />
                </a>
              )}
              <div className="flex-1 space-y-3 p-5">
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
                  {e.readSource === "gemini" ? "อ่านด้วย Gemini" : e.readSource === "ocr" ? "อ่านด้วย OCR" : e.readSource === "local-llm" ? "อ่านด้วย LLM ในเครื่อง" : "เพิ่มเอง"}
                  {e.confidence !== null && ` · มั่นใจ ${Math.round(e.confidence * 100)}%`}
                  {e.payeeBank && ` · ${BANK_NAMES_TH[e.payeeBank as BankCode] ?? e.payeeBank}`}
                  {e.payeeLast4 && ` ••${e.payeeLast4}`}
                </p>
                <ExpenseForm
                  action={saveExpenseAction}
                  confirm
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
