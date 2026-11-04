import { getOptionalUser } from "@/lib/auth";
import { ensureSetup, purgeExpiredImages } from "@/lib/data";
import { ACCEPTED_TYPES, MAX_SLIP_BYTES, ingestSlip } from "@/lib/slips";

// One slip per request: the client loops over the selected files, so each read stays
// well inside serverless time limits and the UI can show progress per file.
export const maxDuration = 60;

export async function POST(req: Request) {
  const user = await getOptionalUser();
  if (!user) return Response.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });

  const fd = await req.formData().catch(() => null);
  const file = fd?.get("file");
  if (!(file instanceof File)) return Response.json({ error: "ไม่พบไฟล์" }, { status: 400 });
  if (file.size > MAX_SLIP_BYTES) return Response.json({ error: "ไฟล์ใหญ่เกิน 10 MB" }, { status: 413 });
  const type = file.type || "image/jpeg";
  if (!ACCEPTED_TYPES.includes(type)) return Response.json({ error: "รองรับเฉพาะรูปภาพ (JPG, PNG, WebP)" }, { status: 415 });

  await ensureSetup(user.id);
  try {
    const result = await ingestSlip(user.id, new Uint8Array(await file.arrayBuffer()), type);
    return Response.json(result);
  } catch (err) {
    console.error("slip ingest failed", err);
    return Response.json({ error: "อ่านสลิปไม่สำเร็จ ลองใหม่อีกครั้ง" }, { status: 500 });
  } finally {
    purgeExpiredImages().catch(() => {});
  }
}
