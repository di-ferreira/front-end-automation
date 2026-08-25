export default function Home() {
  return (
    <div className="bg-background flex flex-1 items-center justify-center font-sans">
      <main className="border-border bg-card w-full max-w-md rounded-xl border p-8 text-center shadow-sm">
        <span className="inline-block rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
          Fase 0 concluída
        </span>
        <h1 className="text-foreground mt-4 text-2xl font-semibold tracking-tight">
          Painel de Automação de Vídeos
        </h1>
        <p className="text-muted-foreground mt-2 text-sm leading-6">
          Fundação pronta: Next.js + Tailwind + shadcn/ui rodando em Docker, conectado à rede{" "}
          <code className="bg-muted rounded px-1 py-0.5 font-mono text-xs">infra_default</code> com
          volume compartilhado em{" "}
          <code className="bg-muted rounded px-1 py-0.5 font-mono text-xs">/app/output</code>.
        </p>
        <p className="text-muted-foreground/70 mt-6 text-xs">
          Próxima etapa: Banco de Dados e Autenticação (Fase 1)
        </p>
      </main>
    </div>
  );
}
