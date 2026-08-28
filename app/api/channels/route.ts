import { NextResponse } from "next/server";

import { requireSession } from "@/lib/auth";
import { parseJsonBody, JSON_HEADERS } from "@/lib/api";
import { channelSchema } from "@/lib/validation";
import { firstZodMessage } from "@/lib/validation";
import { listChannels, createChannel, getChannelBySlug } from "@/db/queries/channels";

export async function GET() {
  const { error: authError } = await requireSession();
  if (authError) return authError;

  const channels = await listChannels();
  return NextResponse.json({ channels }, { headers: JSON_HEADERS });
}

export async function POST(request: Request) {
  const { error: authError } = await requireSession();
  if (authError) return authError;

  const { body, error: bodyError } = await parseJsonBody(request);
  if (bodyError) return bodyError;

  const parsed = channelSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: firstZodMessage(parsed.error) },
      { status: 400, headers: JSON_HEADERS },
    );
  }

  const existing = await getChannelBySlug(parsed.data.slug);
  if (existing) {
    return NextResponse.json(
      { error: "Já existe um canal com este slug" },
      { status: 409, headers: JSON_HEADERS },
    );
  }

  const channel = await createChannel(parsed.data);
  return NextResponse.json({ channel }, { status: 201, headers: JSON_HEADERS });
}
