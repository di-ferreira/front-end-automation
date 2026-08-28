import { LoadingSpinner } from "@/components/loading-spinner";

export default function ChannelsLoading() {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="bg-muted h-8 w-32 animate-pulse rounded" />
          <div className="bg-muted mt-1 h-4 w-64 animate-pulse rounded" />
        </div>
        <div className="bg-muted h-9 w-24 animate-pulse rounded-lg" />
      </div>

      <div className="border-border bg-card rounded-xl border p-16 text-center shadow-sm">
        <LoadingSpinner label="Carregando canais..." />
      </div>
    </section>
  );
}
