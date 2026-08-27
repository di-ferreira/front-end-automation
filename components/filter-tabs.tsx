import { cn } from "@/lib/utils";

export interface FilterTab<T extends string> {
  value: T;
  label: string;
  count?: number;
}

interface FilterTabsProps<T extends string> {
  options: FilterTab<T>[];
  active: T;
  onChange: (value: T) => void;
}

export function FilterTabs<T extends string>({ options, active, onChange }: FilterTabsProps<T>) {
  return (
    <div className="bg-muted flex flex-wrap gap-1 rounded-lg p-1">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            "focus-visible:ring-ring/50 rounded-md px-3 py-1.5 text-sm font-medium transition-all outline-none focus-visible:ring-3",
            active === option.value
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {option.label}
          {option.count !== undefined ? (
            <span className="text-muted-foreground ml-1 text-xs tabular-nums">{option.count}</span>
          ) : null}
        </button>
      ))}
    </div>
  );
}
