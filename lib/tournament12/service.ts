import { applyAction, initialTournament, type Tournament } from "./domain";
import { isTournament } from "./validate";
import { writeSchema } from "./protocol";
import type { Snapshot } from "./store";

// Small SQL interface also exercised against real PostgreSQL in the test suite (PGlite).
export interface Query {
  query<T>(sql: string, parameters?: (string | number)[]): Promise<T[]>;
}
export interface ScoreDatabase extends Query {
  transaction<T>(fn: (tx: Query) => Promise<T>): Promise<T>;
}
interface StateRow {
  payload: Tournament;
  revision: number;
  updated_at: Date | string;
}
export class ScoringError extends Error {
  constructor(
    public code: "INVALID_DATA" | "STALE_STATE" | "OPERATION_CONFLICT",
    public status: number,
  ) {
    super(code);
  }
}
const snapshot = (row: StateRow): Snapshot => {
  if (!isTournament(row.payload)) throw new Error("Invalid stored tournament");
  return { ...row, updated_at: new Date(row.updated_at).toISOString() };
};
export async function loadTournament(database: Query): Promise<Snapshot> {
  const rows = await database.query<StateRow>(
    "SELECT payload, revision, updated_at FROM tournament12_state WHERE id = $1",
    ["12"],
  );
  return rows.length
    ? snapshot(rows[0])
    : {
        payload: initialTournament(),
        revision: 0,
        updated_at: "2026-11-12T00:00:00.000Z",
      };
}
export async function saveTournament(
  database: ScoreDatabase,
  input: unknown,
  actorId: string,
): Promise<Snapshot> {
  const parsed = writeSchema.safeParse(input);
  if (!parsed.success || !actorId) throw new ScoringError("INVALID_DATA", 422);
  const command = parsed.data;
  return database.transaction(async (tx) => {
    // All writes serialize on one row; checking the operation before revision makes lost-response retries safe.
    await tx.query(
      "INSERT INTO tournament12_state (id,payload,revision) VALUES ($1,$2::jsonb,0) ON CONFLICT (id) DO NOTHING",
      ["12", JSON.stringify(initialTournament())],
    );
    const [row] = await tx.query<StateRow>(
      "SELECT payload,revision,updated_at FROM tournament12_state WHERE id=$1 FOR UPDATE",
      ["12"],
    );
    const current = snapshot(row);
    const previous = await tx.query<{ actor_id: string; command: unknown }>(
      "SELECT actor_id,command FROM tournament12_operations WHERE operation=$1",
      [command.operation],
    );
    if (previous.length) {
      // PostgreSQL JSONB normalizes object key order, so compare normalized structures.
      const canonical = (v: unknown): string =>
        JSON.stringify(v, (_key, value) =>
          value && typeof value === "object" && !Array.isArray(value)
            ? Object.fromEntries(
                Object.entries(value).sort(([a], [b]) => a.localeCompare(b)),
              )
            : value,
        );
      if (
        previous[0].actor_id !== actorId ||
        canonical(previous[0].command) !== canonical(command)
      )
        throw new ScoringError("OPERATION_CONFLICT", 409);
      return current;
    }
    if (current.revision !== command.revision)
      throw new ScoringError("STALE_STATE", 409);
    const at = new Date().toISOString();
    let payload: Tournament;
    try {
      payload = applyAction(
        current.payload,
        command.action,
        command.editor,
        at,
      );
    } catch {
      throw new ScoringError("INVALID_DATA", 422);
    }
    const [next] = await tx.query<StateRow>(
      "UPDATE tournament12_state SET payload=$1::jsonb,revision=revision+1,updated_at=$2 WHERE id=$3 RETURNING payload,revision,updated_at",
      [JSON.stringify(payload), at, "12"],
    );
    // The audit and state commit together, with authenticated account and self-reported operator kept separate.
    await tx.query(
      "INSERT INTO tournament12_operations (operation,actor_id,command,revision,before_payload,after_payload,created_at) VALUES ($1,$2,$3::jsonb,$4,$5::jsonb,$6::jsonb,$7)",
      [
        command.operation,
        actorId,
        JSON.stringify(command),
        next.revision,
        JSON.stringify(current.payload),
        JSON.stringify(payload),
        at,
      ],
    );
    return snapshot(next);
  });
}
