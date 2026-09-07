"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { formatDateTime, formatBytes } from "@/lib/format";
import { AssetStatusBadge, AssetTypeBadge } from "./asset-status-badge";
import { LoadingSpinner } from "@/components/loading-spinner";
import type { GenerationStatus, AssetStudioType } from "@/lib/validation";
import type { GenerationWorkflowExecution } from "@/db/queries/asset-generations";

interface AssetPreviewCardProps {
  generation: {
    id: number;
    assetType: string;
    status: GenerationStatus;
    filePath: string | null;
    mimeType: string | null;
    sizeBytes: number | null;
    error: string | null;
    createdAt: Date;
  };
  channelName: string;
  workflowExecution?: GenerationWorkflowExecution | null;
  children?: React.ReactNode;
  className?: string;
}

export function AssetPreviewCard({
  generation,
  channelName,
  workflowExecution,
  children,
  className,
}: AssetPreviewCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/assets/${generation.assetType}/${generation.id}`);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "bg-card hover:border-primary/30 w-full cursor-pointer rounded-xl border p-4 text-left shadow-sm transition-all hover:shadow-md",
        generation.status === "generating" && "border-sky-400/50",
        generation.status === "failed" && "border-red-400/50",
        className,
      )}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <AssetTypeBadge type={generation.assetType as AssetStudioType} />
          <AssetStatusBadge status={generation.status} />
        </div>
        <div className="flex items-center gap-1">
          {generation.status === "generating" && <LoadingSpinner label="" />}
          <span className="text-muted-foreground text-xs">#{generation.id}</span>
        </div>
      </div>

      <div className="mb-3 text-sm">
        <p className="text-foreground font-medium">{channelName}</p>
        <p className="text-muted-foreground text-xs">{formatDateTime(generation.createdAt)}</p>
      </div>

      {generation.filePath && (
        <div className="text-muted-foreground mb-3 text-xs">
          <p className="truncate">{generation.filePath}</p>
          {generation.sizeBytes != null && <p>{formatBytes(generation.sizeBytes)}</p>}
        </div>
      )}

      {workflowExecution?.durationMs != null && (
        <div className="text-muted-foreground mb-2 text-xs">
          Duração: {workflowExecution.durationMs}ms
        </div>
      )}

      {generation.error && <p className="text-destructive mb-3 text-xs">{generation.error}</p>}

      {children}
    </button>
  );
}
