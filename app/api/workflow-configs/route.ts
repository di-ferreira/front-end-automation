import { NextResponse } from "next/server";

import { requireSession } from "@/lib/auth";
import { parseJsonBody, JSON_HEADERS } from "@/lib/api";
import { workflowConfigSchema } from "@/lib/validation";
import { firstZodMessage } from "@/lib/validation";
import {
  listWorkflowConfigs,
  createWorkflowConfig,
  getWorkflowConfigBySlug,
  getWorkflowConfigByChannelAndType,
} from "@/db/queries/workflow-configs";

export async function GET() {
  const { error: authError } = await requireSession();
  if (authError) return authError;

  const configs = await listWorkflowConfigs();
  return NextResponse.json({ configs }, { headers: JSON_HEADERS });
}

export async function POST(request: Request) {
  const { error: authError } = await requireSession();
  if (authError) return authError;

  const { body, error: bodyError } = await parseJsonBody(request);
  if (bodyError) return bodyError;

  const parsed = workflowConfigSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: firstZodMessage(parsed.error) },
      { status: 400, headers: JSON_HEADERS },
    );
  }

  const existing = await getWorkflowConfigBySlug(parsed.data.slug);
  if (existing) {
    return NextResponse.json(
      { error: "Já existe uma configuração com este slug" },
      { status: 409, headers: JSON_HEADERS },
    );
  }

  const existingChannelType = await getWorkflowConfigByChannelAndType(
    parsed.data.channelId,
    parsed.data.assetType,
  );
  if (existingChannelType) {
    return NextResponse.json(
      { error: "Já existe um workflow para este canal e tipo de asset" },
      { status: 409, headers: JSON_HEADERS },
    );
  }

  const config = await createWorkflowConfig(parsed.data);
  return NextResponse.json({ config }, { status: 201, headers: JSON_HEADERS });
}
