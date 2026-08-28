import { desc, eq } from "drizzle-orm";

import { db } from "@/db";
import {
  workflowExecutions,
  workflowConfigs,
  assetGenerations,
  channels,
  type WorkflowExecutionRow,
} from "@/db/schema";

export interface WorkflowExecutionDetail extends WorkflowExecutionRow {
  configName: string;
  channelSlug: string;
  assetType: string | null;
}

export async function listExecutionsByGeneration(
  generationId: number,
): Promise<WorkflowExecutionDetail[]> {
  const rows = await db
    .select({
      exec: workflowExecutions,
      configName: workflowConfigs.name,
      channelSlug: channels.slug,
      assetType: assetGenerations.assetType,
    })
    .from(workflowExecutions)
    .innerJoin(workflowConfigs, eq(workflowExecutions.workflowConfigId, workflowConfigs.id))
    .innerJoin(channels, eq(workflowConfigs.channelId, channels.id))
    .leftJoin(assetGenerations, eq(workflowExecutions.assetGenerationId, assetGenerations.id))
    .where(eq(workflowExecutions.assetGenerationId, generationId))
    .orderBy(desc(workflowExecutions.createdAt));

  return rows.map((row) => ({
    ...row.exec,
    configName: row.configName,
    channelSlug: row.channelSlug,
    assetType: row.assetType,
  }));
}

export async function listExecutionsByConfig(
  configId: number,
  limit = 20,
): Promise<WorkflowExecutionDetail[]> {
  const rows = await db
    .select({
      exec: workflowExecutions,
      configName: workflowConfigs.name,
      channelSlug: channels.slug,
      assetType: assetGenerations.assetType,
    })
    .from(workflowExecutions)
    .innerJoin(workflowConfigs, eq(workflowExecutions.workflowConfigId, workflowConfigs.id))
    .innerJoin(channels, eq(workflowConfigs.channelId, channels.id))
    .leftJoin(assetGenerations, eq(workflowExecutions.assetGenerationId, assetGenerations.id))
    .where(eq(workflowExecutions.workflowConfigId, configId))
    .orderBy(desc(workflowExecutions.createdAt))
    .limit(limit);

  return rows.map((row) => ({
    ...row.exec,
    configName: row.configName,
    channelSlug: row.channelSlug,
    assetType: row.assetType,
  }));
}

export async function createExecution(
  data: typeof workflowExecutions.$inferInsert,
): Promise<WorkflowExecutionRow> {
  const [inserted] = await db.insert(workflowExecutions).values(data).returning();
  return inserted;
}

export async function updateExecution(
  id: number,
  data: Partial<typeof workflowExecutions.$inferInsert>,
): Promise<WorkflowExecutionRow | null> {
  await db.update(workflowExecutions).set(data).where(eq(workflowExecutions.id, id));
  const [updated] = await db
    .select()
    .from(workflowExecutions)
    .where(eq(workflowExecutions.id, id))
    .limit(1);
  return updated ?? null;
}

export async function getExecution(id: number): Promise<WorkflowExecutionRow | null> {
  if (!Number.isInteger(id)) return null;
  const [row] = await db
    .select()
    .from(workflowExecutions)
    .where(eq(workflowExecutions.id, id))
    .limit(1);
  return row ?? null;
}
