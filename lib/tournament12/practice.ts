import {
  applyAction,
  gamesFor,
  initialTournament,
  LEAGUE,
  standings,
  type Tournament,
} from "./domain";
export type Scenario =
  "fresh" | "league-complete" | "semis-setup" | "finals-setup";
export function practiceScenario(scenario: Scenario): Tournament {
  let s = initialTournament();
  if (scenario === "fresh") return s;
  for (const g of LEAGUE)
    s = applyAction(
      s,
      {
        type: "score",
        id: g.id,
        a: g.a < g.b ? 21 : 10,
        b: g.a < g.b ? 10 : 21,
      },
      "Sample organizer",
    );
  if (scenario === "league-complete") return s;
  s = applyAction(
    s,
    { type: "prepare-semis", seeds: standings(s).map((r) => r.team) },
    "Sample organizer",
  );
  if (scenario === "semis-setup") return s;
  s = applyAction(s, { type: "publish-lineups" }, "Sample organizer");
  for (const g of gamesFor(s, "semis"))
    s = applyAction(
      s,
      {
        type: "score",
        id: g.id,
        a: g.a < g.b ? 21 : 10,
        b: g.a < g.b ? 10 : 21,
      },
      "Sample organizer",
    );
  return applyAction(s, { type: "prepare-finals" }, "Sample organizer");
}
