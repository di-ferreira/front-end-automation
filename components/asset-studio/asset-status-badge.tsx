import { cn } from "@/lib/utils";
import type { GenerationStatus, AssetStudioType } from "@/lib/validation";
import { GENERATION_STATUS_LABELS, ASSET_STUDIO_TYPE_LABELS } from "@/lib/validation";
import { GENERATION_STATUS_BADGE_CLASSES, ASSET_STUDIO_TYPE_BADGE_CLASSES } from "@/lib/format";

interface AssetStatusBadgeProps {
  status: GenerationStatus;
  className?: string;
}

export function AssetStatusBadge({ status, className }: AssetStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        GENERATION_STATUS_BADGE_CLASSES[status],
        className,
      )}
    >
      {GENERATION_STATUS_LABELS[status]}
    </span>
  );
}

interface AssetTypeBadgeProps {
  type: AssetStudioType;
  className?: string;
}

export function AssetTypeBadge({ type, className }: AssetTypeBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        ASSET_STUDIO_TYPE_BADGE_CLASSES[type],
        className,
      )}
    >
      {ASSET_STUDIO_TYPE_LABELS[type]}
    </span>
  );
}
