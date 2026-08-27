"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PROMPT_TYPES, PROMPT_TYPE_LABELS } from "@/lib/validation";

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
        placeholder="Buscar por nome, conteudo ou tags..."
        aria-label="Buscar prompts"
        value={q}
        onChange={(event) => setQDraft(event.target.value)}
        className="sm:w-80"
      />
      <Select value={currentType} onValueChange={(value) => applyFilters(q, value ?? "")}>
        <SelectTrigger aria-label="Filtrar por tipo" className="w-auto">
          <SelectValue placeholder="Todos os tipos" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Todos os tipos</SelectItem>
          {PROMPT_TYPES.map((type) => (
            <SelectItem key={type} value={type}>
              {PROMPT_TYPE_LABELS[type]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </form>
  );
}
