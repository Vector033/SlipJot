import Link from "next/link";
import type { Metadata } from "next";
import { ExpenseForm } from "@/components/expense-form";
import { toLocalInput } from "@/lib/core/format";
import { getCategories } from "@/lib/data";
import { createExpenseAction } from "../../actions";

export const metadata: Metadata = { title: "เพิ่มรายการเอง" };

export default async function NewExpensePage() {
  const cats = await getCategories();
  return (
    <div className="mx-auto max-w-xl space-y-5">
      <Link href="/app/expenses" className="text-sm text-ink-2 hover:text-ink">
        ‹ กลับไปที่รายการ
      </Link>
      <h1 className="text-2xl font-bold">เพิ่มรายการเอง</h1>
      <p className="text-ink-2">สำหรับเงินสดหรือรายการที่ไม่มีสลิป</p>
      <div className="card p-4">
        <ExpenseForm
          action={createExpenseAction}
          values={{ amount: null, occurredAt: toLocalInput(new Date()), payeeName: "", categoryId: null, memo: null }}
          categories={cats.map((c) => ({ id: c.id, name: c.name, icon: c.icon }))}
          submitLabel="เพิ่มรายการ"
        />
      </div>
    </div>
  );
}
