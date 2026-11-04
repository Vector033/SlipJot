import { getOptionalUser } from "@/lib/auth";
import { ensureSetup } from "@/lib/data";
import { ACCEPTED_TYPES, MAX_SLIP_BYTES, ingestSlip } from "@/lib/slips";

// Share target from the PWA manifest. Normally public/sw.js intercepts this POST and
// hands the files to the upload page. This handler only runs when the service worker
// is not active yet, and processes the shared images directly.
export const maxDuration = 60;

export async function POST(req: Request) {
  const user = await getOptionalUser();
  if (!user) return Response.redirect(new URL("/login", req.url), 303);
  await ensureSetup(user.id);

  const fd = await req.formData().catch(() => null);
  const files = (fd?.getAll("slips") ?? []).filter((f): f is File => f instanceof File).slice(0, 20);
  let saved = 0;
  let review = 0;
  for (const file of files) {
    const type = file.type || "image/jpeg";
    if (file.size > MAX_SLIP_BYTES || !ACCEPTED_TYPES.includes(type)) continue;
    try {
      const r = await ingestSlip(user.id, new Uint8Array(await file.arrayBuffer()), type);
      if (r.status === "saved") saved++;
      if (r.status === "review") review++;
    } catch (err) {
      console.error("shared slip failed", err);
    }
  }
  const to = review > 0 ? "/app/review" : `/app/expenses?added=${saved}`;
  return Response.redirect(new URL(to, req.url), 303);
}
