import { config } from "dotenv";
config();

async function main() {
  const provider = (await import("./provider")).resolveDbProvider();
  const url =
    process.env.DATABASE_URL?.trim() ||
    (provider === "sqlite" ? "./data/app.db" : "");

  if (!url && provider !== "sqlite") {
    console.error("DATABASE_URL não definida para o provedor " + provider);
    process.exit(1);
  }

  switch (provider) {
    case "postgres": {
      const { drizzle } = await import("drizzle-orm/postgres-js");
      const postgres = (await import("postgres")).default;
      const { migrate } = await import("drizzle-orm/postgres-js/migrator");
      const client = postgres(url, { max: 1 });
      await migrate(drizzle(client), {
        migrationsFolder: "./db/migrations/pg",
      });
      await client.end();
      break;
    }
    case "mysql": {
      const { drizzle } = await import("drizzle-orm/mysql2");
      const mysql = (await import("mysql2/promise")).default;
      const { migrate } = await import("drizzle-orm/mysql2/migrator");
      const conn = mysql.createConnection(url);
      await migrate(drizzle(await conn), {
        migrationsFolder: "./db/migrations/mysql",
      });
      await (await conn).end();
      break;
    }
    default: {
      const { drizzle } = await import("drizzle-orm/better-sqlite3");
      const Database = (await import("better-sqlite3")).default;
      const { migrate } = await import("drizzle-orm/better-sqlite3/migrator");
      const client = new Database(url);
      client.pragma("foreign_keys = ON");
      await migrate(drizzle(client), {
        migrationsFolder: "./db/migrations/sqlite",
      });
      client.close();
      break;
    }
  }

  console.log(`Migrations aplicadas com sucesso (${provider}).`);
  process.exit(0);
}

main().catch((error) => {
  console.error("Falha ao aplicar migrations:", error);
  process.exit(1);
});
