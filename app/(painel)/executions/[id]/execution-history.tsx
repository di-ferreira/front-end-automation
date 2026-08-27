import { APPROVAL_STATUS_LABELS, type ApprovalStatus } from "@/lib/validation";
import { APPROVAL_STATUS_BADGE_CLASSES } from "@/lib/format";

interface HistoryEntry {
  assetId: number;
  assetName: string;
  status: ApprovalStatus;
  who: string | null;
  when: string;
}

interface ExecutionHistoryProps {
  entries: HistoryEntry[];
}

export function ExecutionHistory({ entries }: ExecutionHistoryProps) {
  if (entries.length === 0) return null;

  return (
    <section className="border-border bg-card rounded-xl border shadow-sm">
      <h2 className="border-border text-foreground border-b px-4 py-3 text-sm font-semibold">
        Historico de decisoes ({entries.length})
      </h2>
      <ul className="divide-border divide-y">
        {entries.map((entry) => (
          <li
            key={entry.assetId}
            className="hover:bg-muted/20 flex flex-wrap items-center gap-x-2 gap-y-1 px-4 py-2.5 text-xs transition-colors"
          >
            <span
              className={`inline-flex items-center rounded-full border px-2 py-0.5 font-medium ${APPROVAL_STATUS_BADGE_CLASSES[entry.status]}`}
            >
              {APPROVAL_STATUS_LABELS[entry.status]}
            </span>
            <span className="text-foreground max-w-64 truncate font-medium" title={entry.assetName}>
              {entry.assetName}
            </span>
            <span className="text-muted-foreground ml-auto">
              por <strong>{entry.who}</strong> em {entry.when}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
