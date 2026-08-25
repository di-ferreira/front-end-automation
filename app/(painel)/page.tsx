import Link from "next/link";

import { auth } from "@/auth";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const session = await auth();

  return (
    <section className="flex flex-1 items-center justify-center">
      <div className="border-border bg-card w-full max-w-md rounded-xl border p-8 text-center shadow-sm">
        <span className="inline-block rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
          Fase 2 concluída
        </span>
        <h1 className="text-foreground mt-4 text-2xl font-semibold tracking-tight">
          Bem-vindo{session?.user?.name ? `, ${session.user.name}` : ""}!
        </h1>
        <p className="text-muted-foreground mt-2 text-sm leading-6">
          Biblioteca de prompts pronta. Próxima etapa: Disparo da Automação
          (Fase 3).
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button render={<Link href="/prompts" />}>
            Gerenciar prompts
          </Button>
        </div>
      </div>
    </section>
  );
}
