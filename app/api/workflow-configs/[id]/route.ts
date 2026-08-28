import { NextResponse } from "next/server";

import { requireSession } from "@/lib/auth";
import { parseJsonBody, JSON_HEADERS } from "@/lib/api";
import { updateWorkflowConfigSchema } from "@/lib/validation";
import { firstZodMessage } from "@/lib/validation";
import {
  getWorkflowConfig,
  updateWorkflowConfig,
  deleteWorkflowConfig,
} from "@/db/queries/workflow-configs";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  const { error: authError } = await requireSession();
  if (authError) return authError;

  const { id } = await params;
  const configId = Number(id);
  if (!Number.isInteger(configId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400, headers: JSON_HEADERS });
  }

  const config = await getWorkflowConfig(configId);
  if (!config) {
    return NextResponse.json(
      { error: "Configuração não encontrada" },
      { status: 404, headers: JSON_HEADERS },
    );
  }

  return NextResponse.json({ config }, { headers: JSON_HEADERS });
}

export async function PUT(request: Request, { params }: RouteContext) {
  const { error: authError } = await requireSession();
  if (authError) return authError;

  const { id } = await params;
  const configId = Number(id);
  if (!Number.isInteger(configId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400, headers: JSON_HEADERS });
  }

  const { body, error: bodyError } = await parseJsonBody(request);
  if (bodyError) return bodyError;

  const parsed = updateWorkflowConfigSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: firstZodMessage(parsed.error) },
      { status: 400, headers: JSON_HEADERS },
    );
  }

  const config = await updateWorkflowConfig(configId, parsed.data);
  if (!config) {
    return NextResponse.json(
      { error: "Configuração não encontrada" },
      { status: 404, headers: JSON_HEADERS },
    );
  }

  return NextResponse.json({ config }, { headers: JSON_HEADERS });
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const { error: authError } = await requireSession();
  if (authError) return authError;

  const { id } = await params;
  const configId = Number(id);
  if (!Number.isInteger(configId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400, headers: JSON_HEADERS });
  }

  const deleted = await deleteWorkflowConfig(configId);
  if (!deleted) {
    return NextResponse.json(
      { error: "Configuração não encontrada" },
      { status: 404, headers: JSON_HEADERS },
    );
  }

  return new Response(null, { status: 204 });
}
