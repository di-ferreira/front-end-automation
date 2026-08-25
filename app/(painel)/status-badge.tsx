import type { ExecutionStatus } from "@/lib/validation";
import { EXECUTION_STATUS_LABELS } from "@/lib/validation";
import { EXECUTION_STATUS_BADGE_CLASSES } from "@/lib/format";

export function StatusBadge({ status }: { status: ExecutionStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${EXECUTION_STATUS_BADGE_CLASSES[status]}`}
    >
      {EXECUTION_STATUS_LABELS[status]}
    </span>
  );
}
