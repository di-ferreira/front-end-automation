"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { fileUrl, fileName } from "@/lib/format";
import type { GalleryAsset } from "./asset-card";

interface AssetLightboxProps {
  images: GalleryAsset[];
  index: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export function AssetLightbox({ images, index, onClose, onNavigate }: AssetLightboxProps) {
  const current = index !== null ? images[index] : null;

  return (
    <Dialog open={index !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-4xl">
        {current ? (
          <>
            <DialogHeader>
              <DialogTitle className="truncate pr-8 text-sm">
                {fileName(current.filePath)}
              </DialogTitle>
              <DialogDescription>
                Imagem {(index ?? 0) + 1} de {images.length}
              </DialogDescription>
            </DialogHeader>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={fileUrl(current.filePath)}
              alt={current.filePath}
              className="border-border max-h-[70vh] w-full rounded-lg border object-contain"
            />
            <div className="flex items-center justify-between gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={index === 0}
                onClick={() => onNavigate((index ?? 0) - 1)}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                render={<a href={fileUrl(current.filePath, true)} download />}
              >
                Baixar
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={index === images.length - 1}
                onClick={() => onNavigate((index ?? 0) + 1)}
              >
                Proxima
              </Button>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
