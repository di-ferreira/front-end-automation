import { and, desc, eq } from "drizzle-orm";

import { db } from "@/db";
import {
  assetGenerations,
  channels,
  workflowConfigs,
  workflowExecutions,
  type AssetGenerationRow,
} from "@/db/schema";

export interface AssetGenerationDetail extends AssetGenerationRow {
  channelName: string;
  channelSlug: string;
  workflowName: string | null;
}

export interface GenerationWorkflowExecution {
  id: number;
  status: string;
  durationMs: number | null;
  error: string | null;
  requestPayload: string | null;
  responsePayload: string | null;
  startedAt: Date | null;
  completedAt: Date | null;
}

export interface GenerationFullDetail extends AssetGenerationDetail {
  workflowExecution: GenerationWorkflowExecution | null;
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

export async function getGenerationDetail(id: number): Promise<GenerationFullDetail | null> {
  if (!Number.isInteger(id)) return null;
  const [row] = await db
    .select({
      gen: assetGenerations,
      channelName: channels.name,
      channelSlug: channels.slug,
      workflowName: workflowConfigs.name,
      weId: workflowExecutions.id,
      weStatus: workflowExecutions.status,
      weDurationMs: workflowExecutions.durationMs,
      weError: workflowExecutions.error,
      weRequestPayload: workflowExecutions.requestPayload,
      weResponsePayload: workflowExecutions.responsePayload,
      weStartedAt: workflowExecutions.startedAt,
      weCompletedAt: workflowExecutions.completedAt,
    })
    .from(assetGenerations)
    .innerJoin(channels, eq(assetGenerations.channelId, channels.id))
    .leftJoin(workflowConfigs, eq(assetGenerations.workflowConfigId, workflowConfigs.id))
    .leftJoin(workflowExecutions, eq(workflowExecutions.assetGenerationId, assetGenerations.id))
    .where(eq(assetGenerations.id, id))
    .limit(1);

  if (!row) return null;
  return {
    ...row.gen,
    channelName: row.channelName,
    channelSlug: row.channelSlug,
    workflowName: row.workflowName,
    workflowExecution: row.weId
      ? {
          id: row.weId,
          status: row.weStatus ?? "unknown",
          durationMs: row.weDurationMs,
          error: row.weError,
          requestPayload: row.weRequestPayload,
          responsePayload: row.weResponsePayload,
          startedAt: row.weStartedAt,
          completedAt: row.weCompletedAt,
        }
      : null,
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

export async function updateGenerationStatus(
  id: number,
  status: AssetGenerationRow["status"],
  error?: string | null,
  filePath?: string | null,
): Promise<AssetGenerationRow | null> {
  const now = new Date();
  await db
    .update(assetGenerations)
    .set({ status, error, filePath, updatedAt: now })
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
