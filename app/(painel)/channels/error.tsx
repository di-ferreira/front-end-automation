"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function ChannelsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-foreground text-2xl font-semibold tracking-tight">Canais</h1>
      </div>

      <div className="border-border bg-card rounded-xl border p-12 text-center shadow-sm">
        <p className="text-destructive mb-2 text-sm font-medium">Erro ao carregar canais</p>
        <p className="text-muted-foreground mb-4 text-sm">
          {error.message ?? "Ocorreu um erro inesperado."}
        </p>
        <Button variant="outline" size="sm" onClick={reset}>
          Tentar novamente
        </Button>
      </div>
    </section>
  );
}
