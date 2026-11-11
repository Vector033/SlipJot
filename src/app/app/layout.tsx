import Link from "next/link";
import { Logo } from "@/components/logo";
import { SongthaewContours } from "@/components/songthaew-contours";
import { ThaiPhrases } from "@/components/thai-phrases";
import { requireUser } from "@/lib/auth";
import { ensureSetup, reviewCount } from "@/lib/data";
import { isDemoUser } from "@/lib/supabase/admin";
import { DesktopNav, MobileNav } from "./nav";

export default async function AppLayout({ children }: LayoutProps<"/app">) {
  const user = await requireUser();
  await ensureSetup(user.id);
  const pending = await reviewCount();
  return (
    <div className="relative flex flex-1 flex-col overflow-x-clip">
      <header className="on-red songthaew-enamel sticky top-0 z-10 overflow-hidden text-white">
        <div className="relative z-10 mx-auto flex h-14 max-w-5xl items-center gap-4 px-4 sm:h-16 sm:px-6">
          <Link href="/app" aria-label="SlipJot ภาพรวม">
            <Logo tone="white" />
          </Link>
          <div className="ml-auto">
            <DesktopNav reviewCount={pending} />
          </div>
        </div>
        <div className="trim relative z-10" />
      </header>
      {isDemoUser(user.email) && (
        <aside aria-label="บัญชีเดโม" className="relative z-[1] border-b border-ink/15 bg-plate px-4 py-1.5 text-center text-[0.8rem] font-medium text-ink">
          <ThaiPhrases text="บัญชีเดโม:| ข้อมูลทั้งหมดเป็นข้อมูลสมมติ| และคนอื่นก็เห็นสิ่งที่คุณเพิ่ม" />
        </aside>
      )}
      <SongthaewContours variant="cabin" className="fixed inset-x-0 bottom-0 z-0 h-44 w-full opacity-80 sm:h-52" />
      <main className="relative z-[1] mx-auto w-full max-w-5xl flex-1 px-4 pt-6 pb-32 sm:px-6 sm:pb-14">{children}</main>
      <MobileNav reviewCount={pending} />
    </div>
  );
}
