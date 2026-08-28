import { formatDateTime } from "@/lib/format";
import { AssetStatusBadge } from "./asset-status-badge";
import type { GenerationStatus } from "@/lib/validation";

interface GenerationHistoryItem {
  id: number;
  assetType: string;
  status: GenerationStatus;
  channelName: string;
  createdAt: Date;
  error: string | null;
}

interface AssetHistoryListProps {
  items: GenerationHistoryItem[];
  onSelect?: (id: number) => void;
  emptyMessage?: string;
}

export function AssetHistoryList({
  items,
  onSelect,
  emptyMessage = "Nenhuma geração encontrada.",
}: AssetHistoryListProps) {
  if (items.length === 0) {
    return <p className="text-muted-foreground py-8 text-center text-sm">{emptyMessage}</p>;
  }

  return (
    <ul className="space-y-2" role="list">
      {items.map((item) => (
        <li key={item.id}>
          <button
            type="button"
            onClick={() => onSelect?.(item.id)}
            className="border-border bg-card hover:bg-muted flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition-colors"
          >
            <div className="flex items-center gap-2">
              <AssetStatusBadge status={item.status} />
              <span className="text-foreground font-medium">{item.channelName}</span>
            </div>
            <span className="text-muted-foreground text-xs">{formatDateTime(item.createdAt)}</span>
          </button>
          {item.error && <p className="text-destructive mt-1 text-xs">{item.error}</p>}
        </li>
      ))}
    </ul>
  );
}
