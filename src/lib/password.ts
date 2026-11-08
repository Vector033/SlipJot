// Password rules shared by sign-up, the account page and the server. The server also
// checks Have I Been Pwned (lib/breached-password.ts), which the browser cannot.

export function passwordRules(value: string, email?: string | null) {
  const local = email?.split("@")[0]?.toLowerCase();
  return [
    { label: "อย่างน้อย 10 ตัวอักษร", ok: value.length >= 10 },
    { label: "มีทั้งตัวอักษรและตัวเลข", ok: /\p{L}/u.test(value) && /\d/.test(value) },
    {
      label: "ไม่มีชื่ออีเมลของคุณ",
      ok: value.length > 0 && !(local && local.length >= 3 && value.toLowerCase().includes(local)),
    },
  ];
}

/** The first rule a new password breaks, as a Thai sentence, or null when it passes. */
export function passwordProblem(value: string, email?: string | null): string | null {
  const [len, mix, mail] = passwordRules(value, email);
  if (!len.ok) return "รหัสผ่านต้องมีอย่างน้อย 10 ตัวอักษร";
  if (!mix.ok) return "ใช้ทั้งตัวอักษรและตัวเลขในรหัสผ่าน";
  if (!mail.ok) return "อย่าใส่ชื่ออีเมลของคุณในรหัสผ่าน";
  return null;
}
