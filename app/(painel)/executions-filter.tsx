"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { FilterTabs } from "@/components/filter-tabs";
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
    <FilterTabs
      options={FILTERS.map((option) => ({
        ...option,
        count: counts[option.value],
      }))}
      active={active}
      onChange={setFilter}
    />
  );
}
