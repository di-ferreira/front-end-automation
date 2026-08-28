import { eq } from "drizzle-orm";

import { db } from "@/db";
import { workflowConfigs, channels, type WorkflowConfigRow } from "@/db/schema";

export interface ResolvedWorkflow extends WorkflowConfigRow {
  channelName: string;
  channelSlug: string;
}

/**
 * Resolve qual workflow usar para um canal + asset type.
 * 1. Busca no DB por channelId + assetType (enabled, maior prioridade)
 * 2. Fallback: N8N_WEBHOOK_URL do .env (legacy)
 */
export async function resolveWorkflow(
  channelId: number,
  assetType: string,
): Promise<ResolvedWorkflow | null> {
  const [row] = await db
    .select({
      config: workflowConfigs,
      channelName: channels.name,
      channelSlug: channels.slug,
    })
    .from(workflowConfigs)
    .innerJoin(channels, eq(workflowConfigs.channelId, channelId))
    .where(
      eq(workflowConfigs.channelId, channelId) &&
        eq(workflowConfigs.assetType, assetType) &&
        eq(workflowConfigs.enabled, 1),
    )
    .orderBy(workflowConfigs.priority)
    .limit(1);

  if (row) {
    return {
      ...row.config,
      channelName: row.channelName,
      channelSlug: row.channelSlug,
    };
  }

  const fallbackUrl = process.env.N8N_WEBHOOK_URL?.trim();
  if (!fallbackUrl) return null;

  const [channel] = await db.select().from(channels).where(eq(channels.id, channelId)).limit(1);

  return {
    id: 0,
    channelId,
    assetType,
    name: `Legacy ${assetType}`,
    slug: `legacy-${channel?.slug ?? "unknown"}-${assetType}`,
    webhookUrl: fallbackUrl,
    method: "POST",
    headers: null,
    enabled: 1,
    priority: 0,
    timeoutMs: 10_000,
    metadata: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    channelName: channel?.name ?? "Unknown",
    channelSlug: channel?.slug ?? "unknown",
  };
}
