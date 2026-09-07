import { useEffect, useRef, useState } from "react";

export function usePolling<T>(
  fetchUrl: string,
  intervalMs: number,
  condition: boolean = true,
): { data: T | null; error: string | null; isLoading: boolean } {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (!condition || !fetchUrl) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      return;
    }

    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch(fetchUrl);
        if (!cancelled && mountedRef.current) {
          const result: T = await res.json();
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (!cancelled && mountedRef.current) {
          setError(err instanceof Error ? err.message : "Erro ao buscar dados");
        }
      }

      if (!cancelled && mountedRef.current) {
        timeoutRef.current = setTimeout(() => poll(), intervalMs);
      }
    }

    poll();

    return () => {
      cancelled = true;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [condition, fetchUrl, intervalMs]);

  const isLoading = condition && !data && !error;

  return { data, error, isLoading };
}
