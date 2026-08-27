export default function PromptsLoading() {
  return (
    <section className="space-y-6" role="status" aria-busy="true">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="bg-muted h-7 w-56 animate-pulse rounded-lg" />
          <div className="bg-muted h-4 w-72 animate-pulse rounded-lg" />
        </div>
        <div className="bg-muted h-9 w-32 animate-pulse rounded-lg" />
      </div>

      <div className="bg-muted h-10 w-full max-w-md animate-pulse rounded-lg" />

      <div className="border-border bg-card overflow-hidden rounded-xl border shadow-sm">
        <div className="bg-muted/50 border-border h-12 border-b" />
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="border-border flex items-center gap-4 border-b px-4 py-3 last:border-b-0"
          >
            <div className="bg-muted h-4 w-32 animate-pulse rounded" />
            <div className="bg-muted h-5 w-16 animate-pulse rounded-full" />
            <div className="bg-muted hidden h-4 flex-1 animate-pulse rounded md:block" />
            <div className="bg-muted hidden h-4 w-12 animate-pulse rounded sm:block" />
            <div className="bg-muted h-6 w-14 animate-pulse rounded" />
          </div>
        ))}
      </div>

      <span className="sr-only">Carregando prompts...</span>
    </section>
  );
}
