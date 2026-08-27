import Link from "next/link";

import { StatusBadge } from "../../status-badge";
import { formatDateTime } from "@/lib/format";
import { EditExecutionDialog } from "./edit-execution-dialog";
import type { ExecutionStatus } from "@/lib/validation";

interface ExecutionDetailHeaderProps {
  id: string;
  status: ExecutionStatus;
  title: string | null;
  description: string | null;
  promptText: string | null;
  error: string | null;
  createdAt: Date;
  startedAt: Date | null;
  finishedAt: Date | null;
}

export function ExecutionDetailHeader({
  id,
  status,
  title,
  description,
  promptText,
  error,
  createdAt,
  startedAt,
  finishedAt,
}: ExecutionDetailHeaderProps) {
  return (
    <>
      <div className="flex items-center gap-2">
        <Link
          href="/"
          className="text-muted-foreground hover:text-foreground text-sm transition-colors"
        >
          &larr; Voltar as execucoes
        </Link>
      </div>

      <header className="border-border bg-card rounded-xl border p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={status} />
              <h1 className="text-foreground min-w-0 truncate text-xl font-semibold tracking-tight">
                {title ?? "Execucao"}
              </h1>
            </div>

            {description ? (
              <p className="text-foreground max-w-3xl text-sm leading-6 whitespace-pre-wrap">
                {description}
              </p>
            ) : null}

            <p className="text-muted-foreground line-clamp-2 max-w-3xl text-xs leading-5">
              Prompt: {promptText ?? "\u2014"}
            </p>

            {error ? (
              <p role="alert" className="text-destructive text-sm">
                {error}
              </p>
            ) : null}
          </div>

          <div className="flex shrink-0 flex-col items-start gap-1 sm:items-end">
            <EditExecutionDialog
              executionId={id}
              initialTitle={title}
              initialDescription={description}
            />
            <dl className="text-muted-foreground space-y-1 text-xs whitespace-nowrap sm:text-right">
              <dd>Criada em {formatDateTime(createdAt)}</dd>
              {startedAt ? <dd>Inicio: {formatDateTime(startedAt)}</dd> : null}
              {finishedAt ? <dd>Fim: {formatDateTime(finishedAt)}</dd> : null}
            </dl>
          </div>
        </div>
      </header>
    </>
  );
}
