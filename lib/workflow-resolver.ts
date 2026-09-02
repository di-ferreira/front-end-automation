import type { WorkflowConfigRow } from "@/db/schema";
import { resolveWorkflow as dbResolveWorkflow } from "@/db/queries/workflow-configs";
import { getChannel } from "@/db/queries/channels";

export interface ResolvedWorkflow extends WorkflowConfigRow {
  channelName: string;
  channelSlug: string;
}

/**
 * Resolve qual workflow usar para um canal + asset type.
 * Unificado: delega para db/queries/workflow-configs (fonte da verdade)
 * e enriquece com dados do canal. Sem fallback — se não houver config
 * no banco, retorna null.
 */
export async function resolveWorkflow(
  channelId: number,
  assetType: string,
): Promise<ResolvedWorkflow | null> {
  const config = await dbResolveWorkflow(channelId, assetType);
  if (!config) return null;

  const channel = await getChannel(config.channelId);
  if (!channel) return null;

  return {
    ...config,
    channelName: channel.name,
    channelSlug: channel.slug,
  };
}
