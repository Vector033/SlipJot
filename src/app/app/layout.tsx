import Link from "next/link";
import { Logo } from "@/components/logo";
import { requireUser } from "@/lib/auth";
import { ensureSetup, reviewCount } from "@/lib/data";
import { isDemoUser } from "@/lib/supabase/admin";
import { DesktopNav, MobileNav } from "./nav";

export default async function AppLayout({ children }: LayoutProps<"/app">) {
  const user = await requireUser();
  await ensureSetup(user.id);
  const pending = await reviewCount();
  return (
    <div className="flex flex-1 flex-col">
      <header className="on-red sticky top-0 z-10 bg-red text-white">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-4 px-4 sm:h-16 sm:px-6">
          <Link href="/app" aria-label="SlipJot ภาพรวม">
            <Logo tone="white" />
          </Link>
          <div className="ml-auto">
            <DesktopNav reviewCount={pending} />
          </div>
        </div>
        <div className="trim" />
      </header>
      {isDemoUser(user.email) && (
        <aside aria-label="บัญชีเดโม" className="bg-plate px-4 py-1.5 text-center text-[0.8rem] font-medium text-ink">
          บัญชีเดโม: ข้อมูลทั้งหมดเป็นข้อมูลสมมติ และคนอื่นก็เห็นสิ่งที่คุณเพิ่ม
        </aside>
      )}
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pt-6 pb-32 sm:px-6 sm:pb-14">{children}</main>
      <MobileNav reviewCount={pending} />
    </div>
  );
}
