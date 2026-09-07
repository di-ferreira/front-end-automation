"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Download, RefreshCw } from "lucide-react";

import { AssetPageLayout } from "@/components/asset-studio/asset-page-layout";
import { AssetGeneratorForm } from "@/components/asset-studio/asset-generator-form";
import { AssetStatusBadge } from "@/components/asset-studio/asset-status-badge";
import { LoadingSpinner } from "@/components/loading-spinner";
import { ErrorMessage } from "@/components/error-message";
import { Button } from "@/components/ui/button";
import { usePolling } from "@/components/hooks/use-polling";

import type { AssetGenerationDetail } from "@/db/queries/asset-generations";
import type { ChannelRow } from "@/db/schema";
import type { GenerationStatus } from "@/lib/validation";

interface AssetDetailPageProps {
  generation: AssetGenerationDetail;
  channels: ChannelRow[];
  assetTypeLabel: string;
}

export function AssetDetailPage({ generation, channels, assetTypeLabel }: AssetDetailPageProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState(false);

  const { data: refreshed } = usePolling<{
    generation: AssetGenerationDetail;
  }>(`/api/assets/generations/${generation.id}`, 3000, generation.status === "generating");

  const currentGeneration = refreshed?.generation ?? generation;
  const currentStatus = currentGeneration.status as GenerationStatus;

  const handleRegenerate = useCallback(
    async (data: { channelId: number; promptText?: string }) => {
      setRegenerating(true);
      setError(null);
      try {
        const res = await fetch(`/api/assets/generations/${generation.id}/regenerate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            promptText: data.promptText ?? currentGeneration.promptText ?? undefined,
          }),
        });
        const result = await res.json();
        if (!res.ok) {
          setError(result.error ?? "Erro ao regenerar");
          return;
        }
      } catch {
        setError("Falha ao conectar com o servidor");
      } finally {
        setRegenerating(false);
      }
    },
    [generation.id, currentGeneration.promptText],
  );

  const handleRegenerateClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      handleRegenerate({ channelId: channels[0]?.id ?? 1 });
    },
    [handleRegenerate, channels],
  );

  const handleDownload = useCallback(() => {
    if (!currentGeneration.filePath) return;
    window.open(`/api/files/${currentGeneration.filePath}?download=1`, "_blank");
  }, [currentGeneration.filePath]);

  return (
    <AssetPageLayout
      title={`${assetTypeLabel} #${currentGeneration.id}`}
      description="Visualize e gerencie seu asset"
      sidebar={
        <AssetGeneratorForm
          channels={channels}
          assetType={currentGeneration.assetType}
          label={assetTypeLabel}
          loading={regenerating}
          error={error}
          onSubmit={handleRegenerate}
        />
      }
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <AssetStatusBadge status={currentStatus} />
          {currentStatus === "generating" && <LoadingSpinner label="Gerando..." />}
          {currentStatus === "completed" && currentGeneration.filePath && (
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="mr-1 size-4" /> Download
            </Button>
          )}
          {currentStatus !== "generating" && currentStatus !== "pending" && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRegenerateClick}
              disabled={regenerating}
            >
              <RefreshCw className="mr-1 size-4" /> Regenerar
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-1 size-4" /> Voltar
          </Button>
        </div>

        {error && <ErrorMessage message={error} />}

        <div className="bg-card space-y-4 rounded-xl border p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-muted-foreground text-xs">Canal</p>
              <p className="text-foreground font-medium">{currentGeneration.channelName}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Status</p>
              <p className="text-foreground font-medium">{currentStatus}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Criado em</p>
              <p className="text-foreground font-medium">
                {new Intl.DateTimeFormat("pt-BR", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                }).format(currentGeneration.createdAt)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Prompt</p>
              <p className="text-foreground font-medium">{currentGeneration.promptText ?? "—"}</p>
            </div>
          </div>

          {currentGeneration.filePath && (
            <div>
              <p className="text-muted-foreground text-xs">Arquivo</p>
              <p className="text-foreground truncate font-medium">{currentGeneration.filePath}</p>
              {currentGeneration.sizeBytes != null && (
                <p className="text-muted-foreground text-xs">{currentGeneration.sizeBytes} bytes</p>
              )}
            </div>
          )}

          {currentGeneration.error && (
            <div>
              <p className="text-muted-foreground text-xs">Erro</p>
              <p className="text-destructive font-medium">{currentGeneration.error}</p>
            </div>
          )}

          {currentStatus === "generating" && (
            <div className="border-border rounded-xl border border-dashed p-8 text-center">
              <LoadingSpinner label="Aguardando a geração do asset..." />
              <p className="text-muted-foreground mt-2 text-sm">
                Atualizando automaticamente a cada 3s...
              </p>
            </div>
          )}

          {currentStatus === "completed" && currentGeneration.filePath && (
            <div className="overflow-hidden rounded-xl border">
              {currentGeneration.filePath.match(/\.(mp4|webm|mov|mkv|avi)$/i) ? (
                <video controls className="w-full rounded-lg">
                  <source src={`/api/files/${currentGeneration.filePath}`} />
                </video>
              ) : currentGeneration.filePath.match(/\.(mp3|wav|m4a|ogg|flac)$/i) ? (
                <audio controls className="w-full">
                  <source src={`/api/files/${currentGeneration.filePath}`} />
                </audio>
              ) : currentGeneration.filePath.match(/\.(png|jpg|jpeg|webp|gif|svg)$/i) ? (
                <img
                  src={`/api/files/${currentGeneration.filePath}`}
                  alt="Asset"
                  className="w-full rounded-lg object-contain"
                />
              ) : (
                <a
                  href={`/api/files/${currentGeneration.filePath}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary block p-8 text-center underline hover:underline"
                >
                  Abrir arquivo
                </a>
              )}
            </div>
          )}

          {currentStatus === "failed" && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:bg-red-950">
              <p className="text-destructive font-medium">Geração falhou</p>
              {currentGeneration.error && (
                <p className="text-muted-foreground mt-1 text-sm">{currentGeneration.error}</p>
              )}
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={handleRegenerateClick}
                disabled={regenerating}
              >
                <RefreshCw className="mr-1 size-4" /> Tentar Novamente
              </Button>
            </div>
          )}
        </div>
      </div>
    </AssetPageLayout>
  );
}
