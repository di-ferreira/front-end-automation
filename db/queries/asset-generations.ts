import { and, desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { assetGenerations, channels, workflowConfigs, type AssetGenerationRow } from "@/db/schema";

export interface AssetGenerationDetail extends AssetGenerationRow {
  channelName: string;
  channelSlug: string;
  workflowName: string | null;
}

export async function listGenerations(options?: {
  channelId?: number;
  assetType?: string;
  status?: AssetGenerationRow["status"];
  limit?: number;
}): Promise<AssetGenerationDetail[]> {
  const limit = options?.limit ?? 50;
  const filters = [
    options?.channelId ? eq(assetGenerations.channelId, options.channelId) : undefined,
    options?.assetType ? eq(assetGenerations.assetType, options.assetType) : undefined,
    options?.status ? eq(assetGenerations.status, options.status) : undefined,
  ].filter(Boolean);

  const rows = await db
    .select({
      gen: assetGenerations,
      channelName: channels.name,
      channelSlug: channels.slug,
      workflowName: workflowConfigs.name,
    })
    .from(assetGenerations)
    .innerJoin(channels, eq(assetGenerations.channelId, channels.id))
    .leftJoin(workflowConfigs, eq(assetGenerations.workflowConfigId, workflowConfigs.id))
    .where(filters.length > 0 ? and(...filters) : undefined)
    .orderBy(desc(assetGenerations.createdAt))
    .limit(limit);

  return rows.map((row) => ({
    ...row.gen,
    channelName: row.channelName,
    channelSlug: row.channelSlug,
    workflowName: row.workflowName,
  }));
}

export async function getGeneration(id: number): Promise<AssetGenerationDetail | null> {
  if (!Number.isInteger(id)) return null;
  const [row] = await db
    .select({
      gen: assetGenerations,
      channelName: channels.name,
      channelSlug: channels.slug,
      workflowName: workflowConfigs.name,
    })
    .from(assetGenerations)
    .innerJoin(channels, eq(assetGenerations.channelId, channels.id))
    .leftJoin(workflowConfigs, eq(assetGenerations.workflowConfigId, workflowConfigs.id))
    .where(eq(assetGenerations.id, id))
    .limit(1);

  if (!row) return null;
  return {
    ...row.gen,
    channelName: row.channelName,
    channelSlug: row.channelSlug,
    workflowName: row.workflowName,
  };
}

export async function createGeneration(
  data: typeof assetGenerations.$inferInsert,
): Promise<AssetGenerationRow> {
  const [inserted] = await db.insert(assetGenerations).values(data).returning();
  return inserted;
}

export async function updateGeneration(
  id: number,
  data: Partial<typeof assetGenerations.$inferInsert>,
): Promise<AssetGenerationRow | null> {
  const now = new Date();
  await db
    .update(assetGenerations)
    .set({ ...data, updatedAt: now })
    .where(eq(assetGenerations.id, id));
  const [updated] = await db
    .select()
    .from(assetGenerations)
    .where(eq(assetGenerations.id, id))
    .limit(1);
  return updated ?? null;
}

export async function listByAssetType(
  assetType: string,
  channelId?: number,
): Promise<AssetGenerationDetail[]> {
  return listGenerations({ assetType, channelId });
}
