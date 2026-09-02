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

function normalizeWebhookUrl(url: string): string {
  // Dentro do container, localhost/127.0.0.1 apontam para o próprio app, não para o N8N.
  // Reescreve automaticamente para o host Docker 'n8n' e loga aviso para rastreio.
  if (typeof url !== "string") return url;
  const normalized = url
    .replace(/^http:\/\/localhost:5678/i, "http://n8n:5678")
    .replace(/^http:\/\/127\.0\.0\.1:5678/i, "http://n8n:5678");
  if (normalized !== url) {
    console.warn(`[workflow-executor] webhookUrl normalizado: ${url} -> ${normalized}`);
  }
  return normalized;
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

  const webhookUrl = normalizeWebhookUrl(config.webhookUrl);
  const startTime = Date.now();

  try {
    const response = await fetch(webhookUrl, {
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
