import { auth } from "@/auth";
import { signOutAction } from "./actions/auth";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const session = await auth();

  return (
    <div className="bg-background flex flex-1 flex-col">
      <header className="border-border bg-card flex items-center justify-between border-b px-6 py-3">
        <span className="text-foreground text-sm font-semibold">
          Painel de Automação de Vídeos
        </span>
        <div className="flex items-center gap-3">
          <span className="text-muted-foreground text-sm">
            {session?.user?.name ?? session?.user?.email}
          </span>
          <form action={signOutAction}>
            <Button variant="outline" size="sm" type="submit">
              Sair
            </Button>
          </form>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center p-8">
        <div className="border-border bg-card w-full max-w-md rounded-xl border p-8 text-center shadow-sm">
          <span className="inline-block rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
            Fase 1 concluída
          </span>
          <h1 className="text-foreground mt-4 text-2xl font-semibold tracking-tight">
            Bem-vindo{session?.user?.name ? `, ${session.user.name}` : ""}!
          </h1>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            Banco de dados e autenticação configurados. Próxima etapa:
            Biblioteca de Prompts (Fase 2).
          </p>
        </div>
      </main>
    </div>
  );
}
