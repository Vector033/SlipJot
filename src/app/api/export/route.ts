import { getOptionalUser } from "@/lib/auth";
import { expensesToCsv } from "@/lib/core/csv";
import { exportRows } from "@/lib/data";

export async function GET() {
  if (!(await getOptionalUser())) return new Response(null, { status: 401 });
  const csv = expensesToCsv(await exportRows());
  const today = new Date(Date.now() + 7 * 3600_000).toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="slipjot-${today}.csv"`,
      "cache-control": "private, no-store",
    },
  });
}
