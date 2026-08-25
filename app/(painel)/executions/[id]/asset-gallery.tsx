"use client";

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
  ASSET_TYPE_LABELS,
  type AssetType,
} from "@/lib/validation";

export interface GalleryAsset {
  id: number;
  type: AssetType;
  filePath: string;
  mimeType?: string | null;
  sizeBytes?: number | null;
  createdAt?: string | null;
  /** Conteúdo textual pré-lido no servidor (apenas descriptions). */
  textContent?: string | null;
}

const SECTION_ORDER: AssetType[] = [
  "video",
  "thumb",
  "image",
  "music",
  "description",
];

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

export function AssetGallery({ assets }: { assets: GalleryAsset[] }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const images = assets.filter(
    (asset) => asset.type === "image" || asset.type === "thumb",
  );

  return (
    <div className="space-y-8">
      {SECTION_ORDER.map((type) => {
        const group = assets.filter((asset) => asset.type === type);
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
                  onOpenImage={
                    images.some((image) => image.id === asset.id)
                      ? () =>
                          setLightboxIndex(
                            images.findIndex((image) => image.id === asset.id),
                          )
                      : undefined
                  }
                />
              ))}
            </div>
          </section>
        );
      })}

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

function AssetCard({
  asset,
  onOpenImage,
}: {
  asset: GalleryAsset;
  onOpenImage?: () => void;
}) {
  const [copied, setCopied] = useState<"path" | "text" | null>(null);

  async function copy(value: string, kind: "path" | "text") {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(kind);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // clipboard indisponível (ex.: HTTP não seguro)
    }
  }

  return (
    <article className="border-border bg-card flex flex-col overflow-hidden rounded-xl border shadow-sm">
      <div className="bg-muted/30 flex min-h-40 flex-1 items-center justify-center">
        {asset.type === "video" ? (
           
          <video
            controls
            preload="metadata"
            src={fileUrl(asset.filePath)}
            className="aspect-video w-full"
          />
        ) : asset.type === "music" ? (
           
          <audio controls preload="metadata" src={fileUrl(asset.filePath)} className="w-full px-3" />
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
        <div className="flex flex-wrap gap-1">
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
