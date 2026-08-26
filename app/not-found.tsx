import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="bg-background flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <span className="text-muted-foreground/70 font-mono text-sm">404</span>
      <h1 className="text-foreground text-2xl font-semibold tracking-tight">
        Página não encontrada
      </h1>
      <p className="text-muted-foreground max-w-sm text-sm leading-6">
        A página que você procura não existe, foi movida ou o recurso não está
        mais disponível.
      </p>
      <Link href="/" className={buttonVariants({ variant: "default" })}>
        Voltar ao painel
      </Link>
    </main>
  );
}
