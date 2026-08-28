import { cn } from "@/lib/utils";
import { formatDateTime, formatBytes } from "@/lib/format";
import { AssetStatusBadge, AssetTypeBadge } from "./asset-status-badge";
import type { GenerationStatus, AssetStudioType } from "@/lib/validation";

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
  children?: React.ReactNode;
  className?: string;
}

export function AssetPreviewCard({
  generation,
  channelName,
  children,
  className,
}: AssetPreviewCardProps) {
  return (
    <div
      className={cn(
        "bg-card rounded-xl border p-4 shadow-sm transition-shadow hover:shadow-md",
        className,
      )}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <AssetTypeBadge type={generation.assetType as AssetStudioType} />
          <AssetStatusBadge status={generation.status} />
        </div>
        <span className="text-muted-foreground text-xs">#{generation.id}</span>
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

      {generation.error && <p className="text-destructive mb-3 text-xs">{generation.error}</p>}

      {children}
    </div>
  );
}
