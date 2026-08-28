import { getChannel } from "@/db/queries/channels";
import { createGeneration, updateGeneration } from "@/db/queries/asset-generations";
import { createExecution, updateExecution } from "@/db/queries/workflow-executions";
import { resolveWorkflow } from "@/lib/workflow-resolver";
import { executeWorkflow } from "@/lib/workflow-executor";
import { WorkflowNotFoundError } from "@/lib/errors";
import { generateAssetSchema, type GenerateAssetInput } from "@/lib/validation";

export interface GenerateAssetResult {
  generationId: number;
  status: "completed" | "failed";
  filePath?: string;
  error?: string;
  durationMs: number;
}

/**
 * Caso de uso unificado de geração de asset individual.
 *
 * 1. Valida input
 * 2. Verifica se o canal existe
 * 3. Resolve workflow (DB ou fallback env)
 * 4. Cria asset_generation (status: generating)
 * 5. Executa webhook
 * 6. Registra workflow_execution
 * 7. Atualiza asset_generation (completed/failed)
 * 8. Retorna resultado
 */
export async function generateAsset(input: GenerateAssetInput): Promise<GenerateAssetResult> {
  const parsed = generateAssetSchema.parse(input);

  const channel = await getChannel(parsed.channelId);
  if (!channel) {
    throw new Error("Canal não encontrado");
  }

  const workflow = await resolveWorkflow(parsed.channelId, parsed.assetType);
  if (!workflow) {
    throw new WorkflowNotFoundError(parsed.channelId, parsed.assetType);
  }

  const generation = await createGeneration({
    channelId: parsed.channelId,
    assetType: parsed.assetType,
    promptText: parsed.promptText ?? null,
    status: "generating",
    workflowConfigId: workflow.id || null,
  });

  const payload = {
    executionId: `asset-${generation.id}`,
    channelId: parsed.channelId,
    channelSlug: channel.slug,
    assetType: parsed.assetType,
    prompt: parsed.promptText,
  };

  const workflowExec = await createExecution({
    workflowConfigId: workflow.id || 0,
    assetGenerationId: generation.id,
    status: "running",
    requestPayload: JSON.stringify(payload),
    startedAt: new Date(),
  });

  const result = await executeWorkflow(workflow, payload);

  await updateExecution(workflowExec.id, {
    status: result.ok ? "success" : "failed",
    responsePayload: result.data ? JSON.stringify(result.data) : null,
    error: result.error ?? null,
    completedAt: new Date(),
    durationMs: result.durationMs,
  });

  if (result.ok) {
    const data = result.data as Record<string, unknown> | undefined;
    const filePath = data?.filePath as string | undefined;

    await updateGeneration(generation.id, {
      status: "completed",
      filePath: filePath ?? null,
    });

    return {
      generationId: generation.id,
      status: "completed",
      filePath,
      durationMs: result.durationMs,
    };
  }

  await updateGeneration(generation.id, {
    status: "failed",
    error: result.error,
  });

  return {
    generationId: generation.id,
    status: "failed",
    error: result.error,
    durationMs: result.durationMs,
  };
}
