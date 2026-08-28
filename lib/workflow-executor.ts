import type { ResolvedWorkflow } from "./workflow-resolver";

export interface WorkflowPayload {
  executionId?: string;
  channelId?: number;
  channelSlug?: string;
  assetType?: string;
  prompt?: string;
  [key: string]: unknown;
}

export interface WorkflowExecutionResult {
  ok: boolean;
  status: number;
  data?: unknown;
  error?: string;
  durationMs: number;
}

/**
 * Executa um workflow via HTTP usando a config resolvida.
 */
export async function executeWorkflow(
  config: ResolvedWorkflow,
  payload: WorkflowPayload,
): Promise<WorkflowExecutionResult> {
  const timeoutMs = config.timeoutMs ?? 10_000;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (config.headers && typeof config.headers === "object") {
    Object.assign(headers, config.headers);
  }

  const startTime = Date.now();

  try {
    const response = await fetch(config.webhookUrl, {
      method: config.method || "POST",
      headers,
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(timeoutMs),
    });

    const durationMs = Date.now() - startTime;

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        error: `Webhook respondeu ${response.status}`,
        durationMs,
      };
    }

    let data: unknown;
    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    return { ok: true, status: response.status, data, durationMs };
  } catch (error) {
    const durationMs = Date.now() - startTime;

    if (error instanceof DOMException && error.name === "TimeoutError") {
      return {
        ok: false,
        status: 0,
        error: `Timeout após ${timeoutMs}ms`,
        durationMs,
      };
    }

    return {
      ok: false,
      status: 0,
      error:
        error instanceof Error
          ? `Falha ao chamar webhook: ${error.message}`
          : "Falha ao chamar webhook",
      durationMs,
    };
  }
}
