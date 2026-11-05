// Fixtures and assigned-court schedule for Tournament 12: one pool, then
// semifinals and a final. Every game matches the same numbered pair (A1+A2 v
// B1+B2), so a game is fully described by its two teams and one pair.

export const TEAMS = ["A", "B", "C", "D", "E", "F"] as const;
export type Team = (typeof TEAMS)[number];

export const POSITIONS = [1, 2, 3, 4, 5] as const;
export type PlayerId = `${Team}${(typeof POSITIONS)[number]}`;

export type Pair = [number, number];

const PLAYOFF_STAGES = ["Semifinals", "Final"] as const;
export type Stage = "League" | (typeof PLAYOFF_STAGES)[number];

export type Slot = {
  number: number;
  // Planned minutes after the 11 AM start, including preceding breaks.
  startMinutes: number;
  time: string;
  stage: Stage;
  // Time range of the break that follows this slot, if any.
  breakAfter?: string;
};

// A side is a team letter in the league, "S1"–"S4" in the semifinals and
// "W1"/"W2" (semifinal winners) in the final.
type Game = { slot: number; court: number; home: string; away: string; pair: Pair };

export const SLOT_MINUTES = 20;
const BREAK_MINUTES = 10;
const MAX_PLAY_MINUTES = 60;

// Assigned Courts league: 15 slots on 4 courts. Each team plays every other
// team 4 times, each time with a different partnership, and every team plays in
// every slot. Every player plays eight games and never three consecutive slots.
const LEAGUE: [Team, Team, Pair][][] = [
  [["A", "E", [1, 4]], ["F", "B", [3, 5]], ["F", "D", [1, 4]], ["E", "C", [3, 5]]],
  [["A", "D", [3, 5]], ["D", "E", [1, 2]], ["A", "F", [1, 2]], ["B", "C", [1, 4]]],
  [["C", "F", [3, 4]], ["D", "E", [3, 4]], ["B", "C", [2, 5]], ["A", "B", [3, 4]]],
  [["F", "B", [1, 5]], ["C", "F", [2, 3]], ["A", "D", [1, 5]], ["E", "C", [1, 5]]],
  [["F", "B", [1, 4]], ["E", "C", [1, 4]], ["A", "B", [2, 3]], ["D", "E", [2, 3]]],
  [["B", "E", [2, 5]], ["A", "D", [1, 4]], ["C", "D", [2, 5]], ["A", "F", [2, 5]]],
  [["B", "E", [3, 4]], ["A", "C", [1, 5]], ["C", "D", [3, 4]], ["A", "F", [3, 4]]],
  [["F", "D", [1, 3]], ["A", "C", [2, 3]], ["F", "D", [2, 5]], ["B", "E", [1, 2]]],
  [["C", "F", [4, 5]], ["D", "E", [4, 5]], ["B", "E", [1, 3]], ["A", "B", [4, 5]]],
  [["F", "B", [2, 4]], ["C", "D", [1, 3]], ["A", "F", [1, 3]], ["E", "C", [2, 4]]],
  [["B", "C", [3, 5]], ["F", "D", [3, 5]], ["A", "D", [2, 4]], ["A", "E", [3, 5]]],
  [["E", "F", [2, 4]], ["A", "B", [1, 2]], ["E", "F", [1, 5]], ["C", "D", [1, 2]]],
  [["A", "C", [4, 5]], ["B", "C", [1, 3]], ["E", "F", [2, 3]], ["D", "B", [4, 5]]],
  [["D", "B", [2, 3]], ["E", "F", [4, 5]], ["A", "E", [1, 3]], ["A", "C", [2, 4]]],
  [["A", "E", [2, 5]], ["C", "F", [1, 2]], ["D", "B", [2, 4]], ["D", "B", [1, 5]]],
];

