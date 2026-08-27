import { getExecution, markExecutionCompleted, markExecutionFailed } from "@/db/queries/executions";
import { replaceExecutionAssets } from "@/db/queries/assets";
import { collectAssetsFromDisk, sanitizeAssetPath, DEFAULT_OUTPUT_DIR } from "@/lib/assets";
import { executionCallbackSchema, firstZodMessage } from "@/lib/validation";
import { requireSecret } from "@/lib/auth";
import { parseJsonBody } from "@/lib/api";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const secretError = requireSecret(request);
  if (secretError) return secretError;

  const { id } = await context.params;
  const execution = await getExecution(id);
  if (!execution) {
    return Response.json({ error: "Execução não encontrada" }, { status: 404 });
  }

  const { body, error: parseError } = await parseJsonBody(request);
  if (parseError) return parseError;

  const parsed = executionCallbackSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: firstZodMessage(parsed.error) }, { status: 400 });
  }
  const payload = parsed.data;

  if (payload.status === "failed") {
    await markExecutionFailed(execution.id, payload.error ?? "Falha no N8N");
    return Response.json({ ok: true, status: "failed" });
  }

  // Assets: lista explícita no payload OU varredura de OUTPUT_DIR/{id}
  const collected = payload.assets
    ? payload.assets.map((asset) => ({
        type: asset.type,
        filePath: sanitizeAssetPath(execution.id, asset.filePath),
        mimeType: asset.mimeType,
        sizeBytes: asset.sizeBytes,
      }))
    : await collectAssetsFromDisk(
        process.env.OUTPUT_DIR?.trim() || DEFAULT_OUTPUT_DIR,
        execution.id,
      );

  if (collected.some((asset) => asset.filePath === null)) {
    return Response.json(
      { error: "Caminho de asset inválido (escapa da pasta da execução)" },
      { status: 400 },
    );
  }

  await replaceExecutionAssets(
    execution.id,
    collected.filter((asset): asset is typeof asset & { filePath: string } =>
      Boolean(asset.filePath),
    ),
  );

  await markExecutionCompleted(execution.id);
  return Response.json({
    ok: true,
    status: "completed",
    assets: collected.length,
  });
}
