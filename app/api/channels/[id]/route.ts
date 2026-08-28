import { NextResponse } from "next/server";

import { requireSession } from "@/lib/auth";
import { parseJsonBody, JSON_HEADERS } from "@/lib/api";
import { updateChannelSchema } from "@/lib/validation";
import { firstZodMessage } from "@/lib/validation";
import { getChannel, updateChannel, deleteChannel } from "@/db/queries/channels";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  const { error: authError } = await requireSession();
  if (authError) return authError;

  const { id } = await params;
  const channelId = Number(id);
  if (!Number.isInteger(channelId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400, headers: JSON_HEADERS });
  }

  const channel = await getChannel(channelId);
  if (!channel) {
    return NextResponse.json(
      { error: "Canal não encontrado" },
      { status: 404, headers: JSON_HEADERS },
    );
  }

  return NextResponse.json({ channel }, { headers: JSON_HEADERS });
}

export async function PUT(request: Request, { params }: RouteContext) {
  const { error: authError } = await requireSession();
  if (authError) return authError;

  const { id } = await params;
  const channelId = Number(id);
  if (!Number.isInteger(channelId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400, headers: JSON_HEADERS });
  }

  const { body, error: bodyError } = await parseJsonBody(request);
  if (bodyError) return bodyError;

  const parsed = updateChannelSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: firstZodMessage(parsed.error) },
      { status: 400, headers: JSON_HEADERS },
    );
  }

  const channel = await updateChannel(channelId, parsed.data);
  if (!channel) {
    return NextResponse.json(
      { error: "Canal não encontrado" },
      { status: 404, headers: JSON_HEADERS },
    );
  }

  return NextResponse.json({ channel }, { headers: JSON_HEADERS });
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const { error: authError } = await requireSession();
  if (authError) return authError;

  const { id } = await params;
  const channelId = Number(id);
  if (!Number.isInteger(channelId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400, headers: JSON_HEADERS });
  }

  const deleted = await deleteChannel(channelId);
  if (!deleted) {
    return NextResponse.json(
      { error: "Canal não encontrado" },
      { status: 404, headers: JSON_HEADERS },
    );
  }

  return new Response(null, { status: 204 });
}
