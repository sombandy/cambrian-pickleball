import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import {
  loadTournament,
  saveTournament,
  type Query,
  type ScoreDatabase,
} from "./service";
import { editorAllowed } from "./protocol";
import {
  LEAGUE,
  gamesFor,
  standings,
  seriesOutcome,
  type Action,
} from "./domain";
import { LEAGUE_FIXTURES } from "../../app/tournament/12/schedule";

async function fixture() {
  const pg = new PGlite();
  // Run every committed migration, proving the new tables coexist with the site's existing ones.
  const journal = JSON.parse(
    await readFile(
      new URL("../../drizzle/meta/_journal.json", import.meta.url),
      "utf8",
    ),
  );
  for (const entry of journal.entries)
    await pg.exec(
      await readFile(
        new URL(`../../drizzle/${entry.tag}.sql`, import.meta.url),
        "utf8",
      ),
    );
  const query: Query["query"] = async (sql, params) =>
    (await pg.query(sql, params)).rows as never;
  const database: ScoreDatabase = {
    query,
    transaction: (fn) =>
      pg.transaction((tx) =>
        fn({
          query: async (sql, params) =>
            (await tx.query(sql, params)).rows as never,
        }),
      ),
  };
  return { pg, database };
}
const command = (
  revision = 0,
  action: unknown = { type: "score", id: "L1", a: 23, b: 22 },
) => ({
  revision,
  action,
  operation: crypto.randomUUID(),
  editor: "Organizer",
});

test("only explicitly configured Clerk IDs can edit; blank config and ordinary signed-in users cannot", () => {
  assert.equal(editorAllowed(null, "user_editor"), false);
  assert.equal(editorAllowed("user_editor", ""), false);
  assert.equal(editorAllowed("user_viewer", "user_editor"), false);
  assert.equal(editorAllowed("user_editor", " user_owner, user_editor "), true);
});
test("scorer uses the same sixty fixtures, partnerships and leads as the published schedule", () => {
  assert.deepEqual(
    LEAGUE.map((g) => [g.number, g.a, g.b, g.pair, g.lead]),
    LEAGUE_FIXTURES.map((g) => [g.priority, g.home, g.away, g.pair, g.lead]),
  );
});
test("PostgreSQL persists score, revision, operator and authenticated audit together; retries commit once", async () => {
  const { pg, database } = await fixture();
  try {
    assert.equal((await loadTournament(database)).revision, 0);
    const request = command();
    const first = await saveTournament(database, request, "user_editor");
    assert.equal(first.revision, 1);
    assert.equal(first.payload.results.L1.b, 22);
    assert.deepEqual(await loadTournament(database), first);
    const retry = await saveTournament(database, request, "user_editor");
    assert.deepEqual(retry, first);
    const audit = await pg.query<{
      actor_id: string;
      before_payload: { results: object };
      after_payload: { results: object };
    }>("SELECT * FROM tournament12_operations");
    assert.equal(audit.rows.length, 1);
    assert.equal(audit.rows[0].actor_id, "user_editor");
    assert.deepEqual(audit.rows[0].before_payload.results, {});
    assert.ok("L1" in audit.rows[0].after_payload.results);
    // Retry is still safe after another editor has moved the revision on.
    await saveTournament(
      database,
      command(1, { type: "score", id: "L2", a: 21, b: 14 }),
      "user_editor",
    );
    assert.equal(
      (await saveTournament(database, request, "user_editor")).revision,
      2,
    );
    await assert.rejects(
      saveTournament(
        database,
        { ...request, editor: "Changed operator" },
        "user_editor",
      ),
      /OPERATION_CONFLICT/,
    );
    await assert.rejects(
      saveTournament(database, request, "different-account"),
      /OPERATION_CONFLICT/,
    );
  } finally {
    await pg.close();
  }
});
test("simultaneous stale writers cannot overwrite a result", async () => {
  const { pg, database } = await fixture();
  try {
    const results = await Promise.allSettled([
      saveTournament(database, command(), "user_a"),
      saveTournament(
        database,
        command(0, { type: "score", id: "L2", a: 21, b: 0 }),
        "user_b",
      ),
    ]);
    assert.equal(results.filter((r) => r.status === "fulfilled").length, 1);
    assert.match(
      String(
        (results.find((r) => r.status === "rejected") as PromiseRejectedResult)
          .reason,
      ),
      /STALE_STATE/,
    );
    assert.equal(
      Object.keys((await loadTournament(database)).payload.results).length,
      1,
    );
  } finally {
    await pg.close();
  }
});
test("server rejects invalid scores, coercions, forged snapshots, unknown actions and malformed fields", async () => {
  const { pg, database } = await fixture();
  try {
    for (const input of [
      command(0, { type: "score", id: "L1", a: 21, b: 20 }),
      command(0, { type: "score", id: "L1", a: 22, b: 21 }),
      command(0, { type: "score", id: "L1", a: "21", b: 14 }),
      command(0, { type: "score", id: "L1", a: 21.5, b: 14 }),
      command(0, { type: "score", id: "L61", a: 21, b: 0 }),
      command(0, { type: "reset" }),
      { ...command(), payload: { results: {} } },
      { ...command(), revision: -1 },
      { ...command(), operation: "oops" },
      command(0, { type: "swap", team: "Z", first: 1, second: 2 }),
      command(0, { type: "prepare-finals" }),
    ])
      await assert.rejects(
        saveTournament(database, input, "user_editor"),
        /INVALID_DATA/,
      );
    assert.equal((await loadTournament(database)).revision, 0);
    assert.equal(
      (await pg.query("SELECT * FROM tournament12_operations")).rows.length,
      0,
    );
  } finally {
    await pg.close();
  }
});
test("failed audit insertion rolls the score and revision back, allowing the same safe retry", async () => {
  const { pg, database } = await fixture();
  try {
    const broken: ScoreDatabase = {
      ...database,
      transaction: (fn) =>
        database.transaction((tx) =>
          fn({
            query: async (sql, params) => {
              if (sql.startsWith("INSERT INTO tournament12_operations"))
                throw new Error("simulated failure");
              return tx.query(sql, params);
            },
          }),
        ),
    };
    const request = command();
    await assert.rejects(
      saveTournament(broken, request, "user_editor"),
      /simulated/,
    );
    assert.equal((await loadTournament(database)).revision, 0);
    assert.equal(
      (await saveTournament(database, request, "user_editor")).revision,
      1,
    );
  } finally {
    await pg.close();
  }
});

