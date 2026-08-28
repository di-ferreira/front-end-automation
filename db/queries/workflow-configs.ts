import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { channels, workflowConfigs, type WorkflowConfigRow } from "@/db/schema";

export interface WorkflowConfigWithChannel extends WorkflowConfigRow {
  channelName: string;
  channelSlug: string;
}

export async function listWorkflowConfigs(): Promise<WorkflowConfigWithChannel[]> {
  const rows = await db
    .select({
      config: workflowConfigs,
      channelName: channels.name,
      channelSlug: channels.slug,
    })
    .from(workflowConfigs)
    .innerJoin(channels, eq(workflowConfigs.channelId, channels.id))
    .orderBy(channels.name, workflowConfigs.assetType);

  return rows.map((row) => ({
    ...row.config,
    channelName: row.channelName,
    channelSlug: row.channelSlug,
  }));
}

export async function getWorkflowConfig(id: number): Promise<WorkflowConfigWithChannel | null> {
  if (!Number.isInteger(id)) return null;
  const [row] = await db
    .select({
      config: workflowConfigs,
      channelName: channels.name,
      channelSlug: channels.slug,
    })
    .from(workflowConfigs)
    .innerJoin(channels, eq(workflowConfigs.channelId, channels.id))
    .where(eq(workflowConfigs.id, id))
    .limit(1);

  if (!row) return null;
  return { ...row.config, channelName: row.channelName, channelSlug: row.channelSlug };
}

export async function getWorkflowConfigBySlug(slug: string): Promise<WorkflowConfigRow | null> {
  const [row] = await db
    .select()
    .from(workflowConfigs)
    .where(eq(workflowConfigs.slug, slug))
    .limit(1);
  return row ?? null;
}

/**
 * Resolve qual workflow usar para um canal + asset type.
 * Retorna o workflow habilitado com maior prioridade.
 */
export async function resolveWorkflow(
  channelId: number,
  assetType: string,
): Promise<WorkflowConfigRow | null> {
  const [row] = await db
    .select()
    .from(workflowConfigs)
    .where(
      and(
        eq(workflowConfigs.channelId, channelId),
        eq(workflowConfigs.assetType, assetType),
        eq(workflowConfigs.enabled, 1),
      ),
    )
    .orderBy(workflowConfigs.priority)
    .limit(1);
  return row ?? null;
}

export async function listWorkflowsByChannel(channelId: number): Promise<WorkflowConfigRow[]> {
  return db
    .select()
    .from(workflowConfigs)
    .where(eq(workflowConfigs.channelId, channelId))
    .orderBy(workflowConfigs.assetType);
}

export async function createWorkflowConfig(
  data: typeof workflowConfigs.$inferInsert,
): Promise<WorkflowConfigRow> {
  const [inserted] = await db.insert(workflowConfigs).values(data).returning();
  return inserted;
}

export async function updateWorkflowConfig(
  id: number,
  data: Partial<typeof workflowConfigs.$inferInsert>,
): Promise<WorkflowConfigRow | null> {
  if (!(await getWorkflowConfig(id))) return null;
  const now = new Date();
  await db
    .update(workflowConfigs)
    .set({ ...data, updatedAt: now })
    .where(eq(workflowConfigs.id, id));
  return (await getWorkflowConfig(id)) ?? null;
}

export async function deleteWorkflowConfig(id: number): Promise<boolean> {
  const result = await db.delete(workflowConfigs).where(eq(workflowConfigs.id, id));
  return result.changes > 0;
}
