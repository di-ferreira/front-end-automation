import {
  getExecution,
  markExecutionCompleted,
  markExecutionFailed,
} from "@/db/queries/executions";
import { replaceExecutionAssets } from "@/db/queries/assets";
import { collectAssetsFromDisk, sanitizeAssetPath } from "@/lib/assets";
import {
  executionCallbackSchema,
  firstZodMessage,
} from "@/lib/validation";

type RouteContext = { params: Promise<{ id: string }> };

function extractSecret(request: Request): string {
  const header = request.headers.get("x-callback-secret");
  if (header) return header.trim();
  const auth = request.headers.get("authorization");
  if (auth) return auth.replace(/^Bearer\s+/i, "").trim();
  return "";
}

export async function POST(request: Request, context: RouteContext) {
  // Autenticação por segredo compartilhado (rota isenta de sessão no proxy)
  const expected = process.env.N8N_CALLBACK_SECRET?.trim() ?? "";
  if (expected.length === 0 || extractSecret(request) !== expected) {
    return Response.json({ error: "Segredo inválido" }, { status: 401 });
  }

  const { id } = await context.params;
  const execution = await getExecution(id);
  if (!execution) {
    return Response.json(
      { error: "Execução não encontrada" },
      { status: 404 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = executionCallbackSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: firstZodMessage(parsed.error) },
      { status: 400 },
    );
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
        process.env.OUTPUT_DIR?.trim() || "./output",
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
