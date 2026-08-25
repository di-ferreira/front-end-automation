"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { Input } from "@/components/ui/input";
import {
  PROMPT_TYPES,
  PROMPT_TYPE_LABELS,
} from "@/lib/validation";

export function PromptFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentQ = searchParams.get("q") ?? "";
  const currentType = searchParams.get("type") ?? "";

  // Estado local sobrepõe a URL enquanto o usuário digita; null volta a ler da URL
  const [qDraft, setQDraft] = useState<string | null>(null);
  const q = qDraft ?? currentQ;

  function applyFilters(nextQ: string, nextType: string) {
    const params = new URLSearchParams();
    if (nextQ.trim()) params.set("q", nextQ.trim());
    if (nextType) params.set("type", nextType);
    const query = params.toString();
    setQDraft(null);
    router.replace(query ? `/prompts?${query}` : "/prompts");
  }

  return (
    <form
      className="flex flex-col gap-2 sm:flex-row sm:items-center"
      onSubmit={(event) => {
        event.preventDefault();
        applyFilters(q, currentType);
      }}
    >
      <Input
        type="search"
        placeholder="Buscar por nome, conteúdo ou tags..."
        value={q}
        onChange={(event) => setQDraft(event.target.value)}
        className="sm:w-80"
      />
      <select
        aria-label="Filtrar por tipo"
        className="border-border bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-9 rounded-lg border px-3 text-sm transition-colors outline-none focus-visible:ring-3"
        value={currentType}
        onChange={(event) => applyFilters(q, event.target.value)}
      >
        <option value="">Todos os tipos</option>
        {PROMPT_TYPES.map((type) => (
          <option key={type} value={type}>
            {PROMPT_TYPE_LABELS[type]}
          </option>
        ))}
      </select>
    </form>
  );
}
