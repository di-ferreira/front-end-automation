"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils";
import type { ExecutionStatus } from "@/lib/validation";

type FilterValue = "all" | ExecutionStatus;

const FILTERS: { value: FilterValue; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "queued", label: "Na fila" },
  { value: "running", label: "Executando" },
  { value: "completed", label: "Concluído" },
  { value: "failed", label: "Falhou" },
];

interface ExecutionsFilterProps {
  active: FilterValue;
  counts: Record<FilterValue, number>;
}

export function ExecutionsFilter({ active, counts }: ExecutionsFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function setFilter(value: FilterValue) {
    const next = new URLSearchParams(searchParams);
    if (value === "all") {
      next.delete("status");
    } else {
      next.set("status", value);
    }
    router.push(`?${next.toString()}`, { scroll: false });
  }

  return (
    <div className="bg-muted flex flex-wrap gap-1 rounded-lg p-1">
      {FILTERS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => setFilter(option.value)}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
            active === option.value
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {option.label}
          <span className="text-muted-foreground ml-1 text-xs tabular-nums">
            {counts[option.value]}
          </span>
        </button>
      ))}
    </div>
  );
}
