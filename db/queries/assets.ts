import { eq } from "drizzle-orm";

import { db } from "@/db";
import { assets, type AssetRow } from "@/db/schema";

export interface ReplaceAssetData {
  type: string;
  filePath: string;
  mimeType?: string | null;
  sizeBytes?: number | null;
}

export async function listExecutionAssets(
  executionId: string,
): Promise<AssetRow[]> {
  return db
    .select()
    .from(assets)
    .where(eq(assets.executionId, executionId));
}

/**
 * Substitui os assets de uma execução em lote (operação idempotente).
 * Sem transação: melhor-sqlite3 exige callback síncrono e a troca em
 * duas etapas é suficiente para este volume.
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
