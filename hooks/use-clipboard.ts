"use client";

import { useCallback, useRef, useState } from "react";

interface UseClipboardOptions {
  timeout?: number;
}

export function useClipboard(options?: UseClipboardOptions) {
  const timeout = options?.timeout ?? 2000;
  const [copied, setCopied] = useState<"path" | "text" | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  const copy = useCallback(
    async (value: string, kind: "path" | "text") => {
      try {
        await navigator.clipboard.writeText(value);
        setCopied(kind);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setCopied(null), timeout);
      } catch {
        // clipboard indisponivel (ex.: HTTP nao seguro)
      }
    },
    [timeout],
  );

  return { copied, copy };
}
