import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./db/schemas/mysql.ts",
  out: "./db/migrations/mysql",
  dialect: "mysql",
  dbCredentials: {
    url: process.env.DATABASE_URL?.trim() || "mysql://localhost:3306/app",
  },
});
