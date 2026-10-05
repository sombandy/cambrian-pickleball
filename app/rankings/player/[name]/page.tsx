import type { Metadata } from "next";
import Link from "next/link";
import { getPlayerHistory } from "@/lib/rankings";
import { ReliabilityRing } from "@/components/reliability-ring";

export const metadata: Metadata = {
  title: "Player Detail - Cambrian Pickleball Rankings",
  description: "Individual player stats and tournament history",
};

export default async function PlayerPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  const playerName = safeDecode(name);
  const history = await getPlayerHistory(playerName);

  if (!history) {
    return (
      <main className="pb-16">
        <div className="surface-card rounded-[30px] p-8 text-center">
          <p className="font-display text-xl font-semibold text-ink mb-2">
            Player not found
          </p>
          <p className="text-muted mb-6">
            Could not load data for &ldquo;{playerName}&rdquo;.
          </p>
          <Link
            href="/rankings"
            className="primary-button inline-block rounded-full px-6 py-2.5 text-sm font-semibold"
          >
            Back to Rankings
          </Link>
        </div>
      </main>
    );
  }

  const { entry, snapshots } = history;

  const statusColors: Record<string, string> = {
    Established: "bg-emerald-100 text-emerald-700 border-emerald-200",
    Developing: "bg-blue-100 text-blue-700 border-blue-200",
    Provisional: "bg-amber-100 text-amber-700 border-amber-200",
  };

  return (
    <main className="pb-16 space-y-6">
      {/* Back link */}
      <Link
        href="/rankings"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-court hover:text-berry transition-colors"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 19.5L8.25 12l7.5-7.5"
          />
        </svg>
        Back to Rankings
      </Link>

      {/* Summary Card */}
      <div className="surface-card rounded-[30px] p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              {playerName}
            </h1>
            <span
              className={`mt-2 inline-block rounded-full border px-3 py-0.5 text-xs font-semibold ${statusColors[entry.status] ?? "bg-gray-100 text-gray-700 border-gray-200"}`}
            >
              {entry.status}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <ReliabilityRing value={entry.reliability} size={60} />
            <div>
              <p className="font-display text-3xl font-bold tracking-tight text-ink">
                {(entry.displayConfidence ?? 0).toFixed(3)}
              </p>
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-court">
                Confidence Score
              </p>
              <p className="text-xs text-muted mt-0.5">
                Glicko-2: {(entry.glickoRating ?? 0).toFixed(0)}
              </p>
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatBox label="Rank" value={`#${entry.rank}`} />
          <StatBox
            label="Record"
            value={`${entry.wins}–${entry.losses}`}
          />
          <StatBox
            label="Win %"
            value={`${(entry.winPct ?? 0).toFixed(1)}%`}
          />
          <StatBox label="Tournaments" value={String(entry.tournaments)} />
        </div>
      </div>

      {/* Tournament History */}
      <div className="surface-card rounded-[30px] overflow-hidden">
        <div className="border-b border-outline/80 bg-court-soft/55 px-5 py-4 sm:px-6">
          <h2 className="font-display text-lg font-semibold tracking-tight text-ink">
            Tournament History
          </h2>
        </div>

        {snapshots.length === 0 ? (
          <p className="text-muted text-center py-10">
            No tournament history yet
          </p>
        ) : (
          <div className="divide-y divide-outline/60">
            {snapshots.map((snapshot, idx) => (
              <TournamentCard key={idx} snapshot={snapshot} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-outline/70 bg-sun/40 px-4 py-3 text-center">
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-muted mb-1">
        {label}
      </p>
      <p className="font-display text-xl font-bold text-ink">{value}</p>
    </div>
  );
}

function TournamentCard({
  snapshot,
}: {
  snapshot: {
    tournament: string;
    date: string;
    confidenceAfter: number;
    confidenceDelta: number;
    matches: {
      partner: string;
      opponents: [string, string];
      scoreFor: number;
      scoreAgainst: number;
      won: boolean;
    }[];
  };
}) {
  const deltaPositive = (snapshot.confidenceDelta ?? 0) > 0;
  const deltaNegative = (snapshot.confidenceDelta ?? 0) < 0;

  return (
    <div>
      {/* Tournament header */}
      <div className="flex items-center justify-between px-5 py-3 bg-sun/30 sm:px-6">
        <div>
          <h3 className="text-sm font-semibold text-ink">
            {snapshot.tournament}
          </h3>
          <p className="text-xs text-muted">{snapshot.date}</p>
        </div>
        <div className="flex gap-2">
          <span className="rounded-lg bg-court-soft/70 border border-outline/60 px-2.5 py-1 text-center">
            <span className="block text-sm font-bold text-ink">
              {(snapshot.confidenceAfter ?? 0).toFixed(3)}
            </span>
            <span className="block text-[0.58rem] font-semibold uppercase tracking-wider text-court">
              Conf
            </span>
          </span>
          <span
            className={`rounded-lg border px-2.5 py-1 text-center ${
              deltaPositive
                ? "bg-emerald-50 border-emerald-200"
                : deltaNegative
                  ? "bg-red-50 border-red-200"
                  : "bg-gray-50 border-gray-200"
            }`}
          >
            <span
              className={`block text-xs font-bold ${
                deltaPositive
                  ? "text-emerald-700"
                  : deltaNegative
                    ? "text-red-600"
                    : "text-muted"
              }`}
            >
              {deltaPositive ? "+" : ""}
              {(snapshot.confidenceDelta ?? 0).toFixed(3)}
            </span>
            <span className="block text-[0.58rem] font-semibold uppercase tracking-wider text-muted">
              Delta
            </span>
          </span>
        </div>
      </div>

      {/* Match list */}
      <div className="divide-y divide-outline/40">
        {snapshot.matches.map((match, mIdx) => (
          <div
            key={mIdx}
            className="flex items-center justify-between px-5 py-2 text-sm sm:px-6"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-semibold text-ink truncate">
                {match.partner}
              </span>
              <span className="text-muted/60 shrink-0">vs</span>
              <span className="text-muted truncate">
                {match.opponents.join(" & ")}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-2">
              <span className="text-xs text-muted">
                {match.scoreFor}&ndash;{match.scoreAgainst}
              </span>
              <span
                className={`rounded px-1.5 py-0.5 text-[0.68rem] font-bold ${
                  match.won
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {match.won ? "W" : "L"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
