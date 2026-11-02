// Court-by-court schedule for Tournament 12: one pool, then semifinals and a
// final. Every game matches the same numbered pair on both sides (A1+A2 v
// B1+B2), so a game is fully described by its two teams and one pair.

export const TEAMS = ["A", "B", "C", "D", "E", "F"] as const;
export type Team = (typeof TEAMS)[number];

export const POSITIONS = [1, 2, 3, 4, 5] as const;

export type Pair = [number, number];

const PLAYOFF_STAGES = ["Semifinals", "Final"] as const;
export type Stage = "League" | (typeof PLAYOFF_STAGES)[number];

export type Slot = {
  number: number;
  time: string;
  stage: Stage;
  // Time range of the break that follows this slot, if any.
  breakAfter?: string;
};

// A side is a team letter in the league, "S1"–"S4" in the semifinals and
// "W1"/"W2" (semifinal winners) in the final.
type Game = { slot: number; court: number; home: string; away: string; pair: Pair };

const SLOT_MINUTES = 18;
const BREAK_MINUTES = 10;
const MAX_PLAY_MINUTES = 60;

// League: 15 slots on 4 courts. Each team plays every other team 4 times,
// each time with a different partnership, and every team plays in every slot.
const LEAGUE: [Team, Team, Pair][][] = [
  [["B", "E", [3, 4]], ["F", "D", [1, 3]], ["A", "C", [2, 3]], ["C", "F", [4, 5]]],
  [["B", "E", [2, 5]], ["F", "D", [2, 5]], ["F", "B", [1, 4]], ["A", "C", [4, 5]]],
  [["A", "E", [1, 4]], ["A", "D", [3, 5]], ["F", "B", [1, 5]], ["C", "F", [3, 4]]],
  [["A", "E", [2, 5]], ["E", "C", [1, 4]], ["D", "B", [2, 3]], ["C", "F", [2, 3]]],
  [["B", "E", [1, 2]], ["B", "C", [3, 5]], ["A", "D", [1, 4]], ["E", "F", [4, 5]]],
  [["A", "B", [2, 3]], ["C", "F", [1, 2]], ["D", "E", [1, 2]], ["D", "E", [3, 4]]],
  [["A", "F", [1, 2]], ["B", "C", [2, 5]], ["B", "C", [1, 4]], ["D", "E", [2, 3]]],
  [["F", "B", [3, 5]], ["F", "B", [2, 4]], ["A", "C", [1, 5]], ["D", "E", [4, 5]]],
  [["F", "D", [3, 5]], ["B", "C", [1, 3]], ["A", "D", [2, 4]], ["E", "F", [2, 4]]],
  [["C", "D", [2, 5]], ["A", "E", [3, 5]], ["F", "D", [1, 4]], ["A", "B", [1, 2]]],
  [["A", "F", [2, 5]], ["C", "D", [1, 3]], ["A", "E", [1, 3]], ["D", "B", [2, 4]]],
  [["C", "D", [3, 4]], ["A", "D", [1, 5]], ["E", "F", [1, 5]], ["A", "B", [3, 4]]],
  [["E", "C", [1, 5]], ["A", "C", [2, 4]], ["D", "B", [1, 5]], ["E", "F", [2, 3]]],
  [["A", "F", [1, 3]], ["B", "E", [1, 3]], ["C", "D", [1, 2]], ["A", "B", [4, 5]]],
  [["A", "F", [3, 4]], ["E", "C", [3, 5]], ["E", "C", [2, 4]], ["D", "B", [4, 5]]],
];

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

const ROWS: Row[] = [
  ...LEAGUE.map((row): Row => ({
    stage: "League",
    games: row.map(([home, away, pair], idx) => ({ court: idx + 1, home, away, pair })),
  })),
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
  const slots: Slot[] = [];
  const games: Game[] = [];
  let time = 0;
  let sinceBreak = 0;
  ROWS.forEach((row, idx) => {
    if (sinceBreak + SLOT_MINUTES > MAX_PLAY_MINUTES) {
      slots[idx - 1].breakAfter = `${clock(time)}–${clock(time + BREAK_MINUTES)}`;
      time += BREAK_MINUTES;
      sinceBreak = 0;
    }
    const number = idx + 1;
    slots.push({ number, time: `${clock(time)}–${clock(time + SLOT_MINUTES)}`, stage: row.stage });
    games.push(...row.games.map((game) => ({ ...game, slot: number })));
    time += SLOT_MINUTES;
    sinceBreak += SLOT_MINUTES;
  });
  return { slots, games, finish: clock(time) };
}

export const { slots: SLOTS, games: GAMES, finish: FINISH_TIME } = buildSchedule();

export const LEAGUE_SLOTS = SLOTS.filter((slot) => slot.stage === "League");
export const PLAYOFF_SLOTS = SLOTS.filter((slot) => slot.stage !== "League");

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
