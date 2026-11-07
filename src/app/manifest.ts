import type { MetadataRoute } from "next";

// share_target lets the installed app appear in the Android share sheet, so a slip can
// go straight from the banking app to SlipJot. public/sw.js receives the POST.
type ManifestWithShare = MetadataRoute.Manifest & {
  share_target: {
    action: string;
    method: "POST";
    enctype: "multipart/form-data";
    params: { files: { name: string; accept: string[] }[] };
  };
};

export default function manifest(): ManifestWithShare {
  return {
    name: "SlipJot: ถ่ายสลิป บันทึกรายจ่าย",
    short_name: "SlipJot",
    description: "ส่งสลิปโอนเงินเข้ามา แล้วระบบบันทึกรายจ่ายและจัดหมวดให้",
    lang: "th",
    start_url: "/app",
    scope: "/",
    display: "standalone",
    background_color: "#b3121c",
    theme_color: "#b3121c",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    share_target: {
      action: "/share-target",
      method: "POST",
      enctype: "multipart/form-data",
      params: { files: [{ name: "slips", accept: ["image/*"] }] },
    },
  };
}
