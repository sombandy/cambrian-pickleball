import Link from "next/link";
import type { LeaderboardEntry } from "@/lib/rankings";
import { ReliabilityRing } from "@/components/reliability-ring";

function RankBadge({ rank }: { rank: number }) {
  if (rank <= 3) {
    const colors = [
      "from-amber-400 to-amber-500 text-amber-950 shadow-amber-300/40",
      "from-gray-300 to-gray-400 text-gray-800 shadow-gray-300/40",
      "from-orange-400 to-orange-500 text-orange-950 shadow-orange-300/40",
    ];
    return (
      <span
        className={`inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-b text-sm font-bold shadow-md ${colors[rank - 1]}`}
      >
        {rank}
      </span>
    );
  }
  return (
    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-slate-600 to-slate-500 text-sm font-bold text-white shadow-sm">
      {rank}
    </span>
  );
}

function PlayerRow({ entry }: { entry: LeaderboardEntry }) {
  return (
    <Link
      href={`/rankings/player/${encodeURIComponent(entry.name)}`}
      className="flex items-center gap-3 border-b border-outline/60 px-4 py-3.5 last:border-b-0 hover:bg-court-soft/30 transition-colors sm:px-5"
    >
      {/* Rank */}
      <div className="shrink-0">
        <RankBadge rank={entry.rank} />
      </div>

      {/* Name + record */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-[0.95rem] font-semibold text-ink">
          {entry.name}
        </p>
        <span className="text-[0.72rem] text-muted">
          {entry.wins}-{entry.losses} &middot; {entry.tournaments}T
        </span>
      </div>

      {/* Ring + Confidence score */}
      <div className="flex items-center gap-2 shrink-0">
        <ReliabilityRing value={entry.reliability} size={32} />
        <span className="font-display text-lg font-bold tracking-tight text-ink tabular-nums w-14 text-right">
          {entry.displayConfidence.toFixed(3)}
        </span>
      </div>

      {/* Glicko-2 — visible on md+ */}
      <span className="text-xs font-semibold text-muted tabular-nums w-16 text-right shrink-0">
        {entry.glickoRating.toFixed(0)}
      </span>
    </Link>
  );
}

export function Leaderboard({ entries }: { entries: LeaderboardEntry[] }) {
  const totalTournaments = Math.max(...entries.map((e) => e.tournaments));

  return (
    <section className="surface-card overflow-hidden rounded-[30px]">
      {/* Header */}
      <div className="border-b border-outline/80 bg-court-soft/55 px-5 py-5 sm:px-6">
        <h2 className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-[1.7rem]">
          Live Leaderboard
        </h2>
        <p className="mt-1.5 text-[0.78rem] text-muted">
          {totalTournaments} tournaments &middot;{" "}
          {entries.length} active players &middot;{" "}
          Ranked by Confidence Score
        </p>
      </div>

      {/* Column headers */}
      <div className="flex items-center border-b border-outline/60 bg-sun/50 px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted sm:px-5">
        <span className="w-10 shrink-0 text-center">#</span>
        <span className="min-w-0 flex-1 pl-3">Player</span>
        <span className="w-[120px] text-right pr-1">Confidence</span>
        <span className="w-16 text-right shrink-0 text-[0.6rem]">Glicko-2</span>
      </div>

      {/* Rows */}
      <div>
        {entries.map((entry) => (
          <PlayerRow key={entry.name} entry={entry} />
        ))}
      </div>
    </section>
  );
}
