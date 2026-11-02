// Court-by-court schedule for Tournament 12. Every team follows the same
// 5-position rotation, so all pairings are derived from each team's running
// appearance count rather than typed out by hand.

export const TEAMS = ["A", "B", "C", "D", "E", "F"] as const;
export type Team = (typeof TEAMS)[number];

export const POSITIONS = [1, 2, 3, 4, 5] as const;
export const SEEDS = [1, 2, 3, 4, 5, 6] as const;

export type Pair = [number, number];

export const ROTATION: { pairs: [Pair, Pair]; rest: number }[] = [
  { pairs: [[2, 3], [4, 5]], rest: 1 },
  { pairs: [[1, 4], [3, 5]], rest: 2 },
  { pairs: [[1, 5], [2, 4]], rest: 3 },
  { pairs: [[1, 3], [2, 5]], rest: 4 },
  { pairs: [[1, 2], [3, 4]], rest: 5 },
];

export function rotationAt(appearance: number) {
  return ROTATION[appearance % ROTATION.length];
}

export type Stage = "Groups" | "Wild cards" | "Semifinals" | "Final";

export type Slot = {
  number: number;
  time: string;
  stage: Stage;
  // Time range of the 5-minute break that follows this slot, if any.
  breakAfter?: string;
};

export const SLOTS: Slot[] = [
  { number: 1, time: "11:00–11:25", stage: "Groups" },
  { number: 2, time: "11:25–11:50", stage: "Groups", breakAfter: "11:50–11:55" },
  { number: 3, time: "11:55–12:20", stage: "Groups" },
  { number: 4, time: "12:20–12:45", stage: "Groups", breakAfter: "12:45–12:50" },
  { number: 5, time: "12:50–1:15", stage: "Groups" },
  { number: 6, time: "1:15–1:40", stage: "Groups", breakAfter: "1:40–1:45" },
  { number: 7, time: "1:45–2:10", stage: "Groups" },
  { number: 8, time: "2:10–2:35", stage: "Groups", breakAfter: "2:35–2:40" },
  { number: 9, time: "2:40–3:05", stage: "Groups" },
  { number: 10, time: "3:05–3:30", stage: "Wild cards", breakAfter: "3:30–3:35" },
  { number: 11, time: "3:35–4:00", stage: "Wild cards" },
  { number: 12, time: "4:00–4:25", stage: "Wild cards", breakAfter: "4:25–4:30" },
  { number: 13, time: "4:30–4:55", stage: "Semifinals" },
  { number: 14, time: "4:55–5:20", stage: "Semifinals", breakAfter: "5:20–5:25" },
  { number: 15, time: "5:25–5:50", stage: "Semifinals" },
  { number: 16, time: "5:50–6:15", stage: "Final", breakAfter: "6:15–6:20" },
  { number: 17, time: "6:20–6:45", stage: "Final" },
  { number: 18, time: "6:45–7:10", stage: "Final" },
];

function slotsIn(...stages: Stage[]) {
  return SLOTS.filter((slot) => stages.includes(slot.stage));
}

export const GROUP_SLOTS = slotsIn("Groups");
export const PLAYOFF_SLOTS = slotsIn("Wild cards", "Semifinals");
export const FINAL_SLOTS = slotsIn("Final");

// One side of a series: a team (or seed) label and how many times that team
// has already played, which fixes its pairs and resting player.
export type Side = { label: string; appearance: number };

// A series match takes two adjacent courts: pair 1 on `court`, pair 2 on `court + 1`.
export type Fixture = { slot: number; court: number; home: Side; away: Side };

const GROUP_MATCHUPS: [Team, Team][][] = [
  [["A", "B"], ["D", "E"]],
  [["A", "C"], ["D", "F"]],
  [["B", "C"], ["E", "F"]],
];

function buildGroupFixtures(): Fixture[] {
  const appearances = new Map<string, number>();
  const next = (label: string): Side => {
    const appearance = appearances.get(label) ?? 0;
    appearances.set(label, appearance + 1);
    return { label, appearance };
  };

  return GROUP_SLOTS.flatMap((slot, idx) =>
    GROUP_MATCHUPS[idx % GROUP_MATCHUPS.length].map(([home, away], matchIdx) => ({
      slot: slot.number,
      court: matchIdx * 2 + 1,
      home: next(home),
      away: next(away),
    })),
  );
}

export const GROUP_FIXTURES = buildGroupFixtures();

// Every team plays 6 times in the group stage. Seeds 3–6 play wild cards
// first (appearances 7–9); seeds 1–2 start at the semifinals.
const GROUP_APPEARANCES = 6;

// Both series of a playoff stage run side by side, on Courts 1–2 and 3–4.
// `awayOffset` counts the extra wild-card appearances a W / W' side has made.
function playoffFixtures(stage: Stage, matchups: [string, string][], awayOffset = 0): Fixture[] {
  return slotsIn(stage).flatMap((slot, k) =>
    matchups.map(([home, away], matchIdx) => ({
      slot: slot.number,
      court: matchIdx * 2 + 1,
      home: { label: home, appearance: GROUP_APPEARANCES + k },
      away: { label: away, appearance: GROUP_APPEARANCES + awayOffset + k },
    })),
  );
}

