import { LEAGUE_FIXTURES } from "../../app/tournament/12/schedule";
import { leaguePlayerNames } from "./team-directory";

export const TEAMS = ["A", "B", "C", "D", "E", "F"] as const;
export type Team = (typeof TEAMS)[number];
export type Phase = "league" | "semis" | "finals";
export type Stage =
  "league" | "semis-setup" | "semis" | "finals-setup" | "finals";
export type Lineups = Record<Team, number[]>;
export interface Game {
  id: string;
  number: number;
  phase: Phase;
  series: string;
  a: Team;
  b: Team;
  pair: number[];
  lead?: string;
  time?: string;
  court?: number;
}
export interface Result {
  a: number;
  b: number;
  at: string;
  editor: string;
}
export interface Swap {
  team: Team;
  first: number;
  second: number;
  at: string;
  editor: string;
}
export interface TieResult extends Result {
  winner: Team;
  positions: number[];
}
export interface Tournament {
  version: 1;
  stage: Stage;
  players: Record<Team, string[]>;
  lineups: Record<"semis" | "finals", Lineups>;
  swaps: Record<"semis" | "finals", Swap[]>;
  seeds: Team[];
  finalists: { final: Team[]; third: Team[] };
  results: Record<string, Result>;
  tiebreaks: Record<string, TieResult>;
  history: { at: string; editor: string; note: string }[];
}
// IDs remain L1..L60 in persisted state; number maps directly to published L01..L60.
export const LEAGUE: Game[] = LEAGUE_FIXTURES.map((g) => ({
  id: `L${g.priority}`,
  number: g.priority,
  phase: "league",
  series: "league",
  a: g.home,
  b: g.away,
  pair: [...g.pair],
  lead: g.lead,
}));
const initialLineups = (): Lineups =>
  Object.fromEntries(TEAMS.map((t) => [t, [1, 2, 3, 4, 5]])) as Lineups;
const officialPlayers = leaguePlayerNames();
export function initialTournament(): Tournament {
  return {
    version: 1,
    stage: "league",
    players: structuredClone(officialPlayers),
    lineups: { semis: initialLineups(), finals: initialLineups() },
    swaps: { semis: [], finals: [] },
    seeds: [],
    finalists: { final: [], third: [] },
    results: {},
    tiebreaks: {},
    history: [],
  };
}
// Apply known organizer corrections to earlier previews; keep scores and playoff swaps intact.
export function fillOfficialLeagueNames(s: Tournament): Tournament {
  const previousPairs = [
    { team: "A" as Team, names: ["Kaushik Ram", "Naresh Ramaiya"] },
    { team: "C" as Team, names: ["Monish", "Ankit Agarwal"] },
  ];
  const corrections = previousPairs.filter(
    ({ team, names }) =>
      s.players[team][2] === names[0] && s.players[team][3] === names[1],
  );
  if (
    !corrections.length &&
    !TEAMS.some((t) => s.players[t].some((n) => !n.trim()))
  )
    return s;
  const next = structuredClone(s);
  for (const t of TEAMS)
    next.players[t] = next.players[t].map((n, i) =>
      n.trim() ? n : officialPlayers[t][i],
    );
  for (const { team } of corrections) {
    next.players[team][2] = officialPlayers[team][2];
    next.players[team][3] = officialPlayers[team][3];
  }
  return next;
}
export function playerName(
  s: Tournament,
  team: Team,
  slot: number,
  phase: Phase = "league",
) {
  const originalPosition =
    phase === "league" ? slot : s.lineups[phase][team][slot - 1];
  return (
    s.players[team][originalPosition - 1] ||
    officialPlayers[team][originalPosition - 1] ||
    `${team}${originalPosition}`
  );
}
export function gamesFor(s: Tournament, phase: Phase): Game[] {
  if (phase === "league") return LEAGUE;
  const pairs =
    phase === "semis"
      ? [
          [1, 2],
          [3, 4],
          [1, 5],
          [2, 3],
          [4, 5],
        ]
      : [
          [1, 3],
          [2, 4],
          [1, 4],
          [2, 5],
          [3, 5],
        ];
  const matchups: { id: string; teams: Team[]; baseCourt: number }[] =
    phase === "semis"
      ? [
          { id: "SF1", teams: [s.seeds[0], s.seeds[3]], baseCourt: 1 },
          { id: "SF2", teams: [s.seeds[1], s.seeds[2]], baseCourt: 3 },
        ]
      : [
          { id: "F", teams: s.finalists.final, baseCourt: 1 },
          { id: "P3", teams: s.finalists.third, baseCourt: 3 },
        ];
  return matchups
    .filter((m) => m.teams.length === 2 && m.teams.every(Boolean))
    .flatMap((m) =>
      pairs.map((pair, i) => ({
        id: `${m.id}-${i + 1}`,
        number: i + 1,
        phase,
        series: m.id,
        a: m.teams[0],
        b: m.teams[1],
        pair,
        court: m.baseCourt + (i % 2),
      })),
    );
}
export function scoreError(
  a: number,
  b: number,
  tiebreak = false,
): string | null {
  if (![a, b].every((n) => Number.isInteger(n) && n >= 0))
    return "Enter a whole-number score for both teams.";
  const hi = Math.max(a, b),
    lo = Math.min(a, b);
  if (tiebreak)
    return hi === 15 && lo < 15
      ? null
      : "A tiebreak finishes at 15, with the other team below 15.";
  if (
    (hi === 21 && lo <= 19) ||
    (hi === 22 && lo === 20) ||
    (hi === 23 && (lo === 21 || lo === 22))
  )
    return null;
  return "Final scores must be 21–0 through 21–19, 22–20, 23–21, or 23–22.";
}
export function scoreInputError(
  a: string,
  b: string,
  tiebreak = false,
): string | null {
  if (!a.trim() || !b.trim()) return "Enter a score for both teams.";
  if (![a, b].every((v) => /^\d{1,2}$/.test(v.trim())))
    return "Use whole numbers only (0–23). Check for a typing or pasting mistake.";
  return scoreError(Number(a), Number(b), tiebreak);
}
export const winPoints = (winner: number, loser: number) =>
  2 + (winner === 21 && loser <= 14 ? 1 : 0);
