import { auth } from "@/auth";
import { NewExecutionDialog } from "./new-execution-dialog";
import { AutoRefresh } from "./auto-refresh";
import { ExecutionsFilter } from "./executions-filter";
import { ExecutionListItem } from "./execution-list-item";
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

  const hasActive = allRows.some((row) => row.status === "queued" || row.status === "running");

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-semibold tracking-tight">Execucoes</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Acompanhe as geracoes disparadas para a automacao de videos.
          </p>
        </div>
        <NewExecutionDialog />
      </div>

      <ExecutionsFilter active={activeFilter} counts={counts} />

      <AutoRefresh active={hasActive} />

      {rows.length === 0 ? (
        <div className="border-border bg-card text-muted-foreground flex flex-col items-center justify-center gap-2 rounded-xl border px-6 py-16 text-center text-sm shadow-sm">
          <p className="text-foreground font-medium">
            {activeFilter !== "all" ? "Nenhuma execucao neste filtro" : "Nenhuma execucao ainda"}
          </p>
          <p>
            {activeFilter !== "all"
              ? "Tente trocar o filtro ou crie uma nova geracao."
              : "Dispare sua primeira geracao com o botao Nova geracao."}
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map((row) => (
            <ExecutionListItem
              key={row.id}
              id={row.id}
              status={row.status}
              title={row.title}
              promptName={row.promptName}
              promptText={row.promptText}
              error={row.error}
              createdAt={row.createdAt}
              startedAt={row.startedAt}
              finishedAt={row.finishedAt}
            />
          ))}
        </ul>
      )}

      <p className="text-muted-foreground text-xs">
        Bem-vindo{session?.user?.name ? `, ${session.user.name}` : ""} &mdash;{" "}
        {activeFilter !== "all" ? `${rows.length} de ${allRows.length}` : allRows.length} execucao
        {allRows.length === 1 ? "" : "es"} registrada{allRows.length === 1 ? "" : "s"}.
      </p>
    </section>
  );
}
