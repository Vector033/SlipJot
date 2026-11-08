import type { Metadata } from "next";
import { KeyRound, LogOut, Mail, Monitor, Smartphone } from "lucide-react";
import { getAccount, listSessions } from "@/lib/account";
import { formatDate, formatDateTime } from "@/lib/core/format";
import { googleEnabled } from "@/lib/site";
import { GoogleMark } from "@/app/login/login-form";
import { deleteAccountAction, signOutAction } from "../../actions";
import { SettingsTabs } from "../tabs";
import { revokeSessionAction } from "./actions";
import { ChangePasswordForm, GoogleLinkButton, GoogleUnlinkButton, SignOutOthersButton } from "./forms";

export const metadata: Metadata = { title: "บัญชีและความปลอดภัย" };

function ago(d: Date) {
  const min = Math.round((Date.now() - d.getTime()) / 60_000);
  if (min < 2) return "ใช้งานอยู่ตอนนี้";
  if (min < 60) return `${min} นาทีที่แล้ว`;
  const h = Math.round(min / 60);
  if (h < 24) return `${h} ชั่วโมงที่แล้ว`;
  const days = Math.round(h / 24);
  return days < 30 ? `${days} วันที่แล้ว` : formatDate(d);
}

export default async function AccountPage({ searchParams }: PageProps<"/app/settings/account">) {
  const sp = (await searchParams) as { confirm?: string; linked?: string; oauth?: string };
  const account = await getAccount();
  const google = googleEnabled();
  // The demo is shared by every visitor; listing its sessions would show strangers' devices.
  const sessions = account.demo ? [] : await listSessions(account);
  const others = sessions?.filter((s) => !s.current).length ?? 0;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">ตั้งค่า</h1>
      <SettingsTabs />

      {account.demo && (
        <p role="status" className="notice bg-plate-soft">
          นี่คือบัญชีเดโมที่ทุกคนใช้ร่วมกัน จึงเปลี่ยนรหัสผ่าน เชื่อม Google ดูอุปกรณ์ หรือลบบัญชีไม่ได้
        </p>
      )}
      {sp.linked === "google" && (
        <p role="status" className="notice bg-plate-soft">
          เชื่อม Google แล้ว จากนี้เข้าสู่ระบบด้วย Google ได้
        </p>
      )}
      {sp.oauth && (
        <p role="alert" className="notice bg-red-soft text-red-deep">
          {sp.oauth === "cancelled" ? "ยกเลิกการเชื่อม Google แล้ว" : "เชื่อม Google ไม่สำเร็จ ลองอีกครั้ง"}
        </p>
      )}

      <section className="board overflow-hidden" aria-labelledby="account-h">
        <div className="board-head">
          <h2 id="account-h">บัญชี</h2>
        </div>
        <dl className="rows px-5">
          <Row label="อีเมล">
            <span className="break-all">{account.email}</span>
          </Row>
          {account.createdAt && <Row label="สมัครเมื่อ">{formatDate(account.createdAt)}</Row>}
          {account.lastSignInAt && <Row label="เข้าสู่ระบบล่าสุด">{formatDateTime(account.lastSignInAt)}</Row>}
        </dl>
      </section>

      <section className="board overflow-hidden" aria-labelledby="methods-h">
        <div className="board-head">
          <h2 id="methods-h">วิธีเข้าสู่ระบบ</h2>
        </div>
        <ul className="rows px-5">
          <li className="flex flex-wrap items-center gap-3 py-4">
            <span className="grid size-10 place-items-center rounded-xl bg-steel" aria-hidden>
              <Mail className="size-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold">อีเมลและรหัสผ่าน</span>
              <span className="text-sm text-ink-3">{account.hasPassword ? "ตั้งรหัสผ่านแล้ว" : "ยังไม่ได้ตั้งรหัสผ่าน"}</span>
            </span>
            {!account.hasPassword && (
              <a href="#password" className="btn">
                ตั้งรหัสผ่าน
              </a>
            )}
          </li>
          {google && (
            <li className="flex flex-wrap items-start gap-3 py-4">
              <span className="grid size-10 place-items-center rounded-xl bg-steel" aria-hidden>
                <GoogleMark />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">Google</span>
                <span className="text-sm break-all text-ink-3">
                  {account.google ? `เชื่อมแล้ว · ${account.google.email ?? "บัญชี Google"}` : "ยังไม่ได้เชื่อม"}
                </span>
              </span>
              {!account.demo &&
                (account.google ? (
                  <GoogleUnlinkButton
                    blockedReason={!account.hasPassword ? "ตั้งรหัสผ่านก่อน จึงจะยกเลิกการเชื่อม Google ได้" : undefined}
                  />
                ) : (
                  <GoogleLinkButton />
                ))}
            </li>
          )}
        </ul>
      </section>

      <section id="password" className="board scroll-mt-24 overflow-hidden" aria-labelledby="password-h">
        <div className="board-head">
          <h2 id="password-h">{account.hasPassword ? "เปลี่ยนรหัสผ่าน" : "ตั้งรหัสผ่าน"}</h2>
          <KeyRound className="size-4 text-on-red-2" aria-hidden />
        </div>
        <div className="p-5">
          {!account.hasPassword && (
            <p className="mb-4 text-sm text-ink-2">
              บัญชีนี้เข้าด้วย Google อย่างเดียว ตั้งรหัสผ่านไว้เผื่อเข้า Google ไม่ได้
            </p>
          )}
          <ChangePasswordForm hasPassword={account.hasPassword} email={account.email} disabled={account.demo} />
        </div>
      </section>

      <section id="devices" className="board overflow-hidden" aria-labelledby="devices-h">
        <div className="board-head">
          <h2 id="devices-h">อุปกรณ์ที่เข้าสู่ระบบ</h2>
          {sessions && sessions.length > 0 && <span className="meta num">{sessions.length} เครื่อง</span>}
        </div>
        <div className="p-5">
          {account.demo ? (
            <p className="text-sm text-ink-2">บัญชีเดโมไม่แสดงรายการอุปกรณ์ เพราะเป็นเครื่องของคนอื่น</p>
          ) : sessions === null ? (
            <p className="text-sm text-ink-2">ดูรายการอุปกรณ์ไม่ได้ในตอนนี้ แต่ยังออกจากระบบเครื่องอื่นทั้งหมดได้ด้วยปุ่มด้านล่าง</p>
          ) : (
            <ul className="rows -mt-2">
              {sessions.map((s) => (
                <li key={s.id} className="flex flex-wrap items-center gap-3 py-3">
                  <span className="grid size-10 place-items-center rounded-xl bg-steel" aria-hidden>
                    {s.kind === "mobile" ? <Smartphone className="size-5" /> : <Monitor className="size-5" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold">
                      {s.device}
                      {s.current && <span className="plate-sm ml-2 text-xs">เครื่องนี้</span>}
                    </span>
                    <span className="text-sm text-ink-3">
                      {ago(s.lastActive)}
                      {s.ip ? ` · IP ${s.ip}` : ""}
                    </span>
                  </span>
                  {!s.current && (
                    <form action={revokeSessionAction}>
                      <input type="hidden" name="sessionId" value={s.id} />
                      <button className="btn-danger" aria-label={`ออกจากระบบ ${s.device}`}>
                        ออกจากระบบ
                      </button>
                    </form>
                  )}
                </li>
              ))}
            </ul>
          )}
          <div className="mt-4 flex flex-wrap gap-2 border-t-2 border-line pt-4">
            {!account.demo && (sessions === null || others > 0) && <SignOutOthersButton />}
            <form action={signOutAction}>
              <button className="btn">
                <LogOut className="size-4" aria-hidden /> ออกจากระบบเครื่องนี้
              </button>
            </form>
          </div>
        </div>
      </section>

      {!account.demo && (
        <section id="delete" className="board overflow-hidden" aria-labelledby="delete-h">
          <div className="board-head">
            <h2 id="delete-h">ลบบัญชี</h2>
          </div>
          <form action={deleteAccountAction} className="space-y-2 p-5">
            <p className="text-sm text-ink-2">ลบบัญชีและข้อมูลทั้งหมดถาวร ทั้งรายการ หมวด กฎ และรูปสลิปที่ยังเก็บไว้ ย้อนกลับไม่ได้</p>
            <label htmlFor="confirm-account" className="label">
              พิมพ์ &quot;ลบบัญชี&quot; เพื่อยืนยัน
            </label>
            {sp.confirm === "account" && (
              <p role="alert" className="text-sm text-red-deep">
                พิมพ์คำว่า &quot;ลบบัญชี&quot; ให้ตรงก่อนกดลบบัญชี
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              <input id="confirm-account" name="confirm" autoComplete="off" className="input max-w-56" />
              <button className="btn-danger border-2 border-red/30">ลบบัญชี</button>
            </div>
          </form>
        </section>
      )}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 py-3.5 sm:grid-cols-[10rem_1fr]">
      <dt className="text-sm text-ink-3">{label}</dt>
      <dd className="font-medium">{children}</dd>
    </div>
  );
}
