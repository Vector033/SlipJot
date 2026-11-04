import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BANK_NAMES_TH, type BankCode } from "@slipjot/slip-reader";
import { ExpenseForm } from "@/components/expense-form";
import { toLocalInput } from "@/lib/core/format";
import { monthKeyOf } from "@/lib/core/month";
import { getCategories, getExpense } from "@/lib/data";
import { deleteExpenseAction, saveExpenseAction } from "../../actions";

export const metadata: Metadata = { title: "แก้ไขรายการ" };

const bank = (code: string | null) => (code ? (BANK_NAMES_TH[code as BankCode] ?? code) : null);

export default async function ExpensePage({ params }: PageProps<"/app/expenses/[id]">) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const [row, cats] = await Promise.all([getExpense(id), getCategories()]);
  if (!row) notFound();
  const e = row.expense;
  const back = `/app/expenses?month=${monthKeyOf(e.occurredAt)}`;

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <Link href={back} className="text-sm text-ink-2 hover:text-ink">
        ‹ กลับไปที่รายการ
      </Link>
      <h1 className="text-2xl font-bold">แก้ไขรายการ</h1>
      <div className="card p-4">
        <ExpenseForm
          action={saveExpenseAction}
          confirm={e.status === "review"}
          redirectTo={back}
          values={{
            id: e.id,
            amount: e.amount > 0 ? e.amount : null,
            occurredAt: toLocalInput(e.occurredAt),
            payeeName: e.payeeName,
            categoryId: e.categoryId,
            memo: e.memo,
          }}
          categories={cats.map((c) => ({ id: c.id, name: c.name, icon: c.icon }))}
          submitLabel={e.status === "review" ? "ยืนยัน" : "บันทึก"}
        >
          <button formAction={deleteExpenseAction} formNoValidate className="btn-danger ml-auto">
            ลบรายการ
          </button>
        </ExpenseForm>
        <p className="mt-3 text-xs text-ink-3">เปลี่ยนหมวดแล้ว ครั้งหน้าที่จ่ายให้ผู้รับนี้ ระบบจะใช้หมวดที่คุณเลือก</p>
      </div>

      <dl className="card grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 p-4 text-sm">
        <dt className="text-ink-3">ธนาคารผู้รับ</dt>
        <dd>{[bank(e.payeeBank), e.payeeLast4 && `••${e.payeeLast4}`].filter(Boolean).join(" ") || "–"}</dd>
        <dt className="text-ink-3">จากบัญชี</dt>
        <dd>{[bank(e.senderBank), e.senderLast4 && `••${e.senderLast4}`].filter(Boolean).join(" ") || "–"}</dd>
        <dt className="text-ink-3">เลขอ้างอิง</dt>
        <dd className="num break-all">{e.reference ?? "–"}</dd>
        <dt className="text-ink-3">อ่านโดย</dt>
        <dd>
          {e.readSource === "gemini" ? "Gemini" : e.readSource === "ocr" ? "OCR" : "เพิ่มเอง"}
          {e.confidence !== null && ` · มั่นใจ ${Math.round(e.confidence * 100)}%`}
        </dd>
        <dt className="text-ink-3">รูปสลิป</dt>
        <dd>
          {row.hasImage ? (
            <a href={`/api/slips/${e.id}/image`} target="_blank" className="text-accent underline">
              เปิดดู
            </a>
          ) : (
            "ลบแล้ว"
          )}
        </dd>
      </dl>
    </div>
  );
}
