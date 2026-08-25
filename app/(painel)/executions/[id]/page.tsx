import { promises as fsp } from "node:fs";
import Link from "next/link";
import { notFound } from "next/navigation";

import { StatusBadge } from "../../status-badge";
import { formatDateTime } from "@/lib/format";
import { getExecution } from "@/db/queries/executions";
import { listExecutionAssetsDetailed } from "@/db/queries/assets";
import { resolveWithinOutputDir } from "@/lib/assets";
import {
  APPROVAL_STATUS_LABELS,
  type ApprovalStatus,
} from "@/lib/validation";

import { AssetGallery, type GalleryAsset } from "./asset-gallery";
import { EditExecutionDialog } from "./edit-execution-dialog";

export const metadata = {
  title: "Execução",
};

const MAX_TEXT_BYTES = 20_000;

interface DecisionEntry {
  assetId: number;
  assetName: string;
  status: ApprovalStatus;
  who: string | null;
  when: string;
}

export default async function ExecutionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const execution = await getExecution(id);
  if (!execution) notFound();

  const rows = await listExecutionAssetsDetailed(execution.id);

  // Lê o conteúdo dos assets de descrição direto do disco (server-side)
  const assets: GalleryAsset[] = await Promise.all(
    rows.map(async (row) => {
      let textContent: string | null = null;
      if (row.type === "description") {
        const absolute = resolveWithinOutputDir(row.filePath.split("/"));
        if (absolute) {
          try {
            textContent = (
              await fsp.readFile(absolute, { encoding: "utf8", flag: "r" })
            ).slice(0, MAX_TEXT_BYTES);
          } catch {
            textContent = null; // arquivo ainda não existe ou sumiu
          }
        }
      }
      return {
        id: row.id,
        type: row.type,
        filePath: row.filePath,
        mimeType: row.mimeType,
        sizeBytes: row.sizeBytes,
        textContent,
        approvalStatus: row.approvalStatus,
        approvedByName: row.approvedByName,
        approvedAt: row.approvedAt ? row.approvedAt.toISOString() : null,
      };
    }),
  );

  // Histórico de decisões (mais recentes primeiro)
  const history: DecisionEntry[] = rows
    .filter((row) => row.approvalStatus !== "pending" && row.approvedAt)
    .sort(
      (a, b) =>
        new Date(b.approvedAt!).getTime() - new Date(a.approvedAt!).getTime(),
    )
    .map((row) => ({
      assetId: row.id,
      assetName:
        row.filePath.split("/").slice(1).join("/") || row.filePath,
      status: row.approvalStatus,
      who: row.approvedByName ?? "?",
      when: formatDateTime(row.approvedAt),
    }));

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-2">
        <Link
          href="/"
          className="text-muted-foreground hover:text-foreground text-sm transition-colors"
        >
          ← Voltar às execuções
        </Link>
      </div>

      <header className="border-border bg-card rounded-xl border p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={execution.status} />
              <h1 className="text-foreground min-w-0 truncate text-xl font-semibold tracking-tight">
                {execution.title ?? "Execução"}
              </h1>
            </div>

            {execution.description ? (
              <p className="text-foreground max-w-3xl text-sm leading-6 whitespace-pre-wrap">
                {execution.description}
              </p>
            ) : null}

            <p className="text-muted-foreground line-clamp-2 max-w-3xl text-xs leading-5">
              Prompt: {execution.promptText ?? "—"}
            </p>

            {execution.error ? (
              <p role="alert" className="text-destructive text-sm">
                {execution.error}
              </p>
            ) : null}
          </div>

          <div className="flex shrink-0 flex-col items-start gap-1 sm:items-end">
            <EditExecutionDialog
              executionId={execution.id}
              initialTitle={execution.title}
              initialDescription={execution.description}
            />
            <dl className="text-muted-foreground space-y-1 text-xs whitespace-nowrap sm:text-right">
              <dd>Criada em {formatDateTime(execution.createdAt)}</dd>
              {execution.startedAt ? (
                <dd>Início: {formatDateTime(execution.startedAt)}</dd>
              ) : null}
              {execution.finishedAt ? (
                <dd>Fim: {formatDateTime(execution.finishedAt)}</dd>
              ) : null}
            </dl>
          </div>
        </div>
      </header>

      {assets.length === 0 ? (
        <div className="border-border bg-card text-muted-foreground flex flex-col items-center justify-center gap-1 rounded-xl border px-6 py-16 text-center text-sm shadow-sm">
          <span className="text-foreground font-medium">
            Nenhum asset registrado
          </span>
          <span>
            Os arquivos aparecem aqui após o callback do N8N com status
            &quot;completed&quot;.
          </span>
        </div>
      ) : (
        <AssetGallery executionId={execution.id} assets={assets} />
      )}

      {/* Histórico das decisões */}
      {history.length > 0 ? (
        <section className="border-border bg-card rounded-xl border shadow-sm">
          <h2 className="border-border text-foreground border-b px-4 py-3 text-sm font-semibold">
            Histórico de decisões ({history.length})
          </h2>
          <ul className="divide-border divide-y">
            {history.map((entry) => (
              <li
                key={entry.assetId}
                className="flex flex-wrap items-center gap-x-2 gap-y-1 px-4 py-2.5 text-xs"
              >
                <span
                  className={`inline-flex items-center rounded-full border px-2 py-0.5 font-medium ${
                    entry.status === "approved"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-red-200 bg-red-50 text-red-700"
                  }`}
                >
                  {APPROVAL_STATUS_LABELS[entry.status]}
                </span>
                <span
                  className="text-foreground max-w-64 truncate font-medium"
                  title={entry.assetName}
                >
                  {entry.assetName}
                </span>
                <span className="text-muted-foreground ml-auto">
                  por <strong>{entry.who}</strong> em {entry.when}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </section>
  );
}
