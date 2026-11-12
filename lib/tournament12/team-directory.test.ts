import { test } from "node:test";
import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import { TEAM_DIRECTORY, teamDisplay } from "./team-directory";
import { initialTournament, playerName, LEAGUE } from "./domain";

test("all six named teams have five members, a matching captain alias, and supplied logo", async () => {
  assert.equal(TEAM_DIRECTORY.length, 6);
  assert.equal(new Set(TEAM_DIRECTORY.map((t) => t.id)).size, 6);
  for (const team of TEAM_DIRECTORY) {
    assert.equal(team.members.length, 5, team.name);
    assert.equal(new Set(team.members).size, 5, team.name);
    assert.equal(
      team.members.filter((n) => n === team.captainMemberName).length,
      1,
      team.name,
    );
    await access(
      new URL(`../../public/tournament12/${team.logo}`, import.meta.url),
    );
  }
});
test("official November 12 roster matches all thirty supplied player positions", () => {
  const state = initialTournament();
  assert.deepEqual(state.players, {
    A: [
      "Sharan Jayadevaiah",
      "Nirav Shah",
      "Naresh Ramaiya",
      "Kaushik Ram",
      "Suren Seshadri",
    ],
    B: ["Kulwinder", "Jaynesh Doshi", "Srini", "Som", "Devang Bhagat"],
    C: ["Satish Mavuri", "Piyush", "Ankit Agarwal", "Monish", "Rajan"],
    D: [
      "Rajesh Radhakrishnan",
      "Aditya",
      "Bhanu Pamidi",
      "Badhri Krishnamoorthy",
      "Raja Rajendran",
    ],
    E: ["Venkata Ramanan", "Priyank Jain", "Arun V", "Basavaraj", "Shivesh"],
    F: ["Abhinay", "Balaji", "Prabhu", "Krishna", "Jaski Singh"],
  });
  assert.deepEqual(
    TEAM_DIRECTORY.map((t) => t.members.indexOf(t.captainMemberName) + 1),
    [4, 2, 3, 5, 3, 2],
  );
  assert.equal(
    TEAM_DIRECTORY.find((t) => t.id === "lamp-lighters")!.captain,
    "Arun Venkatesan",
  );
  assert.ok(
    TEAM_DIRECTORY.find((t) => t.id === "lamp-lighters")!.members.includes(
      "Arun V",
    ),
  );
  const first = LEAGUE[0];
  assert.deepEqual(
    first.pair.map((p) => playerName(state, first.a, p)),
    ["Aditya", "Bhanu Pamidi"],
  );
  assert.deepEqual(
    first.pair.map((p) => playerName(state, first.b, p)),
    ["Priyank Jain", "Arun V"],
  );
});
test("official names, logos and unique initials are the same in preview and connected modes", () => {
  const codes = ["A", "B", "C", "D", "E", "F"] as const;
  assert.deepEqual(
    codes.map((c) => teamDisplay(c).shortName),
    ["Dinkers", "Dhamaka", "Lobbers", "Patakha", "Lighters", "Smashers"],
  );
  assert.equal(teamDisplay("F").name, "Sutli Bomb Smashers");
  assert.deepEqual(
    codes.map((c) => teamDisplay(c).abbreviation),
    ["DD", "DAD", "SL", "PP", "LL", "SBS"],
  );
  assert.ok(codes.every((c) => !!teamDisplay(c).logo));
  const a = initialTournament(),
    b = initialTournament();
  a.players.A[0] = "Changed in practice";
  assert.equal(b.players.A[0], "Sharan Jayadevaiah");
});
