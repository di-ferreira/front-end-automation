export default function ExecutionDetailLoading() {
  return (
    <section className="space-y-6" role="status" aria-busy="true">
      <div className="space-y-3">
        <div className="bg-muted h-5 w-20 animate-pulse rounded-md" />
        <div className="bg-muted h-7 w-72 animate-pulse rounded-lg" />
        <div className="bg-muted h-4 w-96 animate-pulse rounded-md" />
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="bg-muted h-8 w-28 animate-pulse rounded-full" />
        <div className="bg-muted h-8 w-36 animate-pulse rounded-full" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="border-border bg-card aspect-video animate-pulse rounded-xl border"
          />
        ))}
      </div>

      <span className="sr-only">Carregando detalhes da execucao...</span>
    </section>
  );
}
