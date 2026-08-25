import { drizzle as drizzleSqlite } from "drizzle-orm/better-sqlite3";
import { drizzle as drizzlePg } from "drizzle-orm/postgres-js";
import { drizzle as drizzleMysql } from "drizzle-orm/mysql2";
import postgres from "postgres";
import mysql from "mysql2/promise";
import Database from "better-sqlite3";

import * as schema from "./schema";
import { DEFAULT_SQLITE_URL, resolveDbProvider } from "./provider";

/**
 * Instância única do client Drizzle para o provedor ativo.
 * O tipo exportado segue a variante sqlite (superfície estável); em runtime
 * o driver corresponde a DB_PROVIDER (sqlite | postgres | mysql).
 */
export type AppDatabase = ReturnType<
  typeof drizzleSqlite<typeof schema>
>;

function createDb(): AppDatabase {
  const provider = resolveDbProvider();
  const url = process.env.DATABASE_URL?.trim() || DEFAULT_SQLITE_URL;

  switch (provider) {
    case "postgres": {
      const client = postgres(url, { max: 10 });
      return drizzlePg(client, { schema }) as unknown as AppDatabase;
    }
    case "mysql": {
      const pool = mysql.createPool(url);
      return drizzleMysql(pool, {
        schema,
        mode: "default",
      }) as unknown as AppDatabase;
    }
    case "sqlite":
    default: {
      const client = new Database(url);
      client.pragma("journal_mode = WAL");
      client.pragma("foreign_keys = ON");
      return drizzleSqlite(client, { schema });
    }
  }
}

const globalForDb = globalThis as unknown as { __appDb?: AppDatabase };

export const db = (globalForDb.__appDb ??= createDb());
export { schema };
