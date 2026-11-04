import { getOptionalUser } from "@/lib/auth";
import { getSlipImage } from "@/lib/data";

export async function GET(_req: Request, ctx: RouteContext<"/api/slips/[id]/image">) {
  const { id } = await ctx.params;
  if (!(await getOptionalUser()) || !/^[0-9a-f-]{36}$/i.test(id)) return new Response(null, { status: 404 });
  const img = await getSlipImage(id);
  if (!img) return new Response(null, { status: 404 });
  return new Response(new Uint8Array(img.bytes), {
    headers: { "content-type": img.mimeType, "cache-control": "private, no-store" },
  });
}
