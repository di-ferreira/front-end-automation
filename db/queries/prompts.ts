import { and, desc, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { executions, prompts } from "@/db/schema";
import type {
  ExecutionRow,
  PromptRow,
} from "@/db/schema";
import type {
  CreatePromptInput,
  PromptType,
  UpdatePromptInput,
} from "@/lib/validation";

function buildSearchFilter(term: string) {
  const needle = `%${term.toLowerCase()}%`;
  return sql`(lower(${prompts.name}) like ${needle} or lower(coalesce(${prompts.content}, '')) like ${needle} or lower(coalesce(${prompts.tags}, '')) like ${needle})`;
}

export async function listPrompts(options?: {
  q?: string;
  type?: PromptType;
}): Promise<PromptRow[]> {
  const filters = [
    options?.type ? eq(prompts.type, options.type) : undefined,
    options?.q?.trim() ? buildSearchFilter(options.q.trim()) : undefined,
  ].filter(Boolean);

  return db
    .select()
    .from(prompts)
    .where(filters.length > 0 ? and(...filters) : undefined)
    .orderBy(desc(prompts.createdAt));
}

export async function getPrompt(id: number): Promise<PromptRow | null> {
  if (!Number.isInteger(id)) return null;
  const [row] = await db
    .select()
    .from(prompts)
    .where(eq(prompts.id, id))
    .limit(1);
  return row ?? null;
}

/** Detecta violação de unique nos três dialetos suportados. */
export function isUniqueViolation(error: unknown): boolean {
  return (
    error instanceof Error &&
    /unique|duplicate/i.test(error.message)
  );
}

export async function createPrompt(
  input: CreatePromptInput,
): Promise<PromptRow> {
  await db.insert(prompts).values({
    name: input.name,
    type: input.type,
    content: input.content,
    tags: input.tags || null,
  });
  // returning() não existe no mysql; recarrega pela chave única de nome
  const created = await getPromptByName(input.name);
  if (!created) throw new Error("Falha ao carregar o prompt criado");
  return created;
}

export async function getPromptByName(
  name: string,
): Promise<PromptRow | null> {
  const [row] = await db
    .select()
    .from(prompts)
    .where(eq(prompts.name, name))
    .limit(1);
  return row ?? null;
}

export async function updatePrompt(
  id: number,
  input: UpdatePromptInput,
): Promise<PromptRow | null> {
  if (!Number.isInteger(id)) return null;

  const values: Partial<{
    name: string;
    type: PromptType;
    content: string;
    tags: string | null;
    updatedAt: Date;
  }> = { updatedAt: new Date() };
  if (input.name !== undefined) values.name = input.name;
  if (input.type !== undefined) values.type = input.type;
  if (input.content !== undefined) values.content = input.content;
  if (input.tags !== undefined) values.tags = input.tags || null;

  try {
    await db.update(prompts).set(values).where(eq(prompts.id, id));
  } catch (error) {
    if (isUniqueViolation(error)) return null; // conflito de nome
    throw error;
  }
  return getPrompt(id);
}

export async function deletePrompt(id: number): Promise<boolean> {
  if (!Number.isInteger(id)) return false;
  const existing = await getPrompt(id);
  if (!existing) return false;
  await db.delete(prompts).where(eq(prompts.id, id));
  return true;
}

export async function listExecutions(): Promise<ExecutionRow[]> {
  return db
    .select()
    .from(executions)
    .orderBy(desc(executions.createdAt));
}
