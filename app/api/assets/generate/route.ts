import { NextResponse } from "next/server";

import { requireSession } from "@/lib/auth";
import { parseJsonBody, JSON_HEADERS } from "@/lib/api";
import { generateAssetSchema } from "@/lib/validation";
import { generateAsset } from "@/lib/use-cases/generate-asset";
import { WorkflowNotFoundError } from "@/lib/errors";

export async function POST(request: Request) {
  const { error: authError } = await requireSession();
  if (authError) return authError;

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
    const result = await generateAsset(parsed.data);
    return NextResponse.json(result, { headers: JSON_HEADERS });
  } catch (err) {
    if (err instanceof WorkflowNotFoundError) {
      return NextResponse.json({ error: err.message }, { status: 404, headers: JSON_HEADERS });
    }
    const message = err instanceof Error ? err.message : "Erro ao gerar asset";
    return NextResponse.json({ error: message }, { status: 500, headers: JSON_HEADERS });
  }
}
