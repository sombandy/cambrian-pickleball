import type { Metadata } from "next";

import { TournamentSectionCard } from "@/components/tournament-section-card";
import { getInitials } from "@/lib/utils";

import { PLAYERS, WAITLIST } from "../content";

export const metadata: Metadata = {
  title: "Players",
};

function PlayerChip({ name }: { name: string }) {
  return (
    <li className="flex items-center gap-3 rounded-2xl border border-outline/80 bg-white/80 px-3 py-2.5">
      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#f4f8e3_0%,#e8f0cb_100%)] text-xs font-semibold text-court">
        {getInitials(name)}
      </span>
      <span className="truncate text-[0.95rem] font-medium text-ink">{name}</span>
    </li>
  );
}

export default function TournamentTwelvePlayersPage() {
  return (
    <div className="grid gap-5">
      <TournamentSectionCard eyebrow={`${PLAYERS.length} registered`} title="Players">
        <ul className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {PLAYERS.map((name) => (
            <PlayerChip key={name} name={name} />
          ))}
        </ul>
      </TournamentSectionCard>

      <TournamentSectionCard eyebrow={`${WAITLIST.length} waiting`} title="Waitlist">
        <ol className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {WAITLIST.map((name) => (
            <PlayerChip key={name} name={name} />
          ))}
        </ol>
      </TournamentSectionCard>
    </div>
  );
}
