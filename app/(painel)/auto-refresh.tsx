"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface AutoRefreshProps {
  /** Ativa o polling apenas quando há execuções em andamento. */
  active: boolean;
  intervalMs?: number;
}

/**
 * Polling de fallback: recarrega os dados do servidor (RSC) periodicamente
 * enquanto houver execuções na fila/executando.
 */
export function AutoRefresh({ active, intervalMs = 5000 }: AutoRefreshProps) {
  const router = useRouter();

  useEffect(() => {
    if (!active) return;
    const timer = setInterval(() => router.refresh(), intervalMs);
    return () => clearInterval(timer);
  }, [active, intervalMs, router]);

  if (!active) return null;

  return (
    <p
      className="text-muted-foreground flex items-center gap-2 text-xs"
      role="status"
    >
      <span className="border-sky-200 bg-sky-50 inline-block size-2 animate-pulse rounded-full border" />
      Atualizando automaticamente enquanto houver execuções ativas...
    </p>
  );
}
