import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./db/schemas/pg.ts",
  out: "./db/migrations/pg",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL?.trim() || "postgresql://localhost:5432/app",
  },
});
