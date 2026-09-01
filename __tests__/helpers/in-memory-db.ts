import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import fs from "node:fs";
import path from "node:path";

import * as schema from "@/db/schema";

export type TestDb = ReturnType<typeof drizzle<typeof schema>>;

/**
 * Cria uma instância SQLite em memória com o schema completo aplicado a partir
 * das migrations do dialeto sqlite. Usado pelos testes de integração das queries.
 */
export function createTestDb(): TestDb {
  const sqlite = new Database(":memory:");
  sqlite.pragma("foreign_keys = ON");

  const dir = path.join(process.cwd(), "db", "migrations", "sqlite");
  const files = [
    "0000_init.sql",
    "0001_exec_description.sql",
    "0002_asset_studio.sql",
    "0003_channel_asset_unique.sql",
  ];

  for (const file of files) {
    const raw = fs.readFileSync(path.join(dir, file), "utf8");
    const cleaned = raw.replace(/-->\s*statement-breakpoint/g, "");
    sqlite.exec(cleaned);
  }

  return drizzle(sqlite, { schema });
}
