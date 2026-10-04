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

export async function getLeaderboard(): Promise<LeaderboardEntry[] | null> {
  const url = process.env.RANKINGS_API_URL;
  if (!url) return null;

  try {
    const res = await fetch(url, {
      next: { revalidate: 3600, tags: ["rankings"] },
    });
    if (!res.ok) return null;
    const data: unknown = await res.json();
    return z.array(LeaderboardEntrySchema).parse(data);
  } catch {
    return null;
  }
}
