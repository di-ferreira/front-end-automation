"use client";

import { useCallback, useState } from "react";
import { Image } from "lucide-react";

import { AssetPageLayout } from "@/components/asset-studio/asset-page-layout";
import { AssetGeneratorForm } from "@/components/asset-studio/asset-generator-form";
import { AssetPreviewCard } from "@/components/asset-studio/asset-preview-card";

import type { ChannelRow } from "@/db/schema";
import type { AssetGenerationDetail } from "@/db/queries/asset-generations";

interface ThumbnailPreviewProps {
  channels: ChannelRow[];
  initialGenerations: AssetGenerationDetail[];
}

export function ThumbnailPreview({ channels, initialGenerations }: ThumbnailPreviewProps) {
  const [generations, setGenerations] = useState(initialGenerations);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async (data: { channelId: number; promptText?: string }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/assets/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, assetType: "thumbnail" }),
      });
      const result = await res.json();
      if (!res.ok) {
        setError(result.error ?? "Erro ao gerar thumbnail");
        return;
      }
      setGenerations((prev) => [result, ...prev]);
    } catch {
      setError("Falha ao conectar com o servidor");
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <AssetPageLayout
      title="Thumbnail Asset Studio"
      description="Gere thumbnails para seus canais"
      sidebar={
        <AssetGeneratorForm
          channels={channels}
          assetType="thumbnail"
          label="Thumbnail"
          loading={loading}
          error={error}
          onSubmit={handleSubmit}
        />
      }
    >
      {generations.length === 0 ? (
        <div className="border-border rounded-xl border border-dashed p-12 text-center">
          <Image className="text-muted-foreground mx-auto mb-3 size-10" />
          <p className="text-muted-foreground text-sm">Nenhuma thumbnail gerada ainda.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {generations.map((gen) => (
            <AssetPreviewCard key={gen.id} generation={gen} channelName={gen.channelName}>
              {gen.filePath && (
                <img
                  src={`/api/files/${gen.filePath}`}
                  alt={`Thumbnail gerada para ${gen.channelName}`}
                  className="w-full rounded-lg object-cover"
                  loading="lazy"
                />
              )}
            </AssetPreviewCard>
          ))}
        </div>
      )}
    </AssetPageLayout>
  );
}
