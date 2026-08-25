import { auth } from "@/auth";
import {
  formatDateTime,
  EXECUTION_STATUS_BADGE_CLASSES,
} from "@/lib/format";
import { EXECUTION_STATUS_LABELS } from "@/lib/validation";
import type { ExecutionStatus } from "@/lib/validation";

import { NewExecutionDialog } from "./new-execution-dialog";
import { AutoRefresh } from "./auto-refresh";
import { listExecutions } from "@/db/queries/executions";

export default async function Home() {
  const session = await auth();
  const rows = await listExecutions();
  const hasActive = rows.some(
    (row) => row.status === "queued" || row.status === "running",
  );

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-semibold tracking-tight">
            Execuções
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Acompanhe as gerações disparadas para a automação de vídeos.
          </p>
        </div>
        <NewExecutionDialog />
      </div>

      <AutoRefresh active={hasActive} />

      {rows.length === 0 ? (
        <div className="border-border bg-card text-muted-foreground flex flex-col items-center justify-center gap-2 rounded-xl border px-6 py-16 text-center text-sm shadow-sm">
          <span className="text-foreground font-medium">
            Nenhuma execução ainda
          </span>
          <span>
            Dispare sua primeira geração com o botão{" "}
            <span className="text-foreground font-medium">Nova geração</span>.
          </span>
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map((row) => (
            <li
              key={row.id}
              className="border-border bg-card rounded-xl border p-4 shadow-sm transition-colors hover:bg-muted/20"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={row.status} />
                    <span
                      className="text-foreground truncate font-medium"
                      title={row.title ?? undefined}
                    >
                      {row.title ?? row.promptName ?? "Execução"}
                    </span>
                  </div>
                  <p className="text-muted-foreground line-clamp-2 text-sm leading-5">
                    {row.promptText}
                  </p>
                  {row.error ? (
                    <p className="text-destructive text-xs" role="alert">
                      {row.error}
                    </p>
                  ) : null}
                </div>

                <div className="text-muted-foreground shrink-0 space-y-0.5 text-right text-xs whitespace-nowrap">
                  <p>Criada em {formatDateTime(row.createdAt)}</p>
                  {row.startedAt ? (
                    <p>Início: {formatDateTime(row.startedAt)}</p>
                  ) : null}
                  {row.finishedAt ? (
                    <p>Fim: {formatDateTime(row.finishedAt)}</p>
                  ) : null}
                  {row.promptName ? (
                    <p>Prompt: {row.promptName}</p>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className="text-muted-foreground text-xs">
        Bem-vindo{session?.user?.name ? `, ${session.user.name}` : ""} —{" "}
        {rows.length} execuç{rows.length === 1 ? "ão" : "ões"} registrada
        {rows.length === 1 ? "" : "s"}.
      </p>
    </section>
  );
}

function StatusBadge({ status }: { status: ExecutionStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${EXECUTION_STATUS_BADGE_CLASSES[status]}`}
    >
      {EXECUTION_STATUS_LABELS[status]}
    </span>
  );
}
