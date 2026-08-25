import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { assets, users, type AssetRow } from "@/db/schema";
import type { ApprovalStatus } from "@/lib/validation";

export interface ReplaceAssetData {
  type: string;
  filePath: string;
  mimeType?: string | null;
  sizeBytes?: number | null;
}

export interface AssetWithApprover extends AssetRow {
  approvedByName: string | null;
}

export async function listExecutionAssets(
  executionId: string,
): Promise<AssetRow[]> {
  return db
    .select()
    .from(assets)
    .where(eq(assets.executionId, executionId));
}

/** Assets com nome de quem decidiu (para histórico/badges). */
export async function listExecutionAssetsDetailed(
  executionId: string,
): Promise<AssetWithApprover[]> {
  const rows = await db
    .select({ asset: assets, approverName: users.name })
    .from(assets)
    .leftJoin(users, eq(assets.approvedById, users.id))
    .where(eq(assets.executionId, executionId));

  return rows.map((row) => ({
    ...row.asset,
    approvedByName: row.approverName,
  }));
}

/**
 * Registra decisão de aprovação sobre um asset.
 * status "pending" desfaz a decisão (limpa aprovador/data).
 */
export async function setAssetApproval(
  executionId: string,
  assetId: number,
  approvalStatus: ApprovalStatus,
  userId: number,
): Promise<AssetRow | null> {
  if (!Number.isInteger(assetId)) return null;

  const [existing] = await db
    .select()
    .from(assets)
    .where(and(eq(assets.id, assetId), eq(assets.executionId, executionId)))
    .limit(1);
  if (!existing) return null;

  const decided = approvalStatus !== "pending";
  await db
    .update(assets)
    .set({
      approvalStatus,
      approvedById: decided ? userId : null,
      approvedAt: decided ? new Date() : null,
    })
    .where(eq(assets.id, assetId));

  const [updated] = await db
    .select()
    .from(assets)
    .where(eq(assets.id, assetId))
    .limit(1);
  return updated ?? null;
}

/** Aprova todos os assets pendentes da execução; retorna quantos mudaram. */
export async function approvePendingAssets(
  executionId: string,
  userId: number,
): Promise<number> {
  const pending = await db
    .select({ id: assets.id })
    .from(assets)
    .where(
      and(eq(assets.executionId, executionId), eq(assets.approvalStatus, "pending")),
    );

  for (const asset of pending) {
    await db
      .update(assets)
      .set({
        approvalStatus: "approved",
        approvedById: userId,
        approvedAt: new Date(),
      })
      .where(eq(assets.id, asset.id));
  }
  return pending.length;
}

/**
 * Substitui os assets de uma execução em lote (operação idempotente).
 * Sem transação: melhor-sqlite3 exige callback síncrono e a troca em
 * duas etapas é suficiente para este volume. Observação: substituir zera
 * as decisões de aprovação anteriores (nova geração = nova revisão).
 */
export async function replaceExecutionAssets(
  executionId: string,
  list: ReplaceAssetData[],
): Promise<void> {
  await db.delete(assets).where(eq(assets.executionId, executionId));
  if (list.length === 0) return;
  await db.insert(assets).values(
    list.map((asset) => ({
      executionId,
      type: asset.type as (typeof assets.$inferInsert)["type"],
      filePath: asset.filePath,
      mimeType: asset.mimeType ?? null,
      sizeBytes: asset.sizeBytes ?? null,
    })),
  );
}
