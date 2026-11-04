"use client";

export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="card p-6">
      <h2 className="font-medium">เกิดข้อผิดพลาด</h2>
      <p className="mt-2 text-sm text-stone-600">
        ลองอีกครั้ง ถ้ายังไม่ได้ให้รีโหลดหน้า
      </p>
      {error.digest && <p className="mt-1 font-mono text-xs text-stone-400">ref {error.digest}</p>}
      <button onClick={reset} className="btn mt-4">
        Try again
      </button>
    </div>
  );
}
