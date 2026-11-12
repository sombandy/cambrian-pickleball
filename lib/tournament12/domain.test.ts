import { test } from "node:test";
import assert from "node:assert/strict";
import {
  applyAction,
  gamesFor,
  initialTournament,
  LEAGUE,
  playerName,
  resultsCsv,
  scoreError,
  scoreInputError,
  seriesOutcome,
  standings,
  TEAMS,
  winPoints,
  type Game,
  type Tournament,
} from "./domain";
const editor = "Test organizer";
const act = (s: Tournament, a: Parameters<typeof applyAction>[1]) =>
  applyAction(s, a, editor);
function finish(s: Tournament, games: Game[]) {
  for (const g of games)
    s = act(s, {
      type: "score",
      id: g.id,
      a: g.a < g.b ? 21 : 10,
      b: g.a < g.b ? 10 : 21,
    });
  return s;
}
function readySemis() {
  const s = finish(initialTournament(), LEAGUE);
  return act(s, {
    type: "prepare-semis",
    seeds: standings(s).map((r) => r.team),
  });
}

test("official schedule: 60 unique games, 20 per team, four per opponent", () => {
  assert.equal(LEAGUE.length, 60);
  assert.equal(new Set(LEAGUE.map((g) => g.id)).size, 60);
  for (const team of TEAMS) {
    assert.equal(LEAGUE.filter((g) => g.a === team || g.b === team).length, 20);
    for (const other of TEAMS.filter((t) => t !== team))
      assert.equal(
        LEAGUE.filter(
          (g) => [g.a, g.b].includes(team) && [g.a, g.b].includes(other),
        ).length,
        4,
      );
    for (let p = 1; p <= 5; p++) {
      assert.equal(
        LEAGUE.filter((g) => [g.a, g.b].includes(team) && g.pair.includes(p))
          .length,
        8,
      );
      assert.equal(
        LEAGUE.slice(0, 30).filter((g) => g.lead === `${team}${p}`).length,
        1,
      );
      assert.equal(
        LEAGUE.slice(30).filter((g) => g.lead === `${team}${p}`).length,
        1,
      );
      for (let other = p + 1; other <= 5; other++) {
        const pairGames = LEAGUE.filter(
          (g) =>
            [g.a, g.b].includes(team) &&
            g.pair.includes(p) &&
            g.pair.includes(other),
        );
        assert.equal(pairGames.length, 2);
        assert.equal(
          new Set(pairGames.map((g) => (g.a === team ? g.b : g.a))).size,
          2,
        );
      }
    }
  }
});
test("all possible final scores through 24: only legal scores accepted in both orientations", () => {
  for (let a = 0; a <= 24; a++)
    for (let b = 0; b <= 24; b++) {
      const hi = Math.max(a, b),
        lo = Math.min(a, b);
      const legal =
        (hi === 21 && lo <= 19) ||
        (hi === 22 && lo === 20) ||
        (hi === 23 && [21, 22].includes(lo));
      assert.equal(scoreError(a, b) === null, legal, `${a}-${b}`);
    }
  for (const n of [-1, Infinity, NaN, 1.5]) assert.ok(scoreError(21, n));
});
test("bonus boundary is exactly 21–14; no bonus on deuce scores", () => {
  assert.equal(winPoints(21, 14), 3);
  assert.equal(winPoints(21, 15), 2);
  assert.equal(winPoints(21, 0), 3);
  assert.equal(winPoints(22, 20), 2);
  assert.equal(winPoints(23, 21), 2);
  assert.equal(winPoints(23, 22), 2);
});
test("raw input rejects blanks, decimal, scientific, signed, and pasted malformed scores without coercion", () => {
  for (const value of [
    "",
    " ",
    "21.5",
    "21.0",
    "2e1",
    "+21",
    "-1",
    "021",
    "213",
    "21 points",
    "2a1",
  ])
    assert.ok(scoreInputError(value, "14"), value);
  assert.equal(scoreInputError("23", "22"), null);
  assert.equal(scoreInputError(" 21 ", "14"), null);
  assert.ok(scoreInputError("21", "20"));
  assert.equal(scoreInputError("15", "14", true), null);
});
test("standings count points/differential and score corrections replace previous totals", () => {
  let s = act(initialTournament(), { type: "score", id: "L1", a: 21, b: 14 });
  const d = standings(s).find((r) => r.team === "D")!;
  assert.deepEqual(
    [d.played, d.wins, d.points, d.pd, d.bonus],
    [1, 1, 3, 7, 1],
  );
  s = act(s, { type: "score", id: "L1", a: 18, b: 21 });
  const updated = standings(s);
  assert.equal(updated.find((r) => r.team === "D")!.points, 0);
  assert.equal(updated.find((r) => r.team === "E")!.points, 2);
  assert.equal(
    updated.reduce((v, r) => v + r.pd, 0),
    0,
  );
  assert.match(s.history[0].note, /was 21–14/);
});
test("no seed before all games; no non-tied reorder; exactly four qualify", () => {
  assert.throws(
    () =>
      act(initialTournament(), { type: "prepare-semis", seeds: [...TEAMS] }),
    /60/,
  );
  const finished = finish(initialTournament(), LEAGUE);
  assert.throws(
    () =>
      act(finished, {
        type: "prepare-semis",
        seeds: ["B", "A", "C", "D", "E", "F"],
      }),
    /tied/,
  );
  assert.throws(
    () =>
      act(finished, {
        type: "prepare-semis",
        seeds: ["A", "A", "C", "D", "E", "F"],
      }),
    /once/,
  );
  const s = readySemis();
  assert.deepEqual(s.seeds, ["A", "B", "C", "D"]);
  assert.equal(gamesFor(s, "semis").length, 10);
});
test("ties are marked, never resolved silently by alphabetical order", () => {
  const rows = standings(initialTournament());
  assert.ok(rows.every((r) => r.tied));
  const s = finish(initialTournament(), LEAGUE);
  for (const g of LEAGUE)
    s.results[g.id] = { a: 21, b: 19, at: "test", editor };
  const rows2 = standings(s);
  for (const r of rows2)
    assert.equal(
      r.tied,
      rows2.some(
        (x) => x.team !== r.team && x.points === r.points && x.pd === r.pd,
      ),
    );
});
test("swapping names is phase-specific; history and league results stay intact", () => {
  let s = act(initialTournament(), {
    type: "names",
    team: "A",
    names: ["Alex", "Bo", "Chris", "Devi", "Em"],
  });
  s = finish(s, LEAGUE);
  const leagueCopy = structuredClone(s.results);
  s = act(s, { type: "prepare-semis", seeds: standings(s).map((r) => r.team) });
  s = act(s, { type: "swap", team: "A", first: 1, second: 3 });
  assert.equal(playerName(s, "A", 1), "Alex");
  assert.equal(playerName(s, "A", 1, "semis"), "Chris");
  assert.deepEqual(s.results, leagueCopy);
  assert.deepEqual(s.players.A, ["Alex", "Bo", "Chris", "Devi", "Em"]);
  assert.throws(
    () => act(s, { type: "swap", team: "E", first: 1, second: 2 }),
    /qualifying/,
  );
  assert.throws(
    () => act(s, { type: "swap", team: "A", first: 1, second: 1 }),
    /different/,
  );
});
test("two swaps maximum across both playoff phases; published lineups lock", () => {
  let s = readySemis();
  s = act(s, { type: "swap", team: "A", first: 1, second: 2 });
  s = act(s, { type: "publish-lineups" });
  assert.throws(
    () => act(s, { type: "swap", team: "A", first: 1, second: 2 }),
    /only/,
  );
  assert.throws(
    () => act(s, { type: "score", id: "L1", a: 21, b: 10 }),
    /locked/,
  );
  s = finish(s, gamesFor(s, "semis"));
  const semis = structuredClone(s.lineups.semis);
  s = act(s, { type: "prepare-finals" });
  assert.deepEqual(s.lineups.finals, semis);
  s = act(s, { type: "swap", team: "A", first: 1, second: 3 });
  assert.deepEqual(s.lineups.semis, semis);
  assert.throws(
    () => act(s, { type: "swap", team: "A", first: 1, second: 4 }),
    /both/,
  );
});
test("playoff pairings: every player plays twice; every pair once over both rounds", () => {
  let s = readySemis();
  s = act(s, { type: "publish-lineups" });
  s = finish(s, gamesFor(s, "semis"));
  s = act(s, { type: "prepare-finals" });
  for (const prefix of ["SF1", "SF2", "F", "P3"]) {
    const games = [...gamesFor(s, "semis"), ...gamesFor(s, "finals")].filter(
      (g) => g.series === prefix,
    );
    assert.equal(games.length, 5);
    for (let p = 1; p <= 5; p++)
      assert.equal(games.filter((g) => g.pair.includes(p)).length, 2);
  }
  assert.equal(
    new Set(
      [
        ...gamesFor(s, "semis").filter((g) => g.series === "SF1"),
        ...gamesFor(s, "finals").filter((g) => g.series === "F"),
      ].map((g) => g.pair.join("")),
    ).size,
    10,
  );
});
test("series uses bonus win-points and waits for all five results", () => {
  let s = act(readySemis(), { type: "publish-lineups" });
  const games = gamesFor(s, "semis").filter((g) => g.series === "SF1");
  games.slice(0, 4).forEach((g, i) => {
    s = act(s, {
      type: "score",
      id: g.id,
      a: i < 2 ? 21 : 19,
      b: i < 2 ? 10 : 21,
    });
  });
  assert.equal(seriesOutcome(s, "SF1"), null);
  assert.throws(() => act(s, { type: "prepare-finals" }), /Finish/);
  s = act(s, { type: "score", id: games[4].id, a: 19, b: 21 });
  // Two bonus wins = 6 points, three regular wins = 6; PD decides in favor of A.
  assert.equal(seriesOutcome(s, "SF1"), "A");
});
test("a tied series requires a recorded tiebreak; editing scores invalidates it", () => {
  let s = act(readySemis(), { type: "publish-lineups" });
  const games = gamesFor(s, "semis").filter((g) => g.series === "SF1");
  // A wins 21–13 twice (+16 PD, 6 pts); D wins 21–16,21–16,21–15 (-16 PD, 6 pts).
  const scores = [
    [21, 13],
    [21, 13],
    [16, 21],
    [16, 21],
    [15, 21],
  ];
  games.forEach((g, i) => {
    s = act(s, { type: "score", id: g.id, a: scores[i][0], b: scores[i][1] });
  });
  assert.equal(seriesOutcome(s, "SF1"), "tie");
  assert.throws(
    () =>
      act(s, {
        type: "tiebreak",
        series: "SF1",
        a: 15,
        b: 14,
        positions: [2, 2],
      }),
    /different/,
  );
  s = act(s, {
    type: "tiebreak",
    series: "SF1",
    a: 15,
    b: 14,
    positions: [2, 5],
  });
  assert.equal(seriesOutcome(s, "SF1"), "A");
  s = act(s, {
    type: "tiebreak",
    series: "SF1",
    a: 13,
    b: 15,
    positions: [2, 5],
  });
  assert.equal(seriesOutcome(s, "SF1"), "D");
  s = act(s, { type: "score", id: games[0].id, a: 21, b: 13 });
  assert.equal(seriesOutcome(s, "SF1"), "tie");
});
test("complete 80-game tournament determines champion and third place", () => {
  let s = act(readySemis(), { type: "publish-lineups" });
  s = finish(s, gamesFor(s, "semis"));
  s = act(s, { type: "prepare-finals" });
  assert.deepEqual(s.finalists.final, ["A", "B"]);
  assert.deepEqual(s.finalists.third, ["D", "C"]);
  s = act(s, { type: "publish-lineups" });
  s = finish(s, gamesFor(s, "finals"));
  assert.equal(Object.keys(s.results).length, 80);
  assert.equal(seriesOutcome(s, "F"), "A");
  assert.equal(seriesOutcome(s, "P3"), "C");
});
test("CSV includes unplayed fixtures, names, and escapes formula-like player names", () => {
  const s = act(initialTournament(), {
    type: "names",
    team: "A",
    names: ["=1+2", "Name, comma", 'A "quote"', "山田", "Long name"],
  });
  const csv = resultsCsv(s);
  assert.equal(csv.split("\r\n").length, 61);
  assert.ok(csv.startsWith("\uFEFF"));
  assert.match(csv, /'=1\+2/);
  assert.match(csv, /Name, comma/);
  assert.match(csv, /""quote""/);
});
