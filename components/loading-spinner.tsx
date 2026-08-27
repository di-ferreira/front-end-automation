import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  label?: string;
  className?: string;
}

export function LoadingSpinner({ label, className }: LoadingSpinnerProps) {
  return (
    <span
      role="status"
      aria-busy="true"
      className={cn("inline-flex items-center gap-2 text-sm", className)}
    >
      <Loader2 className="size-4 animate-spin" />
      {label ? <span>{label}</span> : null}
    </span>
  );
}
