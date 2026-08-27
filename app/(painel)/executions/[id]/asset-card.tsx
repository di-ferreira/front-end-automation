"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { APPROVAL_STATUS_LABELS, type ApprovalStatus, type AssetType } from "@/lib/validation";
import { cn } from "@/lib/utils";
import { fileUrl, formatBytes, formatDecision } from "@/lib/format";
import { useClipboard } from "@/hooks/use-clipboard";

export interface GalleryAsset {
  id: number;
  type: AssetType;
  filePath: string;
  mimeType?: string | null;
  sizeBytes?: number | null;
  createdAt?: string | null;
  textContent?: string | null;
  approvalStatus: ApprovalStatus;
  approvedByName?: string | null;
  approvedAt?: string | null;
}

const BADGE_CLASSES: Record<ApprovalStatus, string> = {
  pending: "border-amber-200 bg-amber-50 text-amber-700",
  approved: "border-emerald-200 bg-emerald-50 text-emerald-700",
  rejected: "border-red-200 bg-red-50 text-red-700",
};

const DECISION_VERB: Record<Exclude<ApprovalStatus, "pending">, string> = {
  approved: "Aprovado",
  rejected: "Rejeitado",
};

interface AssetCardProps {
  asset: GalleryAsset;
  onOpenImage?: () => void;
  onDecide: (assetId: number, status: ApprovalStatus) => Promise<void>;
}

export function AssetCard({ asset, onOpenImage, onDecide }: AssetCardProps) {
  const { copied, copy } = useClipboard();
  const [pendingDecision, setPendingDecision] = useState(false);

  async function runDecision(status: ApprovalStatus) {
    setPendingDecision(true);
    try {
      await onDecide(asset.id, status);
    } finally {
      setPendingDecision(false);
    }
  }

  return (
    <article
      className={cn(
        "border-border bg-card flex flex-col overflow-hidden rounded-xl border shadow-sm transition-colors",
        asset.approvalStatus === "approved" && "border-emerald-300",
        asset.approvalStatus === "rejected" && "border-red-200 opacity-90 hover:opacity-100",
      )}
    >
      <div className="bg-muted/30 relative flex min-h-40 flex-1 items-center justify-center">
        <span
          className={`absolute top-2 right-2 z-10 inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${BADGE_CLASSES[asset.approvalStatus]}`}
        >
          {APPROVAL_STATUS_LABELS[asset.approvalStatus]}
        </span>

        {asset.type === "video" ? (
          <video
            controls
            preload="metadata"
            src={fileUrl(asset.filePath)}
            aria-label={`Video: ${asset.filePath.split("/").pop() ?? "asset"}`}
            className="aspect-video w-full"
          />
        ) : asset.type === "music" ? (
          <audio
            controls
            preload="metadata"
            src={fileUrl(asset.filePath)}
            aria-label={`Audio: ${asset.filePath.split("/").pop() ?? "asset"}`}
            className="w-full px-3"
          />
        ) : onOpenImage ? (
          <button
            type="button"
            onClick={onOpenImage}
            className="focus-visible:ring-ring/50 w-full cursor-zoom-in outline-none focus-visible:ring-3"
            aria-label="Ampliar imagem"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={fileUrl(asset.filePath)}
              alt={asset.filePath.split("/").pop() ?? ""}
              loading="lazy"
              className="aspect-video w-full object-cover transition-opacity hover:opacity-90"
            />
          </button>
        ) : (
          <pre className="text-muted-foreground max-h-44 w-full overflow-auto p-4 text-left text-xs leading-5 whitespace-pre-wrap">
            {asset.textContent ?? "(sem conteudo)"}
          </pre>
        )}
      </div>

      <div className="border-border space-y-2 border-t p-3">
        <p className="text-muted-foreground truncate text-xs" title={asset.filePath}>
          {asset.filePath.split("/").slice(1).join("/") || asset.filePath}
          {asset.sizeBytes ? ` \u00b7 ${formatBytes(asset.sizeBytes)}` : ""}
        </p>

        {asset.approvedByName && asset.approvedAt ? (
          <p className="text-muted-foreground text-[11px] italic">
            {DECISION_VERB[asset.approvalStatus as Exclude<ApprovalStatus, "pending">] ?? ""} por{" "}
            {asset.approvedByName} em {formatDecision(asset.approvedAt)}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-1">
          {asset.approvalStatus !== "approved" ? (
            <Button size="xs" onClick={() => runDecision("approved")} disabled={pendingDecision}>
              Aprovar
            </Button>
          ) : null}
          {asset.approvalStatus !== "rejected" ? (
            <Button
              variant="destructive"
              size="xs"
              onClick={() => runDecision("rejected")}
              disabled={pendingDecision}
            >
              Rejeitar
            </Button>
          ) : null}
          {asset.approvalStatus !== "pending" ? (
            <Button
              variant="ghost"
              size="xs"
              onClick={() => runDecision("pending")}
              disabled={pendingDecision}
            >
              Desfazer
            </Button>
          ) : null}
          <Button variant="ghost" size="xs" onClick={() => copy(asset.filePath, "path")}>
            {copied === "path" ? "Copiado!" : "Copiar caminho"}
          </Button>
          {asset.type === "description" && asset.textContent ? (
            <Button variant="ghost" size="xs" onClick={() => copy(asset.textContent!, "text")}>
              {copied === "text" ? "Copiado!" : "Copiar texto"}
            </Button>
          ) : null}
          <Button
            variant="outline"
            size="xs"
            render={<a href={fileUrl(asset.filePath, true)} download />}
          >
            Baixar
          </Button>
        </div>
      </div>
    </article>
  );
}
