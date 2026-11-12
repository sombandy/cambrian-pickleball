import { db } from "@/lib/db";
import type { ScoreDatabase } from "./service";

export function scoringDatabase(): ScoreDatabase {
  const sql = db();
  const query = async <T>(
    statement: string,
    parameters: (string | number)[] = [],
  ): Promise<T[]> => {
    return [...(await sql.unsafe(statement, parameters))] as unknown as T[];
  };
  return {
    query,
    async transaction(fn) {
      // postgres.js's begin overload types flatten generic arrays; capture the typed return explicitly.
      let result: Awaited<ReturnType<typeof fn>> | undefined;
      await sql.begin(async (tx) => {
        await tx.unsafe("SET LOCAL lock_timeout = '5s'");
        await tx.unsafe("SET LOCAL statement_timeout = '10s'");
        result = await fn({
          query: async <T>(
            statement: string,
            parameters: (string | number)[] = [],
          ): Promise<T[]> =>
            [...(await tx.unsafe(statement, parameters))] as unknown as T[],
        });
      });
      return result!;
    },
  };
}
