"use client";

import { useCallback, useState } from "react";
import { FileText } from "lucide-react";

import { AssetPageLayout } from "@/components/asset-studio/asset-page-layout";
import { AssetGeneratorForm } from "@/components/asset-studio/asset-generator-form";
import { AssetPreviewCard } from "@/components/asset-studio/asset-preview-card";

import type { ChannelRow } from "@/db/schema";
import type { AssetGenerationDetail } from "@/db/queries/asset-generations";

interface DescriptionPreviewProps {
  channels: ChannelRow[];
  initialGenerations: AssetGenerationDetail[];
}

export function DescriptionPreview({ channels, initialGenerations }: DescriptionPreviewProps) {
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
        body: JSON.stringify({ ...data, assetType: "description" }),
      });
      const result = await res.json();
      if (!res.ok) {
        setError(result.error ?? "Erro ao gerar descrição");
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
      title="Description Asset Studio"
      description="Gere descrições para seus canais"
      sidebar={
        <AssetGeneratorForm
          channels={channels}
          assetType="description"
          label="Descrição"
          loading={loading}
          error={error}
          onSubmit={handleSubmit}
        />
      }
    >
      {generations.length === 0 ? (
        <div className="border-border rounded-xl border border-dashed p-12 text-center">
          <FileText className="text-muted-foreground mx-auto mb-3 size-10" />
          <p className="text-muted-foreground text-sm">Nenhuma descrição gerada ainda.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {generations.map((gen) => (
            <AssetPreviewCard key={gen.id} generation={gen} channelName={gen.channelName}>
              {gen.filePath && (
                <a
                  href={`/api/files/${gen.filePath}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary underline-offset-4 hover:underline"
                >
                  Ver descrição
                </a>
              )}
            </AssetPreviewCard>
          ))}
        </div>
      )}
    </AssetPageLayout>
  );
}
