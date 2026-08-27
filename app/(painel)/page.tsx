import Link from "next/link";

import { auth } from "@/auth";
import { formatDateTime } from "@/lib/format";
import { StatusBadge } from "./status-badge";

import { NewExecutionDialog } from "./new-execution-dialog";
import { AutoRefresh } from "./auto-refresh";
import { ExecutionsFilter } from "./executions-filter";
import { listExecutions } from "@/db/queries/executions";
import { executionStatusFilterSchema } from "@/lib/validation";
import type { ExecutionStatus, FilterValue } from "@/lib/validation";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const session = await auth();

  const allRows = await listExecutions({ limit: 200 });

  const counts: Record<FilterValue, number> = {
    all: allRows.length,
    queued: 0,
    running: 0,
    completed: 0,
    failed: 0,
  };
  for (const row of allRows) {
    counts[row.status as ExecutionStatus]++;
  }

  const parsed = executionStatusFilterSchema.safeParse(status);
  const activeFilter: FilterValue = parsed.success && parsed.data ? parsed.data : "all";
  const rows = activeFilter === "all" ? allRows : allRows.filter((r) => r.status === activeFilter);

  const hasActive = allRows.some(
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

      <ExecutionsFilter active={activeFilter} counts={counts} />

      <AutoRefresh active={hasActive} />

      {rows.length === 0 ? (
        <div className="border-border bg-card text-muted-foreground flex flex-col items-center justify-center gap-2 rounded-xl border px-6 py-16 text-center text-sm shadow-sm">
          <span className="text-foreground font-medium">
            {activeFilter !== "all"
              ? "Nenhuma execução neste filtro"
              : "Nenhuma execução ainda"}
          </span>
          <span>
            {activeFilter !== "all"
              ? "Tente trocar o filtro ou crie uma nova geração."
              : (
                <>
                  Dispare sua primeira geração com o botão{" "}
                  <span className="text-foreground font-medium">Nova geração</span>.
                </>
              )}
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
                  <Link
                    href={`/executions/${row.id}`}
                    className="text-primary hover:underline"
                  >
                    Ver detalhes →
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className="text-muted-foreground text-xs">
        Bem-vindo{session?.user?.name ? `, ${session.user.name}` : ""} —{" "}
        {activeFilter !== "all"
          ? `${rows.length} de ${allRows.length}`
          : allRows.length}{" "}
        execuç{allRows.length === 1 ? "ão" : "ões"} registrada
        {allRows.length === 1 ? "" : "s"}.
      </p>
    </section>
  );
}
