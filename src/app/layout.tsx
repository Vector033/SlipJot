import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_Thai, Inter } from "next/font/google";
import { ServiceWorker } from "@/components/service-worker";
import "./globals.css";

const thai = IBM_Plex_Sans_Thai({
  variable: "--font-thai",
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
});
const latin = Inter({ variable: "--font-latin", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "SlipJot", template: "%s · SlipJot" },
  description: "ถ่ายสลิป แล้วให้ระบบบันทึกรายจ่ายและจัดหมวดให้",
  appleWebApp: { capable: true, title: "SlipJot", statusBarStyle: "default" },
  icons: { icon: "/icon-192.png", apple: "/apple-touch-icon.png" },
};

export const viewport: Viewport = {
  themeColor: "#f6f4ee",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="th" className={`${thai.variable} ${latin.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        {children}
        <ServiceWorker />
      </body>
    </html>
  );
}
