import type { ExecutionStatus, PromptType } from "@/lib/validation";

export const PROMPT_TYPE_BADGE_CLASSES: Record<PromptType, string> = {
  musica: "border-purple-200 bg-purple-50 text-purple-700",
  imagem: "border-sky-200 bg-sky-50 text-sky-700",
  descricao: "border-amber-200 bg-amber-50 text-amber-700",
  video: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

export const EXECUTION_STATUS_BADGE_CLASSES: Record<ExecutionStatus, string> =
  {
    queued: "border-amber-200 bg-amber-50 text-amber-700",
    running: "border-sky-200 bg-sky-50 text-sky-700",
    completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
    failed: "border-red-200 bg-red-50 text-red-700",
  };

/** Formata datas como "12 ago 2026, 14:30" no fuso local. */
export function formatDateTime(date: Date | null | undefined): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function parseTags(tags: string | null | undefined): string[] {
  if (!tags) return [];
  return tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}