// Open Courts league: the same 60 fixtures in queue order, in planning batches
// of four. No player appears twice in any five consecutive games, so when a
// court frees up the next game's players are normally all off court. Adjacent
// batches share only four players (the minimum: a five-player team appearing
// three times across two batches must repeat someone), and those repeats sit in
// the last two games of the next batch, so its first two games are always fully
// rested. The fourth value is the game lead: a participant who did not play in
// the preceding batch. Everyone leads twice, once in games 1–30 and once in 31–60.
const OPEN_COURTS: [Team, Team, Pair, PlayerId][][] = [
  [["D", "E", [2, 3], "D2"], ["A", "B", [2, 3], "A3"], ["D", "B", [1, 5], "B5"], ["C", "F", [2, 3], "C3"]],
  [["E", "F", [4, 5], "F4"], ["A", "C", [4, 5], "A5"], ["D", "B", [2, 4], "B4"], ["A", "E", [1, 3], "A1"]],
  [["F", "D", [1, 3], "F1"], ["B", "C", [1, 3], "C1"], ["A", "E", [2, 5], "E2"], ["F", "D", [2, 5], "F2"]],
  [["B", "C", [2, 5], "C2"], ["A", "E", [1, 4], "E1"], ["F", "D", [1, 4], "D4"], ["B", "C", [1, 4], "C4"]],
  [["A", "E", [3, 5], "E3"], ["F", "D", [3, 5], "D5"], ["B", "C", [3, 5], "B3"], ["A", "F", [1, 2], "A2"]],
  [["B", "E", [1, 2], "B2"], ["C", "D", [1, 2], "D1"], ["A", "F", [3, 4], "A4"], ["B", "E", [3, 4], "E4"]],
  [["C", "D", [3, 4], "D3"], ["A", "F", [2, 5], "F5"], ["B", "E", [2, 5], "E5"], ["C", "D", [2, 5], "C5"]],
  [["A", "F", [1, 3], "F3"], ["B", "E", [1, 3], "B1"], ["C", "D", [1, 3], "C1"], ["E", "F", [2, 4], "F4"]],
  [["A", "C", [2, 4], "C4"], ["D", "B", [4, 5], "D4"], ["E", "F", [1, 5], "E5"], ["A", "C", [1, 5], "C5"]],
  [["D", "B", [2, 3], "B2"], ["E", "F", [2, 3], "F3"], ["A", "C", [2, 3], "A3"], ["F", "B", [1, 4], "B1"]],
  [["A", "D", [1, 4], "D1"], ["E", "C", [1, 4], "E4"], ["F", "B", [3, 5], "B5"], ["A", "D", [3, 5], "A5"]],
  [["E", "C", [3, 5], "E3"], ["F", "B", [2, 4], "B4"], ["A", "D", [2, 4], "D2"], ["E", "C", [2, 4], "C2"]],
  [["F", "B", [1, 5], "F1"], ["A", "D", [1, 5], "A1"], ["E", "C", [1, 5], "E1"], ["A", "B", [3, 4], "B3"]],
  [["C", "F", [3, 4], "C3"], ["D", "E", [3, 4], "D3"], ["A", "B", [1, 2], "A2"], ["C", "F", [1, 2], "F2"]],
  [["D", "E", [1, 2], "E2"], ["A", "B", [4, 5], "A4"], ["C", "F", [4, 5], "F5"], ["D", "E", [4, 5], "D5"]],
];

export type LeagueFixture = {
  id: string;
  stage: "League";
  priority: number;
  home: Team;
  away: Team;
  pair: Pair;
  lead: PlayerId;
};

// Published once, left to right through the league order. Filtering for a
// player or skipping a blocked game must never renumber these IDs. Court and
// start/end times belong to execution, not to the shared-queue fixture.
export const LEAGUE_FIXTURES: LeagueFixture[] = OPEN_COURTS.flat().map(([home, away, pair, lead], idx) => ({
  id: `L${String(idx + 1).padStart(2, "0")}`,
  stage: "League",
  priority: idx + 1,
  home,
  away,
  pair,
  lead,
}));

export function leagueFixturesFor(team: Team, position: number) {
  return LEAGUE_FIXTURES
    .filter((game) => (game.home === team || game.away === team) && game.pair.includes(position))
    .map((game) => ({
      ...game,
      partner: game.pair[0] === position ? game.pair[1] : game.pair[0],
      opponent: game.home === team ? game.away : game.home,
    }));
}

// Semifinal 1 (Seed 1 v 4) on Courts 1–2, Semifinal 2 (Seed 2 v 3) on Courts 3–4.
const SEMIFINALS: [string, string][] = [
  ["S1", "S4"],
  ["S2", "S3"],
];

// Five-game series: each player plays exactly 2 games per round. The final
// uses the five partnerships the semifinals did not.
const PLAYOFF_PAIRS: Record<(typeof PLAYOFF_STAGES)[number], Pair[][]> = {
  Semifinals: [[[1, 2], [3, 4]], [[1, 5], [2, 3]], [[4, 5]]],
  Final: [[[1, 3], [2, 4]], [[1, 4], [2, 5]], [[3, 5]]],
};

type Row = { stage: Stage; games: Omit<Game, "slot">[] };

const PLAYOFF_ROWS: Row[] = [
  ...PLAYOFF_PAIRS.Semifinals.map((pairs): Row => ({
    stage: "Semifinals",
    games: SEMIFINALS.flatMap(([home, away], idx) =>
      pairs.map((pair, j) => ({ court: idx * 2 + j + 1, home, away, pair })),
    ),
  })),
  ...PLAYOFF_PAIRS.Final.map((pairs): Row => ({
    stage: "Final",
    games: pairs.map((pair, j) => ({ court: j + 1, home: "W1", away: "W2", pair })),
  })),
];

