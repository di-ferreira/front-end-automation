export default function PainelLoading() {
  return (
    <div className="space-y-6" role="status" aria-busy="true">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="bg-muted h-7 w-64 animate-pulse rounded-lg" />
          <div className="bg-muted h-4 w-80 animate-pulse rounded-lg" />
        </div>
        <div className="bg-muted h-9 w-36 animate-pulse rounded-lg" />
      </div>

      <div className="bg-muted h-10 w-full max-w-md animate-pulse rounded-lg" />

      <ul className="space-y-3">
        {[0, 1, 2].map((index) => (
          <li
            key={index}
            className="border-border bg-card rounded-xl border p-4 shadow-sm"
          >
            <div className="flex items-center gap-2">
              <div className="bg-muted size-6 animate-pulse rounded-full" />
              <div className="bg-muted h-5 w-56 animate-pulse rounded-md" />
            </div>
            <div className="bg-muted mt-3 h-4 w-full max-w-lg animate-pulse rounded-md" />
          </li>
        ))}
      </ul>

      <span className="sr-only">Carregando...</span>
    </div>
  );
}
