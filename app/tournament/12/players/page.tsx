import type { Metadata } from "next";

import { TournamentSectionCard } from "@/components/tournament-section-card";
import { getInitials } from "@/lib/utils";

import { PLAYERS, TEAM_CAPTAINS, TEAM_NAMES, TEAM_ROSTERS, WAITLIST } from "../content";
import { TEAMS } from "../schedule";

export const metadata: Metadata = {
  title: "Players",
};

function PlayerChip({ name, badge }: { name: string; badge: string }) {
  return (
    <li className="flex items-center gap-3 rounded-2xl border border-outline/80 bg-white/80 px-3 py-2.5">
      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#f4f8e3_0%,#e8f0cb_100%)] text-xs font-semibold text-court">
        {badge}
      </span>
      <span className="truncate text-[0.95rem] font-medium text-ink">{name}</span>
    </li>
  );
}

export default function TournamentTwelvePlayersPage() {
  return (
    <div className="grid gap-5">
      <TournamentSectionCard
        eyebrow={`${PLAYERS.length} players · ${TEAMS.length} teams`}
        title="Teams"
      >
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TEAMS.map((team) => (
            <div key={team}>
              <h3 className="font-display text-lg font-semibold text-ink">
                Team {team} ({TEAM_NAMES[team]})
              </h3>
              <ol className="mt-2.5 grid gap-2.5">
                {TEAM_ROSTERS[team].map((name, idx) => (
                  <PlayerChip
                    key={name}
                    name={TEAM_CAPTAINS[team] === name ? `${name} (C)` : name}
                    badge={`${team}${idx + 1}`}
                  />
                ))}
              </ol>
            </div>
          ))}
        </div>
      </TournamentSectionCard>

      {WAITLIST.length > 0 && (
        <TournamentSectionCard eyebrow={`${WAITLIST.length} waiting`} title="Waitlist">
          <ol className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {WAITLIST.map((name) => (
              <PlayerChip key={name} name={name} badge={getInitials(name)} />
            ))}
          </ol>
        </TournamentSectionCard>
      )}
    </div>
  );
}
