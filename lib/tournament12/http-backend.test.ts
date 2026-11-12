import { test } from "node:test";
import assert from "node:assert/strict";
import { httpBackend } from "./http-backend";
import { initialTournament } from "./domain";
import { createGoogleSpreadsheet, workbookSheets } from "./export";

test("same-origin transport sends action, revision and operation; never trusts a client state snapshot", async () => {
  let url = "",
    options: RequestInit | undefined;
  const backend = httpBackend(async (u, o) => {
    url = String(u);
    options = o;
    return Response.json({
      payload: initialTournament(),
      revision: 1,
      updated_at: new Date().toISOString(),
    });
  });
  const action = { type: "score" as const, id: "L1", a: 21, b: 14 },
    operation = crypto.randomUUID();
  await backend.save({
    action,
    payload: initialTournament(),
    revision: 0,
    operation,
    editor: "Som",
  });
  assert.equal(url, "/api/tournament/12/scores");
  assert.equal(options?.credentials, "same-origin");
  assert.equal(new Headers(options?.headers).get("X-CPL-Editor"), "1");
  assert.deepEqual(JSON.parse(String(options?.body)), {
    action,
    revision: 0,
    operation,
    editor: "Som",
  });
});
test("transport preserves stale/denied error codes for safe recovery and fails closed on access checks", async () => {
  for (const code of ["STALE_STATE", "NOT_EDITOR", "INVALID_DATA"]) {
    const backend = httpBackend(async () =>
      Response.json({ error: code }, { status: 403 }),
    );
    await assert.rejects(backend.load(), new RegExp(code));
    await assert.rejects(backend.canEdit!(), new RegExp(code));
  }
});
test("Google export creates a private workbook and distinguishes text from formulas", async () => {
  const bodies: Record<string, unknown>[] = [];
  const state = initialTournament();
  state.players.A[0] = "=not-a-formula";
  const request: typeof fetch = async (_url, options) => {
    bodies.push(JSON.parse(String(options?.body)));
    return Response.json(
      bodies.length === 1 ? { spreadsheetId: "test-sheet" } : {},
    );
  };
  assert.match(
    await createGoogleSpreadsheet(
      workbookSheets(state, "2026-11-14T20:00:00Z"),
      "2026-11-14T20:00:00Z",
      "token",
      request,
    ),
    /test-sheet/,
  );
  assert.equal(bodies[0].permissions, undefined);
  assert.ok(
    JSON.stringify(bodies[1]).includes('"stringValue":"=not-a-formula"'),
  );
  assert.ok(JSON.stringify(bodies[1]).includes('"formulaValue":"=IF('));
});
test("Google partial failure never produces a success link", async () => {
  let calls = 0;
  const at = new Date().toISOString();
  await assert.rejects(
    createGoogleSpreadsheet(
      workbookSheets(initialTournament(), at),
      at,
      "token",
      async () =>
        ++calls === 1
          ? Response.json({ spreadsheetId: "partial" })
          : Response.json({}, { status: 503 }),
    ),
    /created a file/,
  );
});