// Minutes after 11:00 → "12:04".
function clock(minutes: number) {
  const total = 11 * 60 + minutes;
  const hour = Math.floor(total / 60);
  return `${hour % 12 || 12}:${String(total % 60).padStart(2, "0")}`;
}

// A break goes in whenever another slot would push play past 60 minutes.
function buildSchedule() {
  const rows: Row[] = [
    ...LEAGUE.map((row): Row => ({
      stage: "League",
      games: row.map(([home, away, pair], idx) => ({ court: idx + 1, home, away, pair })),
    })),
    ...PLAYOFF_ROWS,
  ];
  const slots: Slot[] = [];
  const games: Game[] = [];
  let time = 0;
  let sinceBreak = 0;
  rows.forEach((row, idx) => {
    if (sinceBreak + SLOT_MINUTES > MAX_PLAY_MINUTES) {
      slots[idx - 1].breakAfter = `${clock(time)}–${clock(time + BREAK_MINUTES)}`;
      time += BREAK_MINUTES;
      sinceBreak = 0;
    }
    const number = idx + 1;
    slots.push({ number, startMinutes: time, time: `${clock(time)}–${clock(time + SLOT_MINUTES)}`, stage: row.stage });
    games.push(...row.games.map((game) => ({ ...game, slot: number })));
    time += SLOT_MINUTES;
    sinceBreak += SLOT_MINUTES;
  });
  return { slots, games, finish: clock(time) };
}

export const { slots: SLOTS, games: GAMES, finish: FINISH_TIME } = buildSchedule();

export const LEAGUE_SLOTS = SLOTS.filter((slot) => slot.stage === "League");
export const PLAYOFF_SLOTS = SLOTS.filter((slot) => slot.stage !== "League");

// Open Courts uses consecutive 20-minute planning groups without league breaks.
// Index by published priority so filtering never changes a game's estimate.
export const TENTATIVE_LEAGUE_STARTS = OPEN_COURTS.flatMap((row, idx) =>
  row.map(() => ({
    batch: idx,
    minutes: idx * SLOT_MINUTES,
    label: clock(idx * SLOT_MINUTES),
  })),
);

// Evaluate against the complete tentative schedule, never a filtered player
// list. These are planned consecutive appearances, not live availability.
export function backToBackPlayersFor(game: LeagueFixture): PlayerId[] {
  const start = TENTATIVE_LEAGUE_STARTS[game.priority - 1].minutes;
  const precedingGames = LEAGUE_FIXTURES.filter((previous) =>
    TENTATIVE_LEAGUE_STARTS[previous.priority - 1].minutes + SLOT_MINUTES === start,
  );
  return [game.home, game.away].flatMap((team) =>
    game.pair
      .filter((position) => precedingGames.some((previous) =>
        (previous.home === team || previous.away === team) && previous.pair.includes(position),
      ))
      .map((position) => `${team}${position}` as PlayerId),
  );
}

export function gamesIn(slot: Slot) {
  return GAMES.filter((game) => game.slot === slot.number);
}

// "A" + 2 → "A2"; "S3" + 2 → "S3.2"; "W1" + 2 → "W1.2".
function playerLabel(label: string, position: number) {
  return (TEAMS as readonly string[]).includes(label) ? `${label}${position}` : `${label}.${position}`;
}

export function pairLabel(label: string, pair: Pair) {
  return `${playerLabel(label, pair[0])}+${playerLabel(label, pair[1])}`;
}

// ---- Per-player view -----------------------------------------------------

export type PlayerSlot =
  | { kind: "play"; slot: Slot; court: number; partner: number; opponent: string }
  // The team is playing, on `courts`, but this player sits out.
  | { kind: "rest"; slot: Slot; courts: number[] }
  | { kind: "idle"; slot: Slot };

export function leagueFor(team: Team, position: number): PlayerSlot[] {
  return LEAGUE_SLOTS.map((slot) => {
    const games = gamesIn(slot).filter((game) => game.home === team || game.away === team);
    const mine = games.find((game) => game.pair.includes(position));
    if (mine) {
      return {
        kind: "play",
        slot,
        court: mine.court,
        partner: mine.pair[0] === position ? mine.pair[1] : mine.pair[0],
        opponent: mine.home === team ? mine.away : mine.home,
      };
    }
    if (games.length === 0) return { kind: "idle", slot };
    return { kind: "rest", slot, courts: games.map((game) => game.court) };
  });
}

// Every team in a playoff stage plays the same pairs, slot by slot.
export const PLAYOFF_ROUNDS = PLAYOFF_STAGES.map((stage) => ({
  stage,
  slots: PLAYOFF_SLOTS.filter((slot) => slot.stage === stage).map((slot, idx) => ({
    slot,
    pairs: PLAYOFF_PAIRS[stage][idx],
  })),
}));
