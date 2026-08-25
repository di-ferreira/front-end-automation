"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  APPROVAL_STATUS_LABELS,
  ASSET_TYPE_LABELS,
  type ApprovalStatus,
  type AssetType,
} from "@/lib/validation";
import { cn } from "@/lib/utils";

export interface GalleryAsset {
  id: number;
  type: AssetType;
  filePath: string;
  mimeType?: string | null;
  sizeBytes?: number | null;
  createdAt?: string | null;
  /** Conteúdo textual pré-lido no servidor (apenas descriptions). */
  textContent?: string | null;
  approvalStatus: ApprovalStatus;
  approvedByName?: string | null;
  /** ISO string (serializável entre RSC e client). */
  approvedAt?: string | null;
}

const SECTION_ORDER: AssetType[] = [
  "video",
  "thumb",
  "image",
  "music",
  "description",
];

type ApprovalFilter = "all" | ApprovalStatus;

const FILTERS: { value: ApprovalFilter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "pending", label: "Pendentes" },
  { value: "approved", label: "Aprovados" },
  { value: "rejected", label: "Rejeitados" },
];

const BADGE_CLASSES: Record<ApprovalStatus, string> = {
  pending: "border-amber-200 bg-amber-50 text-amber-700",
  approved: "border-emerald-200 bg-emerald-50 text-emerald-700",
  rejected: "border-red-200 bg-red-50 text-red-700",
};

function fileUrl(filePath: string, download = false): string {
  const encoded = filePath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  return download ? `/api/files/${encoded}?download=1` : `/api/files/${encoded}`;
}

function formatBytes(bytes: number | null | undefined): string {
  if (!bytes && bytes !== 0) return "";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }
  return `${value.toFixed(value >= 10 || unit === 0 ? 0 : 1)} ${units[unit]}`;
}