test("database service completes all 80 games, stage transitions and phase-specific swaps", async () => {
  const { pg, database } = await fixture();
  try {
    let current = await loadTournament(database);
    const save = async (action: Action) => {
      current = await saveTournament(
        database,
        command(current.revision, action),
        "user_editor",
      );
    };
    for (const game of LEAGUE)
      await save({ type: "score", id: game.id, a: 21, b: 14 });
    await save({
      type: "prepare-semis",
      seeds: standings(current.payload).map((r) => r.team),
    });
    const team = current.payload.seeds[0];
    const leagueNames = [...current.payload.players[team]];
    await save({ type: "swap", team, first: 1, second: 3 });
    await save({ type: "publish-lineups" });
    const before = current.revision;
    await assert.rejects(
      save({ type: "score", id: "L1", a: 21, b: 0 }),
      /INVALID_DATA/,
    );
    assert.equal((await loadTournament(database)).revision, before);
    for (const game of gamesFor(current.payload, "semis"))
      await save({ type: "score", id: game.id, a: 21, b: 15 });
    await save({ type: "prepare-finals" });
    await save({ type: "swap", team, first: 2, second: 5 });
    await assert.rejects(
      save({ type: "swap", team, first: 1, second: 4 }),
      /INVALID_DATA/,
    );
    await save({ type: "publish-lineups" });
    for (const game of gamesFor(current.payload, "finals"))
      await save({ type: "score", id: game.id, a: 23, b: 22 });
    assert.equal(Object.keys(current.payload.results).length, 80);
    assert.equal(seriesOutcome(current.payload, "F"), team);
    assert.deepEqual(current.payload.players[team], leagueNames);
    assert.deepEqual(await loadTournament(database), current);
    const count = await pg.query<{ count: number }>(
      "SELECT count(*)::int AS count FROM tournament12_operations",
    );
    assert.equal(count.rows[0].count, current.revision);
  } finally {
    await pg.close();
  }
});