export interface Standing {
  team: Team;
  played: number;
  wins: number;
  losses: number;
  bonus: number;
  points: number;
  scored: number;
  conceded: number;
  pd: number;
  tied: boolean;
}
export function standings(s: Tournament, games: Game[] = LEAGUE): Standing[] {
  const rows = TEAMS.map((team) => ({
    team,
    played: 0,
    wins: 0,
    losses: 0,
    bonus: 0,
    points: 0,
    scored: 0,
    conceded: 0,
    pd: 0,
    tied: false,
  }));
  games.forEach((g) => {
    const r = s.results[g.id];
    if (!r) return;
    [g.a, g.b].forEach((team, i) => {
      const row = rows.find((r) => r.team === team)!;
      const own = i ? r.b : r.a;
      const other = i ? r.a : r.b;
      row.played++;
      row.scored += own;
      row.conceded += other;
      row.pd += own - other;
      if (own > other) {
        row.wins++;
        const pts = winPoints(own, other);
        row.points += pts;
        row.bonus += pts - 2;
      } else row.losses++;
    });
  });
  rows.sort(
    (a, b) =>
      b.points - a.points || b.pd - a.pd || a.team.localeCompare(b.team),
  );
  rows.forEach(
    (r) =>
      (r.tied = rows.some(
        (other) =>
          other.team !== r.team &&
          other.points === r.points &&
          other.pd === r.pd,
      )),
  );
  return rows;
}
export function seriesOutcome(
  s: Tournament,
  series: string,
): Team | "tie" | null {
  const games = [...gamesFor(s, "semis"), ...gamesFor(s, "finals")].filter(
    (g) => g.series === series,
  );
  if (games.length !== 5 || games.some((g) => !s.results[g.id])) return null;
  const [a, b] = standings(s, games).filter(
    (r) => r.team === games[0].a || r.team === games[0].b,
  );
  if (a.points === b.points && a.pd === b.pd)
    return s.tiebreaks[series]?.winner ?? "tie";
  return a.team;
}
export type Action =
  | { type: "score"; id: string; a: number; b: number }
  | { type: "names"; team: Team; names: string[] }
  | { type: "prepare-semis"; seeds: Team[] }
  | { type: "swap"; team: Team; first: number; second: number }
  | { type: "publish-lineups" }
  | { type: "prepare-finals" }
  | {
      type: "tiebreak";
      series: string;
      a: number;
      b: number;
      positions: number[];
    };
