import type { Metadata } from "next";
import Image from "next/image";

import { TournamentSectionCard } from "@/components/tournament-section-card";
import { TEAM_DIRECTORY } from "@/lib/tournament12/team-directory";
import { getInitials } from "@/lib/utils";

import { PLAYERS, WAITLIST } from "../content";

export const metadata: Metadata = {
  title: "Teams",
};

export default function TournamentTwelveTeamsPage() {
  return (
    <div className="grid gap-5">
      <TournamentSectionCard
        eyebrow={`${PLAYERS.length} players · ${TEAM_DIRECTORY.length} teams`}
        title="Teams & captains"
      >
        <p>Official league lineups, listed in P1–P5 order.</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TEAM_DIRECTORY.map((team) => (
            <section
              key={team.id}
              aria-labelledby={`team-${team.id}`}
              className="min-w-0 rounded-2xl border border-outline/80 bg-white/80 p-4"
            >
              <div className="flex items-center gap-4 border-b border-outline/80 pb-4">
                <a
                  href={`/tournament12/${team.logo}`}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`View ${team.name} logo`}
                  className="block h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-white"
                >
                  <Image
                    unoptimized
                    className="h-full w-full object-contain"
                    src={`/tournament12/${team.logo}`}
                    alt={`${team.name} logo`}
                    width={96}
                    height={96}
                  />
                </a>
                <div className="min-w-0">
                  <h3
                    id={`team-${team.id}`}
                    className="font-display text-lg leading-snug font-semibold text-ink"
                  >
                    {team.name}
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-muted">
                    Team {team.scheduleLetter} · {team.abbreviation}
                  </p>
                  <p className="text-sm leading-5 text-muted">
                    Captain <span className="font-medium text-ink">{team.captain}</span>
                  </p>
                </div>
              </div>
              <ol
                aria-label={`${team.name} league players in P1 to P5 order`}
                className="mt-1 divide-y divide-outline/60"
              >
                {team.members.map((name, idx) => (
                  <li key={name} className="flex items-center gap-3 py-2.5">
                    <span className="w-6 shrink-0 text-xs font-semibold tabular-nums text-court">
                      P{idx + 1}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[0.95rem] font-medium text-ink">
                      {name}
                    </span>
                    {name === team.captainMemberName && (
                      <span className="rounded-md bg-court-soft px-1.5 py-0.5 text-[0.65rem] font-semibold text-court">
                        Captain
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>
      </TournamentSectionCard>

      {WAITLIST.length > 0 && (
        <TournamentSectionCard eyebrow={`${WAITLIST.length} waiting`} title="Waitlist">
          <ol className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {WAITLIST.map((name) => (
              <li
                key={name}
                className="flex items-center gap-3 rounded-2xl border border-outline/80 bg-white/80 px-3 py-2.5"
              >
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#f4f8e3_0%,#e8f0cb_100%)] text-xs font-semibold text-court">
                  {getInitials(name)}
                </span>
                <span className="truncate text-[0.95rem] font-medium text-ink">{name}</span>
              </li>
            ))}
          </ol>
        </TournamentSectionCard>
      )}
    </div>
  );
}
