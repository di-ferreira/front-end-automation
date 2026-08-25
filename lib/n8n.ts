export interface N8NDispatchResult {
  ok: boolean;
  error?: string;
}

/**
 * Dispara o workflow N8N com o contrato { executionId, prompt }.
 * O webhook deve responder imediatamente (respond: immediately).
 */
export async function triggerN8N(
  executionId: string,
  prompt: string,
): Promise<N8NDispatchResult> {
  const url = process.env.N8N_WEBHOOK_URL?.trim();
  if (!url) {
    return { ok: false, error: "N8N_WEBHOOK_URL não configurada" };
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const apiKey = process.env.N8N_API_KEY?.trim();
  if (apiKey) {
    headers.Authorization = `Bearer ${apiKey}`;
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({ executionId, prompt }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) {
      return {
        ok: false,
        error: `Webhook N8N respondeu ${response.status}`,
      };
    }
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? `Falha ao chamar o webhook N8N: ${error.message}`
          : "Falha ao chamar o webhook N8N",
    };
  }
}
