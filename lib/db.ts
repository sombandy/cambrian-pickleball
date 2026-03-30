import postgres from "postgres";

type SqlClient = ReturnType<typeof postgres>;

declare global {
  var __cambrianSql: SqlClient | undefined;
}

function createClient() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not configured.");
  }

  return postgres(databaseUrl, {
    prepare: false,
    max: 5,
  });
}

export function db() {
  if (!globalThis.__cambrianSql) {
    globalThis.__cambrianSql = createClient();
  }

  return globalThis.__cambrianSql;
}
