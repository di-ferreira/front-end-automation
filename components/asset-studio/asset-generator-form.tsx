"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/loading-spinner";
import { ErrorMessage } from "@/components/error-message";
import { ChannelSelector } from "./channel-selector";

interface Channel {
  id: number;
  name: string;
  slug: string;
  color: string | null;
}

interface AssetGeneratorFormProps {
  channels: Channel[];
  assetType: string;
  label: string;
  loadingChannels?: boolean;
  loading?: boolean;
  error?: string | null;
  onSubmit: (data: { channelId: number; promptText?: string }) => void | Promise<void>;
}

export function AssetGeneratorForm({
  channels,
  assetType,
  label,
  loadingChannels,
  loading,
  error,
  onSubmit,
}: AssetGeneratorFormProps) {
  const [channelId, setChannelId] = useState<number | null>(null);
  const [promptText, setPromptText] = useState("");

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!channelId) return;
      await onSubmit({
        channelId,
        promptText: promptText.trim() || undefined,
      });
    },
    [channelId, promptText, onSubmit],
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor={`channel-${assetType}`} className="text-foreground text-sm font-medium">
          Canal
        </label>
        <ChannelSelector
          channels={channels}
          value={channelId}
          onChange={setChannelId}
          disabled={loading}
          loading={loadingChannels}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor={`prompt-${assetType}`} className="text-foreground text-sm font-medium">
          Prompt (opcional)
        </label>
        <textarea
          id={`prompt-${assetType}`}
          value={promptText}
          onChange={(e) => setPromptText(e.target.value)}
          placeholder="Instruções específicas para geração..."
          rows={3}
          disabled={loading}
          className="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring/50 w-full rounded-lg border px-3 py-2 text-sm transition-colors focus-visible:ring-3 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      <ErrorMessage message={error} />

      <Button type="submit" disabled={!channelId || loading} className="w-full">
        {loading ? <LoadingSpinner label={`Gerando ${label}...`} /> : `Gerar ${label}`}
      </Button>
    </form>
  );
}
