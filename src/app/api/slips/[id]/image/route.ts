import { getOptionalUser } from "@/lib/auth";
import { getSlipImage } from "@/lib/data";

// Serves a slip image to its owner only. Stored images are re-encoded JPEGs (image-safety.ts);
// the headers below make sure the browser never treats the bytes as anything but an image.
export async function GET(_req: Request, ctx: RouteContext<"/api/slips/[id]/image">) {
  const { id } = await ctx.params;
  if (!(await getOptionalUser()) || !/^[0-9a-f-]{36}$/i.test(id)) return new Response(null, { status: 404 });
  const img = await getSlipImage(id);
  if (!img || !/^image\/(jpeg|png|webp)$/.test(img.mimeType)) return new Response(null, { status: 404 });
  return new Response(new Uint8Array(img.bytes), {
    headers: {
      "content-type": img.mimeType,
      "content-disposition": "inline",
      "cache-control": "private, no-store",
      "x-content-type-options": "nosniff",
      "content-security-policy": "default-src 'none'; sandbox",
      "cross-origin-resource-policy": "same-origin",
    },
  });
}
