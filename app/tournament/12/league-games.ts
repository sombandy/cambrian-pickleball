// Tournament 12 league game order: the single source for both the published
// game schedule (Rules page) and live scoring. One row per game, in play order.
// To reorder the queue, edit rows here only; schedule.ts re-checks every league
// rule (8 games per player, same 60 fixtures as Assigned Courts) at build time.
//
// Columns: game number, home team, away team, pair (player positions on both
// teams), game lead (a participant who did not play in the preceding batch).
// Games are planned in batches of four, one batch per 20 minutes.
import type { Pair, PlayerId, Team } from "./schedule";

export type LeagueGameRow = [game: number, home: Team, away: Team, pair: Pair, lead: PlayerId];

export const LEAGUE_GAME_ORDER: LeagueGameRow[] = [
  // Batch 1
  [ 1, "A", "F", [3, 4], "A3"],
  [ 2, "B", "E", [3, 4], "B4"],
  [ 3, "C", "D", [3, 4], "C4"],
  [ 4, "A", "B", [1, 2], "B1"],

  // Batch 2
  [ 5, "D", "E", [1, 2], "E1"],
  [ 6, "C", "F", [1, 2], "F2"],
  [ 7, "F", "B", [3, 5], "F5"],
  [ 8, "A", "D", [3, 5], "D5"],

  // Batch 3
  [ 9, "E", "C", [3, 5], "C3"],
  [10, "D", "B", [2, 4], "D4"],
  [11, "A", "C", [2, 4], "A2"],
  [12, "E", "F", [2, 4], "F4"],

  // Batch 4
  [13, "A", "F", [1, 3], "F1"],
  [14, "C", "D", [1, 3], "C1"],
  [15, "B", "E", [1, 3], "B3"],
  [16, "A", "B", [4, 5], "B5"],

  // Batch 5
  [17, "C", "F", [4, 5], "C5"],
  [18, "D", "E", [4, 5], "E4"],
  [19, "C", "D", [1, 2], "D2"],
  [20, "B", "E", [1, 2], "E2"],

  // Batch 6
  [21, "A", "F", [1, 2], "A1"],
  [22, "A", "B", [3, 4], "A4"],
  [23, "C", "F", [3, 4], "F3"],
  [24, "D", "E", [3, 4], "E3"],

  // Batch 7
  [25, "D", "B", [1, 5], "D1"],
  [26, "A", "C", [1, 5], "A5"],
  [27, "E", "F", [1, 5], "E5"],
  [28, "A", "B", [2, 3], "B2"],

  // Batch 8
  [29, "D", "E", [2, 3], "D3"],
  [30, "C", "F", [2, 3], "C2"],
  [31, "D", "B", [4, 5], "D4"],
  [32, "E", "F", [4, 5], "E4"],

  // Batch 9
  [33, "A", "C", [4, 5], "C4"],
  [34, "A", "E", [1, 3], "E1"],
  [35, "B", "C", [1, 3], "B3"],
  [36, "F", "D", [1, 3], "D1"],

  // Batch 10
  [37, "B", "E", [2, 5], "B2"],
  [38, "A", "F", [2, 5], "F5"],
  [39, "C", "D", [2, 5], "D2"],
  [40, "B", "C", [1, 4], "B4"],

  // Batch 11
  [41, "A", "E", [1, 4], "A4"],
  [42, "F", "D", [1, 4], "F1"],
  [43, "E", "F", [2, 3], "E3"],
  [44, "A", "C", [2, 3], "C3"],

  // Batch 12
  [45, "D", "B", [2, 3], "D3"],
  [46, "E", "C", [1, 5], "E5"],
  [47, "A", "D", [1, 5], "D5"],
  [48, "F", "B", [1, 5], "B5"],

  // Batch 13
  [49, "E", "C", [2, 4], "E2"],
  [50, "F", "B", [2, 4], "F4"],
  [51, "A", "D", [2, 4], "A2"],
  [52, "A", "E", [3, 5], "A3"],

  // Batch 14
  [53, "F", "D", [3, 5], "F3"],
  [54, "B", "C", [3, 5], "C5"],
  [55, "F", "B", [1, 4], "B1"],
  [56, "A", "D", [1, 4], "A1"],

  // Batch 15
  [57, "A", "E", [2, 5], "A5"],
  [58, "E", "C", [1, 4], "C1"],
  [59, "B", "C", [2, 5], "C2"],
  [60, "F", "D", [2, 5], "F2"],
];
