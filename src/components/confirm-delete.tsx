import { Trash2 } from "lucide-react";

/**
 * A delete that needs two taps: the first opens the confirm row, the second deletes.
 * Built on <details>, so it works without JS and keeps the surrounding <form>'s fields.
 */
export function ConfirmDelete({
  action,
  label,
  confirmLabel,
  note,
  iconOnly = false,
  className = "",
}: {
  action: (fd: FormData) => void | Promise<void>;
  label: string;
  confirmLabel: string;
  note?: string;
  iconOnly?: boolean;
  className?: string;
}) {
  return (
    <details className={`group ${className}`}>
      <summary
        className={`btn-danger cursor-pointer list-none [&::-webkit-details-marker]:hidden ${iconOnly ? "px-2.5" : ""}`}
        aria-label={iconOnly ? label : undefined}
      >
        <Trash2 className="size-4" aria-hidden />
        {!iconOnly && label}
      </summary>
      <div className="mt-2 flex flex-wrap items-center gap-2 rounded-xl bg-red-soft p-2.5 text-sm text-red-deep">
        {note && <p className="min-w-0 flex-1 basis-48">{note}</p>}
        <button formAction={action} formNoValidate className="btn-primary min-h-10 px-4 text-sm">
          {confirmLabel}
        </button>
      </div>
    </details>
  );
}
