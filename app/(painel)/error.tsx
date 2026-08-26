"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function PainelError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Erro no painel:", error);
  }, [error]);

  return (
    <section className="flex flex-1 items-center justify-center p-8">
      <div className="border-border bg-card w-full max-w-md rounded-xl border p-8 text-center shadow-sm">
        <h1 className="text-destructive text-lg font-semibold">
          Algo deu errado
        </h1>
        <p className="text-muted-foreground mt-2 text-sm leading-6">
          Ocorreu um erro inesperado ao carregar esta página. Tente novamente.
          {error.digest ? (
            <span className="text-muted-foreground/70 mt-1 block text-xs">
              Referência: {error.digest}
            </span>
          ) : null}
        </p>
        <Button className="mt-6" onClick={reset}>
          Tentar novamente
        </Button>
      </div>
    </section>
  );
}
