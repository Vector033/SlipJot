import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { Anuphan, Barlow_Semi_Condensed, Chonburi } from "next/font/google";
import { ServiceWorker } from "@/components/service-worker";
import "./globals.css";

// Chonburi: heavy looped Thai, the lettering painted on songthaew route boards.
const display = Chonburi({ variable: "--font-display", subsets: ["thai", "latin"], weight: "400" });
// Anuphan: plain modern Thai for everything you read and tap.
const ui = Anuphan({ variable: "--font-ui", subsets: ["thai", "latin"], weight: ["400", "500", "600", "700"] });
// Plate digits: condensed, tabular, like a public-transport licence plate.
const digits = Barlow_Semi_Condensed({ variable: "--font-digits", subsets: ["latin"], weight: ["500", "600", "700"] });

export const metadata: Metadata = {
  title: { default: "SlipJot", template: "%s · SlipJot" },
  description: "ส่งสลิปโอนเงินเข้ามา SlipJot อ่านยอด เวลา ผู้รับ แล้วบันทึกเป็นรายจ่ายและจัดหมวดให้เอง",
  appleWebApp: { capable: true, title: "SlipJot", statusBarStyle: "default" },
  icons: { icon: "/icon-192.png", apple: "/apple-touch-icon.png" },
};

export const viewport: Viewport = {
  themeColor: "#b3121c",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Reading the request makes every page render per request, which is what lets Next.js stamp
  // the CSP nonce from src/proxy.ts onto its scripts. A prerendered page would carry none.
  await headers();
  return (
    <html lang="th" className={`${display.variable} ${ui.variable} ${digits.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        {children}
        <ServiceWorker />
      </body>
    </html>
  );
}
