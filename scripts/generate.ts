import { spawnSync } from "node:child_process";

import { resolveDbProvider } from "../db/provider";

const provider = resolveDbProvider();
const configMap: Record<string, string> = {
  sqlite: "drizzle.sqlite.config.ts",
  postgres: "drizzle.pg.config.ts",
  mysql: "drizzle.mysql.config.ts",
};

console.log(`Gerando migrations para o provedor: ${provider}`);

const result = spawnSync(
  "npx",
  ["drizzle-kit", "generate", "--config", configMap[provider]],
  { stdio: "inherit" },
);

process.exit(result.status ?? 1);
