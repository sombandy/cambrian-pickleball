import { z } from "zod";

const LeaderboardEntrySchema = z.object({
  rank: z.number(),
  name: z.string(),
  dupr: z.number(),
  adjustedDupr: z.number(),
  displayDupr: z.number(),
  confidence: z.number(),
  displayConfidence: z.number(),
  reliability: z.number(),
  status: z.enum(["Provisional", "Developing", "Established"]),
  tournaments: z.number(),
  matches: z.number(),
  wins: z.number(),
  losses: z.number(),
  winPct: z.number(),
  pointDiff: z.number(),
  glickoRating: z.number(),
  glickoRd: z.number(),
});

export type LeaderboardEntry = z.infer<typeof LeaderboardEntrySchema>;

// The leaderboard API requires this key. It's read on the server only and never sent to the browser.
function apiHeaders(): HeadersInit {
  const key = process.env.LEADERBOARD_API_KEY;
  return key ? { Authorization: `Bearer ${key}` } : {};
}

export async function getLeaderboard(): Promise<LeaderboardEntry[] | null> {
  const url = process.env.RANKINGS_API_URL;
  if (!url) return null;

  try {
    const res = await fetch(url, {
      headers: apiHeaders(),
      next: { revalidate: 3600, tags: ["rankings"] },
    });
    if (!res.ok) return null;
    const data: unknown = await res.json();
    return z.array(LeaderboardEntrySchema).parse(data);
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* Player history — fetched from the cambriandupr API                 */
/* ------------------------------------------------------------------ */

export interface MatchRecord {
  partner: string;
  opponents: [string, string];
  scoreFor: number;
  scoreAgainst: number;
  won: boolean;
}

export interface TournamentSnapshot {
  tournament: string;
  date: string;
  duprAfter: number;
  confidenceAfter: number;
  confidenceBefore: number;
  confidenceDelta: number;
  matches: MatchRecord[];
}

export interface PlayerHistoryData {
  entry: LeaderboardEntry;
  snapshots: TournamentSnapshot[];
}

export async function getPlayerHistory(
  playerName: string
): Promise<PlayerHistoryData | null> {
  const baseUrl = process.env.RANKINGS_API_URL;
  if (!baseUrl) return null;

  // Derive the player API URL from the leaderboard URL
  // e.g. https://cambriandupr.vercel.app/api/leaderboard -> https://cambriandupr.vercel.app/api/player/NAME
  const apiBase = baseUrl.replace(/\/api\/leaderboard\/?$/, "");
  const playerUrl = `${apiBase}/api/player/${encodeURIComponent(playerName)}`;

  try {
    const res = await fetch(playerUrl, {
      headers: apiHeaders(),
      next: { revalidate: 3600, tags: ["player-history"] },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data as PlayerHistoryData;
  } catch {
    return null;
  }
}
