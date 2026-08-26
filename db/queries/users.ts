import { desc, eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

import { db } from "@/db";
import { users } from "@/db/schema";
import type { UserRow } from "@/db/schema";
import type { CreateUserInput, UpdateUserInput } from "@/lib/validation";

export async function listUsers(): Promise<UserRow[]> {
  return db
    .select()
    .from(users)
    .orderBy(desc(users.createdAt));
}

export async function getUser(id: number): Promise<UserRow | null> {
  if (!Number.isInteger(id)) return null;
  const [row] = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1);
  return row ?? null;
}

export async function getUserByEmail(email: string): Promise<UserRow | null> {
  const [row] = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase().trim()))
    .limit(1);
  return row ?? null;
}

export async function createUser(input: CreateUserInput): Promise<UserRow> {
  const passwordHash = await bcrypt.hash(input.password, 12);
  await db.insert(users).values({
    name: input.name.trim(),
    email: input.email.toLowerCase().trim(),
    passwordHash,
    role: input.role,
  });
  const created = await getUserByEmail(input.email);
  if (!created) throw new Error("Falha ao carregar o usuário criado");
  return created;
}

export async function updateUser(
  id: number,
  input: UpdateUserInput,
): Promise<UserRow | null> {
  if (!Number.isInteger(id)) return null;
  const existing = await getUser(id);
  if (!existing) return null;

  const values: Partial<{
    name: string;
    email: string;
    passwordHash: string;
    role: string;
    updatedAt: Date;
  }> = { updatedAt: new Date() };

  if (input.name !== undefined) values.name = input.name.trim();
  if (input.email !== undefined) values.email = input.email.toLowerCase().trim();
  if (input.role !== undefined) values.role = input.role;
  if (input.password !== undefined) {
    values.passwordHash = await bcrypt.hash(input.password, 12);
  }

  try {
    await db.update(users).set(values).where(eq(users.id, id));
  } catch (error) {
    if (
      error instanceof Error &&
      /unique|duplicate/i.test(error.message)
    ) {
      return null; // conflito de email
    }
    throw error;
  }

  return getUser(id);
}

export async function deleteUser(id: number): Promise<boolean> {
  if (!Number.isInteger(id)) return false;
  const existing = await getUser(id);
  if (!existing) return false;
  await db.delete(users).where(eq(users.id, id));
  return true;
}
