import { NextResponse } from "next/server";

import { requireSession } from "@/lib/auth";
import { JSON_HEADERS } from "@/lib/api";
import { getGenerationDetail } from "@/db/queries/asset-generations";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  const { error: authError } = await requireSession();
  if (authError) return authError;

  const { id } = await context.params;
  const generationId = Number(id);
  if (!Number.isInteger(generationId) || generationId <= 0) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400, headers: JSON_HEADERS });
  }

  const detail = await getGenerationDetail(generationId);
  if (!detail) {
    return NextResponse.json(
      { error: "Geração não encontrada" },
      { status: 404, headers: JSON_HEADERS },
    );
  }

  return NextResponse.json({ generation: detail }, { headers: JSON_HEADERS });
}
