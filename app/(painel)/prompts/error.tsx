"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function PromptsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Erro na biblioteca de prompts:", error);
  }, [error]);

  return (
    <section className="flex flex-1 items-center justify-center p-8">
      <div className="border-border bg-card w-full max-w-md rounded-xl border p-8 text-center shadow-sm">
        <h1 className="text-destructive text-lg font-semibold">Erro ao carregar prompts</h1>
        <p className="text-muted-foreground mt-2 text-sm leading-6">
          Nao foi possivel carregar a biblioteca de prompts. Tente novamente.
          {error.digest ? (
            <span className="text-muted-foreground/70 mt-1 block text-xs">
              Referencia: {error.digest}
            </span>
          ) : null}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button variant="outline" onClick={() => window.history.back()}>
            Voltar
          </Button>
          <Button onClick={reset}>Tentar novamente</Button>
        </div>
      </div>
    </section>
  );
}
