"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

interface UseDialogFormOptions {
  onSuccess?: () => void;
}

export function useDialogForm(options?: UseDialogFormOptions) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpenChange = useCallback((nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) setError(null);
  }, []);

  const handleSubmit = useCallback(
    async (
      formData: FormData,
      fetchFn: (formData: FormData) => Promise<Response>,
      errorMessage?: string,
    ) => {
      setPending(true);
      setError(null);
      try {
        const response = await fetchFn(formData);

        if (response.ok) {
          setOpen(false);
          router.refresh();
          options?.onSuccess?.();
          return;
        }

        const data = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        setError(data.error ?? errorMessage ?? "Nao foi possivel salvar.");
      } catch {
        setError("Falha de conexao. Tente novamente.");
      } finally {
        setPending(false);
      }
    },
    [router, options],
  );

  return {
    open,
    setOpen,
    pending,
    error,
    setError,
    handleOpenChange,
    handleSubmit,
  };
}
