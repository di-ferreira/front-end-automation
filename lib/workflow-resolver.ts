import { eq } from "drizzle-orm";

import { db } from "@/db";
import { workflowConfigs, channels, type WorkflowConfigRow } from "@/db/schema";

export interface ResolvedWorkflow extends WorkflowConfigRow {
  channelName: string;
  channelSlug: string;
}

/**
 * Resolve qual workflow usar para um canal + asset type.
 * Busca no DB por channelId + assetType (enabled, maior prioridade).
 * Sem fallback — se não houver config no banco, retorna null.
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

  return null;
}
