import Link from "next/link";
import type { Metadata } from "next";
import { ExpenseForm } from "@/components/expense-form";
import { formatBaht } from "@/lib/core/format";
import { toLocalInput } from "@/lib/core/format";
import { getCategories, getReviewQueue } from "@/lib/data";
import { BANK_NAMES_TH, type BankCode } from "@slipjot/slip-reader";
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
  const [queue, cats] = await Promise.all([getReviewQueue(), getCategories()]);
  const options = cats.map((c) => ({ id: c.id, name: c.name, icon: c.icon }));

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <header>
        <h1 className="text-2xl font-bold">รอตรวจ</h1>
        <p className="mt-1 text-ink-2">
          {queue.length
            ? `${queue.length} รายการที่ระบบไม่แน่ใจ ตรวจแล้วกดยืนยัน รูปสลิปจะถูกลบทันที`
            : "ไม่มีรายการค้างตรวจ"}
        </p>
      </header>

      {queue.length === 0 && (
        <div className="card p-8 text-center">
          <p className="text-4xl" aria-hidden>
            ✓
          </p>
          <p className="mt-2 font-medium">เรียบร้อยหมดแล้ว</p>
          <Link href="/app/upload" className="btn mt-4">
            ส่งสลิปเพิ่ม
          </Link>
        </div>
      )}

      <ul className="space-y-4">
        {queue.map(({ expense: e, hasImage }) => (
          <li key={e.id} className="card overflow-hidden" data-testid="review-item">
            <div className="flex flex-col sm:flex-row">
              {hasImage && (
                <a
                  href={`/api/slips/${e.id}/image`}
                  target="_blank"
                  className="block shrink-0 border-b border-line bg-paper sm:w-52 sm:border-r sm:border-b-0"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- private per-user image route */}
                  <img
                    src={`/api/slips/${e.id}/image`}
                    alt="รูปสลิป"
                    className="mx-auto max-h-72 w-full object-contain object-top sm:max-h-none"
                  />
                </a>
              )}
              <div className="flex-1 space-y-3 p-4">
                {e.issues.length > 0 && (
                  <ul className="flex flex-wrap gap-1.5">
                    {e.issues.map((issue) => (
                      <li key={issue} className="rounded-md bg-marker/60 px-2 py-0.5 text-xs font-medium text-ink">
                        {issue}
                      </li>
                    ))}
                  </ul>
                )}
                <p className="text-xs text-ink-3">
                  {e.readSource === "gemini" ? "อ่านด้วย Gemini" : e.readSource === "ocr" ? "อ่านด้วย OCR" : "เพิ่มเอง"}
                  {e.confidence !== null && ` · มั่นใจ ${Math.round(e.confidence * 100)}%`}
                  {e.payeeBank && ` · ${BANK_NAMES_TH[e.payeeBank as BankCode] ?? e.payeeBank}`}
                  {e.payeeLast4 && ` ••${e.payeeLast4}`}
                  {e.amount > 0 && ` · ${formatBaht(e.amount, true)}`}
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
                  submitLabel="ยืนยัน"
                  lowFields={lowFieldsFrom(e.issues)}
                >
                  <button formAction={deleteExpenseAction} formNoValidate className="btn-danger ml-auto">
                    ลบ
                  </button>
                </ExpenseForm>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
