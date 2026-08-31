import { NextResponse } from "next/server";

import { requireSession } from "@/lib/auth";
import { JSON_HEADERS } from "@/lib/api";
import { listExecutionsByConfig } from "@/db/queries/workflow-executions";

export async function GET(request: Request) {
  const { error: authError } = await requireSession();
  if (authError) return authError;

  const { searchParams } = new URL(request.url);
  const configId = searchParams.get("configId");

  if (!configId) {
    return NextResponse.json(
      { error: "configId é obrigatório" },
      { status: 400, headers: JSON_HEADERS },
    );
  }

  const configIdNum = Number(configId);
  if (!Number.isInteger(configIdNum) || configIdNum <= 0) {
    return NextResponse.json(
      { error: "configId inválido" },
      { status: 400, headers: JSON_HEADERS },
    );
  }

  const executions = await listExecutionsByConfig(configIdNum);
  return NextResponse.json({ executions }, { headers: JSON_HEADERS });
}
