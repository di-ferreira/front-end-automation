export type DbProvider = "sqlite" | "postgres" | "mysql";

/**
 * Resolve o provedor de banco a partir de DB_PROVIDER.
 * Se não definido, tenta inferir pelo protocolo da DATABASE_URL.
 */
export function resolveDbProvider(env = process.env): DbProvider {
  const explicit = env.DB_PROVIDER?.trim().toLowerCase();
  if (explicit === "sqlite" || explicit === "postgres" || explicit === "mysql") {
    return explicit;
  }

  const url = env.DATABASE_URL?.trim() ?? "";
  if (/^postgres(ql)?:\/\//.test(url)) return "postgres";
  if (/^mysql:\/\//.test(url)) return "mysql";
  return "sqlite";
}

/** Caminho padrão do arquivo sqlite quando DATABASE_URL não aponta para arquivo. */
export const DEFAULT_SQLITE_URL = "./data/app.db";
