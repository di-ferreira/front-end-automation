import { LoadingSpinner } from "@/components/loading-spinner";

export default function ChannelDetailLoading() {
  return (
    <section className="space-y-6">
      <div className="flex items-center gap-2">
        <div className="bg-muted h-4 w-12 animate-pulse rounded" />
        <div className="bg-muted h-4 w-1 animate-pulse rounded-full" />
        <div className="bg-muted h-7 w-40 animate-pulse rounded" />
      </div>

      <div className="bg-card rounded-xl border p-4 shadow-sm">
        <div className="bg-muted mb-3 h-4 w-20 animate-pulse rounded" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i}>
              <div className="bg-muted mb-1 h-3 w-16 animate-pulse rounded" />
              <div className="bg-muted h-4 w-24 animate-pulse rounded" />
            </div>
          ))}
        </div>
      </div>

      <div className="border-border bg-card rounded-xl border p-16 text-center shadow-sm">
        <LoadingSpinner label="Carregando configurações..." />
      </div>
    </section>
  );
}
