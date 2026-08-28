import { eq } from "drizzle-orm";

import { db } from "@/db";
import { channels, type ChannelRow } from "@/db/schema";

export async function listChannels(): Promise<ChannelRow[]> {
  return db.select().from(channels).orderBy(channels.name);
}

export async function getChannel(id: number): Promise<ChannelRow | null> {
  if (!Number.isInteger(id)) return null;
  const [row] = await db.select().from(channels).where(eq(channels.id, id)).limit(1);
  return row ?? null;
}

export async function getChannelBySlug(slug: string): Promise<ChannelRow | null> {
  const [row] = await db.select().from(channels).where(eq(channels.slug, slug)).limit(1);
  return row ?? null;
}

export async function listEnabledChannels(): Promise<ChannelRow[]> {
  return db.select().from(channels).where(eq(channels.enabled, 1)).orderBy(channels.name);
}

export async function createChannel(data: typeof channels.$inferInsert): Promise<ChannelRow> {
  const [inserted] = await db.insert(channels).values(data).returning();
  return inserted;
}

export async function updateChannel(
  id: number,
  data: Partial<typeof channels.$inferInsert>,
): Promise<ChannelRow | null> {
  if (!(await getChannel(id))) return null;
  const now = new Date();
  await db
    .update(channels)
    .set({ ...data, updatedAt: now })
    .where(eq(channels.id, id));
  return getChannel(id);
}

export async function deleteChannel(id: number): Promise<boolean> {
  if (!(await getChannel(id))) return false;
  await db.delete(channels).where(eq(channels.id, id));
  return true;
}
