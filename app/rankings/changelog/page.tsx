import type { Metadata } from "next";
import Link from "next/link";
import {
  changelogEntries,
  type RankMovement,
  type ChangelogEntry,
} from "@/lib/changelog";

export const metadata: Metadata = {
  title: "Changelog - Cambrian Pickleball Rankings",
  description: "History of ranking updates, score corrections, and match data changes",
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00Z");
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

function getHighlights(movements: RankMovement[]) {
  const ups = movements.filter((m) => m.type === "up");
  const debuts = movements.filter((m) => m.type === "new");
  const climber = ups.length
    ? ups.reduce((a, b) =>
        b.before - b.after > a.before - a.after ? b : a
      )
    : null;
  return { climber, debuts };
}

/* ---------- icons (inline SVGs to avoid requiring lucide-react) ---------- */

function TrendingUpIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.306a11.95 11.95 0 015.814-5.518l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
    </svg>
  );
}

function TrendingDownIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6L9 12.75l4.286-4.286a11.948 11.948 0 014.306 6.43l.776 2.898m0 0l3.182-5.511m-3.182 5.51l-5.511-3.181" />
    </svg>
  );
}

function RocketIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
    </svg>
  );
}

function FlameIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.047 8.287 8.287 0 009 9.601a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.468 5.99 5.99 0 00-1.925 3.547 5.975 5.975 0 01-2.133-1.001A3.75 3.75 0 0012 18z" />
    </svg>
  );
}

function SparklesIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  );
}

/* ---------- Entry component ---------- */

function ChangelogCard({ entry }: { entry: ChangelogEntry }) {
  const { climber, debuts } = getHighlights(entry.rankMovements ?? []);

  return (
    <div className="surface-card rounded-[30px] p-6 sm:p-8">
      {/* Header */}
      <div className="mb-5">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-court mb-1">
          {formatDate(entry.date)}
        </p>
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
          {entry.tournament ? entry.tournament.name : entry.summary}
        </h2>
        {entry.tournament && (
          <p className="flex items-center gap-1.5 text-xs text-muted font-medium mt-1">
            <MapPinIcon />
            {entry.tournament.location}
          </p>
        )}
      </div>

      {/* Tournament Recap */}
      {entry.tournament && (
        <div className="mb-5">
          <div className="flex items-center justify-around rounded-2xl bg-court-soft/50 border border-outline/60 px-4 py-3 mb-4">
            <div className="text-center">
              <p className="font-display text-lg font-bold text-ink">
                {entry.tournament.matches}
              </p>
              <p className="text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-muted">
                Matches
              </p>
            </div>
            <div className="text-center">
              <p className="font-display text-lg font-bold text-ink">
                {entry.tournament.players}
              </p>
              <p className="text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-muted">
                Players
              </p>
            </div>
            <div className="text-center">
              <p className="font-display text-lg font-bold text-ink">
                {debuts.length}
              </p>
              <p className="text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-muted">
                {debuts.length === 1 ? "Debut" : "Debuts"}
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            {climber && (
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 shrink-0">
                  <RocketIcon />
                </div>
                <div>
                  <p className="text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-muted">
                    Biggest climber
                  </p>
                  <p className="text-sm font-semibold text-ink">
                    {climber.player}{" "}
                    <span className="text-emerald-700">
                      #{climber.before} &rarr; #{climber.after} (+
                      {climber.before - climber.after})
                    </span>
                  </p>
                </div>
              </div>
            )}
            {entry.tournament.funStats?.map((stat) => (
              <div key={stat.label} className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-amber-50 text-amber-600 shrink-0">
                  <FlameIcon />
                </div>
                <div>
                  <p className="text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-muted">
                    {stat.label}
                  </p>
                  <p className="text-sm font-semibold text-ink">{stat.text}</p>
                </div>
              </div>
            ))}
            {debuts.map((debut) => (
              <div key={debut.player} className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-blue-50 text-blue-700 shrink-0">
                  <SparklesIcon />
                </div>
                <div>
                  <p className="text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-muted">
                    Debut
                  </p>
                  <p className="text-sm font-semibold text-ink">
                    {debut.player}{" "}
                    <span className="text-blue-700">
                      enters at #{debut.after}
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Matches */}
      {entry.newMatches && entry.newMatches.length > 0 && (
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-emerald-600" />
            <h3 className="font-semibold text-sm text-ink">
              New Matches Added
            </h3>
          </div>
          <div className="space-y-2 pl-4">
            {entry.newMatches.map((match, i) => (
              <p key={i} className="text-sm text-muted leading-relaxed">
                <span className="font-mono font-semibold text-ink">
                  {match.tournament}:
                </span>{" "}
                {match.team1} ({match.team1Score}) vs {match.team2} (
                {match.team2Score}) &mdash;{" "}
                <span className="text-emerald-700 font-semibold">
                  {match.winner} won
                </span>
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Score Corrections */}
      {entry.scoreCorrections && entry.scoreCorrections.length > 0 && (
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <h3 className="font-semibold text-sm text-ink">
              Score Corrections
            </h3>
          </div>
          <div className="space-y-2 pl-4">
            {entry.scoreCorrections.map((correction, i) => (
              <div key={i} className="text-sm text-muted leading-relaxed">
                <span className="font-mono font-semibold text-ink">
                  {correction.tournament}:
                </span>{" "}
                {correction.team1} vs {correction.team2}
                <br />
                <span className="text-xs ml-4">
                  {correction.scoreBefore} &rarr; {correction.scoreAfter}
                </span>
                {correction.notes && (
                  <p className="text-xs italic ml-4 mt-0.5">
                    {correction.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rank Movements */}
      {entry.rankMovements && entry.rankMovements.length > 0 && (
        <details className="group" open={!entry.tournament}>
          <summary className="flex items-center gap-2 mb-3 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
            <div className="w-2 h-2 rounded-full bg-blue-600" />
            <h3 className="font-semibold text-sm text-ink">Rank Movements</h3>
            {entry.tournament && (
              <span className="text-xs font-semibold text-court group-open:hidden">
                Show all {entry.rankMovements.length}
              </span>
            )}
          </summary>
          <div className="flex flex-wrap gap-2 pl-4">
            {entry.rankMovements.map((movement, i) => (
              <span
                key={i}
                className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg ${
                  movement.type === "up"
                    ? "text-emerald-700 bg-emerald-50"
                    : movement.type === "down"
                      ? "text-red-700 bg-red-50"
                      : "text-blue-700 bg-blue-50"
                }`}
              >
                {movement.type === "up" && <TrendingUpIcon />}
                {movement.type === "down" && <TrendingDownIcon />}
                {movement.type === "new"
                  ? `${movement.player} NEW #${movement.after}`
                  : `${movement.player} #${movement.before} → #${movement.after}`}
              </span>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

export default function ChangelogPage() {
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

      <header>
        <h1 className="font-display text-[2rem] leading-[1.08] font-semibold tracking-tight text-ink sm:text-[2.6rem]">
          Recent Changes
        </h1>
        <p className="mt-2 text-[0.95rem] leading-snug text-muted">
          History of ranking updates, match data changes, and score corrections.
        </p>
      </header>

      {changelogEntries.map((entry, idx) => (
        <ChangelogCard key={idx} entry={entry} />
      ))}
    </main>
  );
}