const WILD_CARD_FIXTURES = playoffFixtures("Wild cards", [["S3", "S6"], ["S4", "S5"]]);

// W = winner of Seed 4 v 5 (plays Seed 1); W' = winner of Seed 3 v 6 (plays Seed 2).
const SEMIFINAL_FIXTURES = playoffFixtures("Semifinals", [["S1", "W"], ["S2", "W'"]], 3);

export const PLAYOFF_FIXTURES = [...WILD_CARD_FIXTURES, ...SEMIFINAL_FIXTURES];

// The final is played on Courts 1–2. A Seed 1/2 finalist has played 9 times
// before it; a wild-card finalist has played 12 times.
export function finalAppearance(seed: number, finalIdx: number) {
  return (seed <= 2 ? GROUP_APPEARANCES + 3 : GROUP_APPEARANCES + 6) + finalIdx;
}

// "A" + 2 → "A2"; "S3" + 2 → "S3.2"; "W" + 2 → "W.2".
export function playerLabel(label: string, position: number) {
  return (TEAMS as readonly string[]).includes(label) ? `${label}${position}` : `${label}.${position}`;
}

export function pairLabel(label: string, pair: Pair) {
  return `${playerLabel(label, pair[0])}+${playerLabel(label, pair[1])}`;
}

export function slotByNumber(number: number) {
  return SLOTS.find((slot) => slot.number === number)!;
}

// ---- Per-player view -----------------------------------------------------

export type PlayerSlot =
  | {
      kind: "play";
      slot: Slot;
      court: number;
      partner: number;
      // Raw side label ("B", "S6") and its display name ("Team B", "Seed 6").
      opponentLabel: string;
      opponent: string;
      // Unknown in the final, where the opponent's rotation depends on its path.
      opponentPair: Pair | null;
    }
  | { kind: "rest"; slot: Slot; courts: [number, number]; opponent: string }
  | { kind: "idle"; slot: Slot };

function playerSlot(
  slot: Slot,
  court: number,
  own: Side,
  opponentLabel: string,
  opponent: string,
  opponentAppearance: number | null,
  position: number,
): PlayerSlot {
  const { pairs, rest } = rotationAt(own.appearance);
  if (rest === position) {
    return { kind: "rest", slot, courts: [court, court + 1], opponent };
  }
  const pairIdx = pairs.findIndex((pair) => pair.includes(position));
  const pair = pairs[pairIdx];
  return {
    kind: "play",
    slot,
    court: court + pairIdx,
    partner: pair[0] === position ? pair[1] : pair[0],
    opponentLabel,
    opponent,
    opponentPair: opponentAppearance === null ? null : rotationAt(opponentAppearance).pairs[pairIdx],
  };
}

function slotsForSide(fixtures: Fixture[], label: string, position: number, opponentName: (label: string) => string) {
  return fixtures.flatMap((fixture) => {
    const { home, away } = fixture;
    const [own, other] = home.label === label ? [home, away] : [away, home];
    if (own.label !== label) return [];
    return [
      playerSlot(
        slotByNumber(fixture.slot),
        fixture.court,
        own,
        other.label,
        opponentName(other.label),
        other.appearance,
        position,
      ),
    ];
  });
}

export function groupStageFor(team: Team, position: number): PlayerSlot[] {
  const played = slotsForSide(GROUP_FIXTURES, team, position, (label) => `Team ${label}`);
  return GROUP_SLOTS.map(
    (slot) => played.find((entry) => entry.slot.number === slot.number) ?? { kind: "idle", slot },
  );
}

const SIDE_NAMES: Record<string, string> = {
  S1: "Seed 1",
  S2: "Seed 2",
  S3: "Seed 3",
  S4: "Seed 4",
  S5: "Seed 5",
  S6: "Seed 6",
  W: "Winner of Seed 4 v 5",
  "W'": "Winner of Seed 3 v 6",
};

// The path a seed takes if it keeps winning: wild cards (seeds 3–6),
// semifinals, then the final.
export function playoffsFor(seed: number, position: number): PlayerSlot[] {
  const own = `S${seed}`;
  const semiLabel = seed <= 2 ? own : seed === 4 || seed === 5 ? "W" : "W'";
  const name = (label: string) => SIDE_NAMES[label];

  // Seeds 1–2 have no wild-card fixture, so this is empty for them.
  const wildCards = slotsForSide(WILD_CARD_FIXTURES, own, position, name);
  const semis = slotsForSide(SEMIFINAL_FIXTURES, semiLabel, position, name);
  const final = FINAL_SLOTS.map((slot, k) =>
    playerSlot(slot, 1, { label: own, appearance: finalAppearance(seed, k) }, "", "the other finalist", null, position),
  );

  return [...wildCards, ...semis, ...final];
}
