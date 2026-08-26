import { randomUUID } from "node:crypto";

import { and, desc, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { executions, prompts, type ExecutionRow } from "@/db/schema";
import type { ExecutionStatus } from "@/lib/validation";

export interface ExecutionWithPrompt extends ExecutionRow {
  promptName: string | null;
}

export interface CreateExecutionData {
  title?: string;
  promptId?: number;
  promptText?: string;
}

export async function createExecution(
  data: CreateExecutionData,
): Promise<ExecutionRow> {
  const id = randomUUID();
  await db.insert(executions).values({
    id,
    status: "queued",
    title: data.title ?? null,
    promptId: data.promptId ?? null,
    promptText: data.promptText ?? null,
  });

  const created = await getExecution(id);
  if (!created) throw new Error("Falha ao carregar a execução criada");
  return created;
}

export async function getExecution(
  id: string,
): Promise<ExecutionRow | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const [row] = await db
    .select()
    .from(executions)
    .where(eq(executions.id, id))
    .limit(1);
  return row ?? null;
}

export async function listExecutions(
  options?: { status?: ExecutionStatus; limit?: number },
): Promise<ExecutionWithPrompt[]> {
  const limit = options?.limit ?? 50;
  const filters = [
    options?.status ? eq(executions.status, options.status) : undefined,
  ].filter(Boolean);

  const rows = await db
    .select({
      execution: executions,
      promptName: prompts.name,
    })
    .from(executions)
    .leftJoin(prompts, eq(executions.promptId, prompts.id))
    .where(filters.length > 0 ? and(...filters) : undefined)
    .orderBy(desc(executions.createdAt))
    .limit(limit);

  return rows.map((row) => ({ ...row.execution, promptName: row.promptName }));
}

export async function markExecutionRunning(id: string): Promise<void> {
  const now = new Date();
  await db
    .update(executions)
    .set({ status: "running", startedAt: now, updatedAt: now })
    .where(eq(executions.id, id));
}

export async function markExecutionFailed(
  id: string,
  error: string,
): Promise<void> {
  const now = new Date();
  await db
    .update(executions)
    .set({
      status: "failed",
      error: error.slice(0, 1000),
      finishedAt: now,
      updatedAt: now,
    })
    .where(eq(executions.id, id));
}

export async function markExecutionCompleted(id: string): Promise<boolean> {
  if (!(await getExecution(id))) return false;
  const now = new Date();
  await db
    .update(executions)
    .set({ status: "completed", finishedAt: now, updatedAt: now })
    .where(eq(executions.id, id));
  return true;
}

export async function incrementPromptUse(promptId: number): Promise<void> {
  await db
    .update(prompts)
    .set({
      useCount: sql`${prompts.useCount} + 1`,
      lastUsedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(prompts.id, promptId));
}

/** Edita título e/ou descrição final da execução (revisão para YouTube). */
export async function updateExecutionText(
  id: string,
  data: { title?: string; description?: string },
): Promise<ExecutionRow | null> {
  if (!(await getExecution(id))) return null;

  const values: Partial<{
    title: string | null;
    description: string | null;
    updatedAt: Date;
  }> = { updatedAt: new Date() };
  if (data.title !== undefined) values.title = data.title || null;
  if (data.description !== undefined) values.description = data.description || null;

  await db.update(executions).set(values).where(eq(executions.id, id));
  return getExecution(id);
}
