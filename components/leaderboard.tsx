import type { LeaderboardEntry } from "@/lib/rankings";

const STATUS_INDICATOR: Record<LeaderboardEntry["status"], { dot: string; label: string }> = {
  Established: { dot: "bg-emerald-500", label: "Established" },
  Developing: { dot: "bg-amber-400", label: "Developing" },
  Provisional: { dot: "bg-red-400", label: "Provisional" },
};

function ReliabilityDot({ status }: { status: LeaderboardEntry["status"] }) {
  const { dot, label } = STATUS_INDICATOR[status];
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={`inline-block h-2 w-2 rounded-full ${dot}`}
        aria-hidden
      />
      <span className="text-[0.72rem] font-medium text-muted">{label}</span>
    </span>
  );
}

function RankBadge({ rank }: { rank: number }) {
  if (rank <= 3) {
    const colors = [
      "from-amber-400 to-amber-500 text-amber-950 shadow-amber-300/40",
      "from-gray-300 to-gray-400 text-gray-800 shadow-gray-300/40",
      "from-orange-400 to-orange-500 text-orange-950 shadow-orange-300/40",
    ];
    return (
      <span
        className={`inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-b text-xs font-bold shadow-md ${colors[rank - 1]}`}
      >
        {rank}
      </span>
    );
  }
  return (
    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full text-[0.82rem] font-semibold text-muted">
      {rank}
    </span>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-[0.68rem] font-medium uppercase tracking-[0.14em] text-muted">
        {label}
      </span>
      <span className="text-[0.88rem] font-semibold text-ink">{value}</span>
    </div>
  );
}

function PlayerRow({ entry }: { entry: LeaderboardEntry }) {
  const winLoss = `${entry.wins}-${entry.losses}`;
  const confidence = entry.displayConfidence.toFixed(2);
  const dupr = entry.displayDupr.toFixed(2);
  const reliability = `${Math.round(entry.reliability)}%`;

  return (
    <div className="flex items-center gap-3 border-b border-outline/60 px-4 py-3.5 last:border-b-0 sm:gap-4 sm:px-5">
      {/* Rank */}
      <div className="flex w-8 shrink-0 justify-center">
        <RankBadge rank={entry.rank} />
      </div>

      {/* Name + status */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-[0.95rem] font-semibold text-ink">
          {entry.name}
        </p>
        <div className="mt-0.5 flex items-center gap-2">
          <ReliabilityDot status={entry.status} />
          <span className="text-[0.7rem] text-muted">
            {entry.tournaments}T · {entry.matches}M
          </span>
        </div>
      </div>

      {/* Stats — hidden on mobile, shown on sm+ */}
      <div className="hidden items-center gap-5 sm:flex">
        <StatPill label="W-L" value={winLoss} />
        <StatPill label="Rel" value={reliability} />
        <StatPill label="DUPR" value={dupr} />
      </div>

      {/* Confidence — always visible */}
      <div className="flex flex-col items-end gap-0.5">
        <span className="text-[0.68rem] font-medium uppercase tracking-[0.14em] text-court">
          Conf
        </span>
        <span className="font-display text-lg font-bold tracking-tight text-ink">
          {confidence}
        </span>
      </div>
    </div>
  );
}

function MobileExpandedRow({ entry }: { entry: LeaderboardEntry }) {
  const winLoss = `${entry.wins}-${entry.losses}`;
  const confidence = entry.displayConfidence.toFixed(2);
  const dupr = entry.displayDupr.toFixed(2);
  const reliability = `${Math.round(entry.reliability)}%`;

  return (
    <div className="border-b border-outline/60 last:border-b-0">
      {/* Main row */}
      <div className="flex items-center gap-3 px-4 pt-3.5 pb-2">
        <div className="flex w-8 shrink-0 justify-center">
          <RankBadge rank={entry.rank} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[0.95rem] font-semibold text-ink">
            {entry.name}
          </p>
          <ReliabilityDot status={entry.status} />
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <span className="text-[0.68rem] font-medium uppercase tracking-[0.14em] text-court">
            Conf
          </span>
          <span className="font-display text-lg font-bold tracking-tight text-ink">
            {confidence}
          </span>
        </div>
      </div>
      {/* Mobile stat strip */}
      <div className="flex items-center justify-around border-t border-outline/40 px-4 py-2 sm:hidden">
        <StatPill label="W-L" value={winLoss} />
        <StatPill label="DUPR" value={dupr} />
        <StatPill label="Rel" value={reliability} />
        <StatPill label="Tourn" value={String(entry.tournaments)} />
      </div>
    </div>
  );
}

export function Leaderboard({ entries }: { entries: LeaderboardEntry[] }) {
  return (
    <section className="surface-card overflow-hidden rounded-[30px]">
      {/* Header */}
      <div className="border-b border-outline/80 bg-court-soft/55 px-5 py-4 sm:px-6">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-xl font-semibold tracking-tight text-ink sm:text-2xl">
            Live Leaderboard
          </h2>
          <p className="text-[0.72rem] font-medium uppercase tracking-[0.18em] text-court">
            {entries.length} players
          </p>
        </div>
        <p className="mt-1 text-[0.82rem] leading-snug text-muted">
          Ranked by Confidence Score · Updated after each tournament
        </p>
      </div>

      {/* Desktop table header */}
      <div className="hidden border-b border-outline/60 bg-sun/50 px-5 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted sm:flex">
        <span className="w-8 shrink-0 text-center">#</span>
        <span className="min-w-0 flex-1 pl-4">Player</span>
        <div className="flex items-center gap-5">
          <span className="w-12 text-center">W-L</span>
          <span className="w-10 text-center">Rel</span>
          <span className="w-12 text-center">DUPR</span>
        </div>
        <span className="w-16 text-right">Conf</span>
      </div>

      {/* Rows — use expanded layout on mobile for stat strip */}
      <div className="sm:hidden">
        {entries.map((entry) => (
          <MobileExpandedRow key={entry.name} entry={entry} />
        ))}
      </div>
      <div className="hidden sm:block">
        {entries.map((entry) => (
          <PlayerRow key={entry.name} entry={entry} />
        ))}
      </div>
    </section>
  );
}
