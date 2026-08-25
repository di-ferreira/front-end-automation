import * as React from "react";

import { cn } from "@/lib/utils";

function Label({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"label">) {
  return (
    <label
      data-slot="label"
      className={cn(
        "text-foreground text-sm leading-none font-medium select-none peer-disabled:pointer-events-none peer-disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Label };
