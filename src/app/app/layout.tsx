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
      <header className="sticky top-0 z-10 border-b border-line bg-paper/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-3 sm:px-6">
          <Link href="/app" aria-label="SlipJot หน้าแรก">
            <Logo />
          </Link>
          <div className="ml-auto">
            <DesktopNav reviewCount={pending} />
          </div>
        </div>
      </header>
      {isDemoUser(user.email) && (
        <p className="bg-marker/70 px-4 py-1.5 text-center text-xs">บัญชีเดโม: ข้อมูลทั้งหมดเป็นข้อมูลสมมติ และคนอื่นก็เห็นสิ่งที่คุณเพิ่ม</p>
      )}
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pt-5 pb-28 sm:px-6 sm:pb-12">{children}</main>
      <MobileNav reviewCount={pending} />
    </div>
  );
}
