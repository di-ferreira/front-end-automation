import { promises as fsp } from "node:fs";
import { notFound } from "next/navigation";

import { formatDateTime } from "@/lib/format";
import { getExecution } from "@/db/queries/executions";
import { listExecutionAssetsDetailed } from "@/db/queries/assets";
import { resolveWithinOutputDir } from "@/lib/assets";
import type { ApprovalStatus } from "@/lib/validation";

import { AssetGallery, type GalleryAsset } from "./asset-gallery";
import { ExecutionDetailHeader } from "./execution-detail-header";
import { ExecutionHistory } from "./execution-history";

export const metadata = {
  title: "Execucao",
};

const MAX_TEXT_BYTES = 20_000;

interface DecisionEntry {
  assetId: number;
  assetName: string;
  status: ApprovalStatus;
  who: string | null;
  when: string;
}

export default async function ExecutionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const execution = await getExecution(id);
  if (!execution) notFound();

  const rows = await listExecutionAssetsDetailed(execution.id);

  const assets: GalleryAsset[] = await Promise.all(
    rows.map(async (row) => {
      let textContent: string | null = null;
      if (row.type === "description") {
        const absolute = resolveWithinOutputDir(row.filePath.split("/"));
        if (absolute) {
          try {
            textContent = (await fsp.readFile(absolute, { encoding: "utf8", flag: "r" })).slice(
              0,
              MAX_TEXT_BYTES,
            );
          } catch {
            textContent = null;
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

  const history: DecisionEntry[] = rows
    .filter((row) => row.approvalStatus !== "pending" && row.approvedAt)
    .sort((a, b) => new Date(b.approvedAt!).getTime() - new Date(a.approvedAt!).getTime())
    .map((row) => ({
      assetId: row.id,
      assetName: row.filePath.split("/").slice(1).join("/") || row.filePath,
      status: row.approvalStatus,
      who: row.approvedByName ?? "?",
      when: formatDateTime(row.approvedAt),
    }));

  return (
    <section className="space-y-6">
      <ExecutionDetailHeader
        id={execution.id}
        status={execution.status}
        title={execution.title}
        description={execution.description}
        promptText={execution.promptText}
        error={execution.error}
        createdAt={execution.createdAt}
        startedAt={execution.startedAt}
        finishedAt={execution.finishedAt}
      />

      {assets.length === 0 ? (
        <div className="border-border bg-card text-muted-foreground flex flex-col items-center justify-center gap-1 rounded-xl border px-6 py-16 text-center text-sm shadow-sm">
          <span className="text-foreground font-medium">Nenhum asset registrado</span>
          <span>
            Os arquivos aparecem aqui apos o callback do N8N com status &quot;completed&quot;.
          </span>
        </div>
      ) : (
        <AssetGallery executionId={execution.id} assets={assets} />
      )}

      <ExecutionHistory entries={history} />
    </section>
  );
}
