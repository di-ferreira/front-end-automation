import { promises as fsp } from "node:fs";
import Link from "next/link";
import { notFound } from "next/navigation";

import { StatusBadge } from "../../status-badge";
import { formatDateTime } from "@/lib/format";
import { getExecution } from "@/db/queries/executions";
import { listExecutionAssets } from "@/db/queries/assets";
import { resolveWithinOutputDir } from "@/lib/assets";

import { AssetGallery, type GalleryAsset } from "./asset-gallery";

export const metadata = {
  title: "Execução",
};

const MAX_TEXT_BYTES = 20_000;

export default async function ExecutionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const execution = await getExecution(id);
  if (!execution) notFound();

  const rows = await listExecutionAssets(execution.id);

  // Lê o conteúdo dos assets de descrição direto do disco (server-side)
  const assets: GalleryAsset[] = await Promise.all(
    rows.map(async (row) => {
      if (row.type !== "description") {
        return {
          id: row.id,
          type: row.type,
          filePath: row.filePath,
          mimeType: row.mimeType,
          sizeBytes: row.sizeBytes,
        };
      }
      const absolute = resolveWithinOutputDir(row.filePath.split("/"));
      let textContent: string | null = null;
      if (absolute) {
        try {
          textContent = (
            await fsp.readFile(absolute, { encoding: "utf8", flag: "r" })
          ).slice(0, MAX_TEXT_BYTES);
        } catch {
          textContent = null; // arquivo ainda não existe ou sumiu
        }
      }
      return {
        id: row.id,
        type: row.type,
        filePath: row.filePath,
        mimeType: row.mimeType,
        sizeBytes: row.sizeBytes,
        textContent,
      };
    }),
  );

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
              <h1 className="text-foreground truncate text-xl font-semibold tracking-tight">
                {execution.title ?? "Execução"}
              </h1>
            </div>
            <p className="text-muted-foreground line-clamp-3 max-w-3xl text-sm leading-6">
              {execution.promptText ?? "—"}
            </p>
            {execution.error ? (
              <p role="alert" className="text-destructive text-sm">
                {execution.error}
              </p>
            ) : null}
          </div>

          <dl className="text-muted-foreground shrink-0 space-y-1 text-xs whitespace-nowrap sm:text-right">
            <div className="flex justify-between gap-4 sm:block">
              <dt className="inline sm:hidden">Criada em:</dt>
              <dd>{formatDateTime(execution.createdAt)}</dd>
            </div>
            {execution.startedAt ? (
              <div className="flex justify-between gap-4 sm:block">
                <dt className="inline sm:hidden">Início:</dt>
                <dd>Início: {formatDateTime(execution.startedAt)}</dd>
              </div>
            ) : null}
            {execution.finishedAt ? (
              <div className="flex justify-between gap-4 sm:block">
                <dt className="inline sm:hidden">Fim:</dt>
                <dd>Fim: {formatDateTime(execution.finishedAt)}</dd>
              </div>
            ) : null}
          </dl>
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
        <>
          <p className="text-muted-foreground text-xs" role="status">
            {assets.length} asset{assets.length === 1 ? "" : "s"} ·{" "}
            {execution.status === "running" ? (
              <span>lista pode atualizar ao concluir a execução</span>
            ) : null}
          </p>
          <AssetGallery assets={assets} />
        </>
      )}
    </section>
  );
}
