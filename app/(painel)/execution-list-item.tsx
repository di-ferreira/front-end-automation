import Link from "next/link";

import { formatDateTime } from "@/lib/format";
import { StatusBadge } from "./status-badge";
import type { ExecutionStatus } from "@/lib/validation";

interface ExecutionListItemProps {
  id: string;
  status: ExecutionStatus;
  title: string | null;
  promptName: string | null;
  promptText: string | null;
  error: string | null;
  createdAt: Date;
  startedAt: Date | null;
  finishedAt: Date | null;
}

export function ExecutionListItem({
  id,
  status,
  title,
  promptName,
  promptText,
  error,
  createdAt,
  startedAt,
  finishedAt,
}: ExecutionListItemProps) {
  return (
    <li className="border-border bg-card hover:bg-muted/20 rounded-xl border p-4 shadow-sm transition-colors">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <StatusBadge status={status} />
            <span className="text-foreground truncate font-medium" title={title ?? undefined}>
              {title ?? promptName ?? "Execucao"}
            </span>
          </div>
          <p className="text-muted-foreground line-clamp-2 text-sm leading-5">{promptText ?? ""}</p>
          {error ? (
            <p className="text-destructive text-xs" role="alert">
              {error}
            </p>
          ) : null}
        </div>

        <div className="text-muted-foreground shrink-0 space-y-0.5 text-right text-xs whitespace-nowrap">
          <p>Criada em {formatDateTime(createdAt)}</p>
          {startedAt ? <p>Inicio: {formatDateTime(startedAt)}</p> : null}
          {finishedAt ? <p>Fim: {formatDateTime(finishedAt)}</p> : null}
          {promptName ? <p>Prompt: {promptName}</p> : null}
          <Link href={`/executions/${id}`} className="text-primary hover:underline">
            Ver detalhes &rarr;
          </Link>
        </div>
      </div>
    </li>
  );
}
