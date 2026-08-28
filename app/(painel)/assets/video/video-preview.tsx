"use client";

import { useCallback, useState } from "react";
import { Video } from "lucide-react";

import { AssetPageLayout } from "@/components/asset-studio/asset-page-layout";
import { AssetGeneratorForm } from "@/components/asset-studio/asset-generator-form";
import { AssetPreviewCard } from "@/components/asset-studio/asset-preview-card";

import type { ChannelRow } from "@/db/schema";
import type { AssetGenerationDetail } from "@/db/queries/asset-generations";

interface VideoPreviewProps {
  channels: ChannelRow[];
  initialGenerations: AssetGenerationDetail[];
}

export function VideoPreview({ channels, initialGenerations }: VideoPreviewProps) {
  const [generations] = useState(initialGenerations);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async (data: { channelId: number; promptText?: string }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/assets/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, assetType: "video" }),
      });
      const result = await res.json();
      if (!res.ok) {
        setError(result.error ?? "Erro ao gerar vídeo");
        return;
      }
      window.location.reload();
    } catch {
      setError("Falha ao conectar com o servidor");
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <AssetPageLayout
      title="Video Asset Studio"
      description="Gere vídeos para seus canais"
      sidebar={
        <AssetGeneratorForm
          channels={channels}
          assetType="video"
          label="Vídeo"
          loading={loading}
          error={error}
          onSubmit={handleSubmit}
        />
      }
    >
      {generations.length === 0 ? (
        <div className="border-border rounded-xl border border-dashed p-12 text-center">
          <Video className="text-muted-foreground mx-auto mb-3 size-10" />
          <p className="text-muted-foreground text-sm">Nenhum vídeo gerado ainda.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {generations.map((gen) => (
            <AssetPreviewCard key={gen.id} generation={gen} channelName={gen.channelName}>
              {gen.filePath && (
                <video controls className="w-full rounded-lg">
                  <source src={`/api/files/${gen.filePath}`} />
                </video>
              )}
            </AssetPreviewCard>
          ))}
        </div>
      )}
    </AssetPageLayout>
  );
}
