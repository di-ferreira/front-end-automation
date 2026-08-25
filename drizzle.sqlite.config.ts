import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./db/schemas/sqlite.ts",
  out: "./db/migrations/sqlite",
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.DATABASE_URL?.trim() || "./data/app.db",
  },
});
