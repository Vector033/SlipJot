"use client";

export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="board p-6" role="alert">
      <h2 className="font-bold">เปิดหน้านี้ไม่สำเร็จ</h2>
      <p className="mt-2 text-sm text-ink-2">กดลองอีกครั้ง ถ้ายังไม่ได้ให้รีโหลดหน้า ข้อมูลที่บันทึกไว้แล้วไม่หาย</p>
      {error.digest && <p className="num mt-1 text-xs text-ink-3">รหัสอ้างอิง {error.digest}</p>}
      <button type="button" onClick={reset} className="btn mt-4">
        ลองอีกครั้ง
      </button>
    </div>
  );
}