export function AssetGallery({
  executionId,
  assets,
}: {
  executionId: string;
  assets: GalleryAsset[];
}) {
  const router = useRouter();
  const [filter, setFilter] = useState<ApprovalFilter>("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [approvingAll, setApprovingAll] = useState(false);

  const counts = {
    all: assets.length,
    pending: assets.filter((asset) => asset.approvalStatus === "pending").length,
    approved: assets.filter((asset) => asset.approvalStatus === "approved").length,
    rejected: assets.filter((asset) => asset.approvalStatus === "rejected").length,
  };

  const visible =
    filter === "all" ? assets : assets.filter((a) => a.approvalStatus === filter);

  const images = visible.filter(
    (asset) => asset.type === "image" || asset.type === "thumb",
  );

  async function decide(assetId: number, approvalStatus: ApprovalStatus) {
    await fetch(`/api/executions/${executionId}/assets/${assetId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approvalStatus }),
    });
    router.refresh();
  }

  async function approveAll() {
    setApprovingAll(true);
    try {
      await fetch(`/api/executions/${executionId}/approve`, { method: "POST" });
      router.refresh();
    } finally {
      setApprovingAll(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Barra de filtros + aprovação global */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="bg-muted flex flex-wrap gap-1 rounded-lg p-1">
          {FILTERS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setFilter(option.value)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                filter === option.value
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {option.label}
              <span className="text-muted-foreground ml-1 text-xs tabular-nums">
                {counts[option.value]}
              </span>
            </button>
          ))}
        </div>

        {counts.pending > 0 ? (
          <Button variant="secondary" size="sm" onClick={approveAll} disabled={approvingAll}>
            {approvingAll
              ? "Aprovando..."
              : `Aprovar todos (${counts.pending})`}
          </Button>
        ) : null}
      </div>

      {visible.length === 0 ? (
        <p className="text-muted-foreground rounded-xl border border-dashed px-6 py-12 text-center text-sm">
          Nenhum asset neste filtro.
        </p>
      ) : (
        <div className="space-y-8">
          {SECTION_ORDER.map((type) => {
            const group = visible.filter((asset) => asset.type === type);
            if (group.length === 0) return null;

            return (
              <section key={type} className="space-y-3">
                <h2 className="text-foreground flex items-center gap-2 text-sm font-semibold">
                  {ASSET_TYPE_LABELS[type]}
                  <span className="text-muted-foreground font-normal">
                    ({group.length})
                  </span>
                </h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {group.map((asset) => (
                    <AssetCard
                      key={asset.id}
                      asset={asset}
                      onDecide={decide}
                      onOpenImage={
                        images.some((image) => image.id === asset.id)
                          ? () =>
                              setLightboxIndex(
                                images.findIndex(
                                  (image) => image.id === asset.id,
                                ),
                              )
                          : undefined
                      }
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      <Dialog
        open={lightboxIndex !== null}
        onOpenChange={(open) => !open && setLightboxIndex(null)}
      >
        <DialogContent className="sm:max-w-4xl">
          {lightboxIndex !== null && images[lightboxIndex] ? (
            <>
              <DialogHeader>
                <DialogTitle className="truncate pr-8 text-sm">
                  {images[lightboxIndex].filePath.split("/").pop()}
                </DialogTitle>
                <DialogDescription>
                  Imagem {lightboxIndex + 1} de {images.length}
                </DialogDescription>
              </DialogHeader>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={fileUrl(images[lightboxIndex].filePath)}
                alt={images[lightboxIndex].filePath}
                className="border-border max-h-[70vh] w-full rounded-lg border object-contain"
              />
              <div className="flex items-center justify-between gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={lightboxIndex === 0}
                  onClick={() => setLightboxIndex(lightboxIndex - 1)}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  render={
                    <a
                      href={fileUrl(images[lightboxIndex].filePath, true)}
                      download
                    />
                  }
                >
                  Baixar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={lightboxIndex === images.length - 1}
                  onClick={() => setLightboxIndex(lightboxIndex + 1)}
                >
                  Próxima
                </Button>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

const DECISION_VERB: Record<Exclude<ApprovalStatus, "pending">, string> = {
  approved: "Aprovado",
  rejected: "Rejeitado",
};

function formatDecision(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function AssetCard({
  asset,
  onOpenImage,
  onDecide,
}: {
  asset: GalleryAsset;
  onOpenImage?: () => void;
  onDecide: (assetId: number, status: ApprovalStatus) => Promise<void>;
}) {
  const [copied, setCopied] = useState<"path" | "text" | null>(null);
  const [pendingDecision, setPendingDecision] = useState(false);

  async function copy(value: string, kind: "path" | "text") {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(kind);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // clipboard indisponível (ex.: HTTP não seguro)
    }
  }

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
        asset.approvalStatus === "rejected" &&
          "border-red-200 opacity-90 hover:opacity-100",
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
            className="aspect-video w-full"
          />
        ) : asset.type === "music" ? (
          <audio
            controls
            preload="metadata"
            src={fileUrl(asset.filePath)}
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
            {asset.textContent ?? "(sem conteúdo)"}
          </pre>
        )}
      </div>

      <div className="border-border space-y-2 border-t p-3">
        <p className="text-muted-foreground truncate text-xs" title={asset.filePath}>
          {asset.filePath.split("/").slice(1).join("/") || asset.filePath}
          {asset.sizeBytes ? ` · ${formatBytes(asset.sizeBytes)}` : ""}
        </p>

        {asset.approvedByName && asset.approvedAt ? (
          <p className="text-muted-foreground text-[11px] italic">
            {DECISION_VERB[
              asset.approvalStatus as Exclude<ApprovalStatus, "pending">
            ] ?? ""}{" "}
            por {asset.approvedByName} em {formatDecision(asset.approvedAt)}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-1">
          {asset.approvalStatus !== "approved" ? (
            <Button
              size="xs"
              onClick={() => runDecision("approved")}
              disabled={pendingDecision}
            >
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
          <Button
            variant="ghost"
            size="xs"
            onClick={() => copy(asset.filePath, "path")}
          >
            {copied === "path" ? "Copiado!" : "Copiar caminho"}
          </Button>
          {asset.type === "description" && asset.textContent ? (
            <Button
              variant="ghost"
              size="xs"
              onClick={() => copy(asset.textContent!, "text")}
            >
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
