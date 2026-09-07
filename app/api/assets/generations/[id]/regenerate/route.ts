import { NextResponse } from "next/server";

import { requireSession } from "@/lib/auth";
import { parseJsonBody, JSON_HEADERS } from "@/lib/api";
import { generateAssetSchema } from "@/lib/validation";
import { generateAsset } from "@/lib/use-cases/generate-asset";
import { WorkflowNotFoundError } from "@/lib/errors";
import { getGeneration } from "@/db/queries/asset-generations";
import type { AssetStudioType } from "@/lib/validation";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const { error: authError } = await requireSession();
  if (authError) return authError;

  const { id } = await context.params;
  const generationId = Number(id);

  const existing = await getGeneration(generationId);
  if (!existing) {
    return NextResponse.json(
      { error: "Geração não encontrada" },
      { status: 404, headers: JSON_HEADERS },
    );
  }

  if (existing.status === "generating") {
    return NextResponse.json(
      { error: "Geração já está em andamento" },
      { status: 409, headers: JSON_HEADERS },
    );
  }

  const { body, error: bodyError } = await parseJsonBody(request);
  if (bodyError) return bodyError;

  const parsed = generateAssetSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dados inválidos" },
      { status: 400, headers: JSON_HEADERS },
    );
  }

  try {
    const result = await generateAsset({
      channelId: existing.channelId,
      assetType: existing.assetType as AssetStudioType,
      promptText: parsed.data.promptText,
    });
    return NextResponse.json(result, { headers: JSON_HEADERS });
  } catch (err) {
    if (err instanceof WorkflowNotFoundError) {
      return NextResponse.json({ error: err.message }, { status: 404, headers: JSON_HEADERS });
    }
    const message = err instanceof Error ? err.message : "Erro ao regenerar asset";
    return NextResponse.json({ error: message }, { status: 500, headers: JSON_HEADERS });
  }
}
