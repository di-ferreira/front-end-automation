import type { ApprovalStatus, ExecutionStatus, PromptType } from "@/lib/validation";

export const PROMPT_TYPE_BADGE_CLASSES: Record<PromptType, string> = {
  musica: "border-purple-200 bg-purple-50 text-purple-700",
  imagem: "border-sky-200 bg-sky-50 text-sky-700",
  descricao: "border-amber-200 bg-amber-50 text-amber-700",
  video: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

export const EXECUTION_STATUS_BADGE_CLASSES: Record<ExecutionStatus, string> = {
  queued: "border-amber-200 bg-amber-50 text-amber-700",
  running: "border-sky-200 bg-sky-50 text-sky-700",
  completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
  failed: "border-red-200 bg-red-50 text-red-700",
};

export const APPROVAL_STATUS_BADGE_CLASSES: Record<ApprovalStatus, string> = {
  pending: "border-amber-200 bg-amber-50 text-amber-700",
  approved: "border-emerald-200 bg-emerald-50 text-emerald-700",
  rejected: "border-red-200 bg-red-50 text-red-700",
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

export function fileUrl(filePath: string, download = false): string {
  const encoded = filePath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  return download ? `/api/files/${encoded}?download=1` : `/api/files/${encoded}`;
}

export function formatBytes(bytes: number | null | undefined): string {
  if (!bytes && bytes !== 0) return "";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }
  return `${value.toFixed(value >= 10 || unit === 0 ? 0 : 1)} ${units[unit]}`;
}

export function formatDecision(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function fileName(filePath: string): string {
  return filePath.split("/").pop() ?? "";
}

export function relativePath(filePath: string): string {
  return filePath.split("/").slice(1).join("/") || filePath;
}