export function applyAction(
  current: Tournament,
  action: Action,
  editor: string,
  at = new Date().toISOString(),
): Tournament {
  if (!editor.trim()) throw new Error("Enter your name before saving.");
  const s = structuredClone(current);
  let note = "";
  if (action.type === "score") {
    const game = [
      ...LEAGUE,
      ...gamesFor(s, "semis"),
      ...gamesFor(s, "finals"),
    ].find((g) => g.id === action.id);
    if (!game || game.phase !== s.stage)
      throw new Error(
        "This round is locked. Scores can only change in the current round.",
      );
    const error = scoreError(action.a, action.b);
    if (error) throw new Error(error);
    const previous = s.results[game.id];
    s.results[game.id] = {
      a: action.a,
      b: action.b,
      at,
      editor: editor.trim(),
    };
    delete s.tiebreaks[game.series];
    note = `${game.id}: ${game.a} ${action.a}–${action.b} ${game.b}${previous ? ` (was ${previous.a}–${previous.b})` : ""}`;
  } else if (action.type === "names") {
    if (action.names.length !== 5 || action.names.some((n) => n.length > 80))
      throw new Error("Enter five names, each under 80 characters.");
    s.players[action.team] = action.names.map((n) => n.trim());
    note = `Updated Team ${action.team} player names`;
  } else if (action.type === "prepare-semis") {
    if (s.stage !== "league" || LEAGUE.some((g) => !s.results[g.id]))
      throw new Error("Save all 60 league results first.");
    const rows = standings(s);
    if (
      action.seeds.length !== 6 ||
      new Set(action.seeds).size !== 6 ||
      action.seeds.some((t) => !TEAMS.includes(t))
    )
      throw new Error("Rank all six teams once each.");
    const proposed = action.seeds.map((t) => rows.find((r) => r.team === t)!);
    if (
      proposed.some(
        (r, i) =>
          i > 0 &&
          (r.points > proposed[i - 1].points ||
            (r.points === proposed[i - 1].points && r.pd > proposed[i - 1].pd)),
      )
    )
      throw new Error(
        "Only teams tied on both points and differential can change order.",
      );
    s.seeds = action.seeds.slice(0, 4);
    s.stage = "semis-setup";
    note = `Confirmed semifinal seeds: ${s.seeds.join(", ")}`;
  } else if (action.type === "swap") {
    if (s.stage !== "semis-setup" && s.stage !== "finals-setup")
      throw new Error(
        "Position swaps are only available before a playoff round starts.",
      );
    if (!s.seeds.includes(action.team))
      throw new Error("Only qualifying teams can swap positions.");
    if (
      action.first === action.second ||
      ![action.first, action.second].every(
        (p) => Number.isInteger(p) && p >= 1 && p <= 5,
      )
    )
      throw new Error("Choose two different positions.");
    if (
      [...s.swaps.semis, ...s.swaps.finals].filter(
        (x) => x.team === action.team,
      ).length >= 2
    )
      throw new Error("This team has used both playoff swaps.");
    const phase = s.stage === "semis-setup" ? "semis" : "finals";
    const slots = s.lineups[phase][action.team];
    [slots[action.first - 1], slots[action.second - 1]] = [
      slots[action.second - 1],
      slots[action.first - 1],
    ];
    s.swaps[phase].push({
      team: action.team,
      first: action.first,
      second: action.second,
      at,
      editor: editor.trim(),
    });
    note = `Team ${action.team}: swapped P${action.first} and P${action.second} for ${phase === "semis" ? "semifinals" : "final / third place"}`;
  } else if (action.type === "publish-lineups") {
    if (s.stage !== "semis-setup" && s.stage !== "finals-setup")
      throw new Error("Lineups are already published.");
    s.stage = s.stage === "semis-setup" ? "semis" : "finals";
    note = `Published ${s.stage === "semis" ? "semifinal" : "final and third-place"} lineups`;
  } else if (action.type === "prepare-finals") {
    if (s.stage !== "semis") throw new Error("Finish the semifinals first.");
    const winners = ["SF1", "SF2"].map((id) => seriesOutcome(s, id));
    if (winners.some((w) => !w || w === "tie"))
      throw new Error(
        "Finish all semifinal games and resolve any tiebreaks first.",
      );
    s.finalists.final = winners as Team[];
    s.finalists.third = ["SF1", "SF2"].map((id, i) => {
      const g = gamesFor(s, "semis").find((g) => g.series === id)!;
      return g.a === winners[i] ? g.b : g.a;
    });
    s.lineups.finals = structuredClone(s.lineups.semis);
    s.stage = "finals-setup";
    note = "Set up final and third-place series";
  } else if (action.type === "tiebreak") {
    if (s.stage !== "semis" && s.stage !== "finals")
      throw new Error(
        "Tiebreaks are only available in the current playoff round.",
      );
    // A correction is checked against the five regular games, excluding the prior tiebreak.
    const withoutPreviousTie = { ...s, tiebreaks: { ...s.tiebreaks } };
    delete withoutPreviousTie.tiebreaks[action.series];
    if (seriesOutcome(withoutPreviousTie, action.series) !== "tie")
      throw new Error(
        "A tiebreak is only needed when win-points and differential are equal.",
      );
    const g = gamesFor(s, s.stage).find((g) => g.series === action.series);
    if (!g) throw new Error("Series not found.");
    const error = scoreError(action.a, action.b, true);
    if (error) throw new Error(error);
    if (
      action.positions.length !== 2 ||
      new Set(action.positions).size !== 2 ||
      action.positions.some((n) => !Number.isInteger(n) || n < 1 || n > 5)
    )
      throw new Error("Choose two different player positions.");
    s.tiebreaks[action.series] = {
      a: action.a,
      b: action.b,
      positions: action.positions,
      winner: action.a > action.b ? g.a : g.b,
      at,
      editor: editor.trim(),
    };
    note = `${action.series} tiebreak: ${g.a} ${action.a}–${action.b} ${g.b}`;
  }
  s.history = [{ at, editor: editor.trim(), note }, ...s.history].slice(0, 200);
  return s;
}
export function resultsCsv(s: Tournament) {
  const rows: (string | number)[][] = [
    [
      "Game",
      "Round",
      "Team A",
      "Players A",
      "Team B",
      "Players B",
      "Score A",
      "Score B",
      "Entered by",
      "Saved at",
    ],
  ];
  [...LEAGUE, ...gamesFor(s, "semis"), ...gamesFor(s, "finals")].forEach(
    (g) => {
      const r = s.results[g.id];
      rows.push([
        g.id,
        g.phase,
        g.a,
        g.pair.map((p) => playerName(s, g.a, p, g.phase)).join(" + "),
        g.b,
        g.pair.map((p) => playerName(s, g.b, p, g.phase)).join(" + "),
        r?.a ?? "",
        r?.b ?? "",
        r?.editor ?? "",
        r?.at ?? "",
      ]);
    },
  );
  Object.entries(s.tiebreaks).forEach(([id, r]) => {
    const g = [...gamesFor(s, "semis"), ...gamesFor(s, "finals")].find(
      (g) => g.series === id,
    )!;
    rows.push([
      `${id}-TB`,
      "tiebreak",
      g.a,
      r.positions.map((p) => playerName(s, g.a, p, g.phase)).join(" + "),
      g.b,
      r.positions.map((p) => playerName(s, g.b, p, g.phase)).join(" + "),
      r.a,
      r.b,
      r.editor,
      r.at,
    ]);
  });
  return (
    "\uFEFF" +
    rows
      .map((row) =>
        row
          .map((v) => {
            const t = String(v);
            return (
              '"' +
              (/^[=+@\-\t\r]/.test(t) ? "'" + t : t).replaceAll('"', '""') +
              '"'
            );
          })
          .join(","),
      )
      .join("\r\n")
  );
}
