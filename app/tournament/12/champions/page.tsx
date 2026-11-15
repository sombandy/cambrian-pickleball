import type { Metadata } from "next";
import Image from "next/image";

import { TournamentSectionCard } from "@/components/tournament-section-card";
import {
  rosterDisplayName,
  TEAM_DIRECTORY,
  type NamedTeam,
} from "@/lib/tournament12/team-directory";

export const metadata: Metadata = {
  title: "Champions",
};

const teamById = (id: string) => TEAM_DIRECTORY.find((team) => team.id === id)!;

const CHAMPIONS = teamById("dink-a-dhamaka");
const RUNNERS_UP = teamById("susurbati-lobbers");

type PodiumPhoto = { src: string; width: number; height: number; priority?: boolean };

function PodiumTeam({
  team,
  badge,
  medal,
  photo,
}: {
  team: NamedTeam;
  badge: string;
  medal: string;
  photo: PodiumPhoto;
}) {
  return (
    <div className="overflow-hidden rounded-[24px] border border-outline/80 bg-white/80">
      <Image
        {...photo}
        alt={`${team.name}, ${badge.toLowerCase()} of the 12th Cambrian Pickleball Tournament, wearing their medals at Ace Pickleball Club.`}
        sizes="(min-width: 640px) 44vw, 100vw"
        className="aspect-[4/5] w-full object-cover"
      />
      <div className="p-5 sm:p-6">
        <span className="inline-flex rounded-full border border-court/15 bg-court-soft px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-court">
          {badge}
        </span>
        <div className="mt-3 flex items-center gap-3">
          <Image
            unoptimized
            className="h-14 w-14 shrink-0 rounded-xl bg-white object-contain"
            src={`/tournament12/${team.logo}`}
            alt={`${team.name} logo`}
            width={56}
            height={56}
          />
          <h3 className="font-display text-xl font-semibold tracking-tight text-ink">
            {medal} {team.name}
          </h3>
        </div>
        <ul aria-label={`${team.name} players`} className="mt-4 divide-y divide-outline/70">
          {team.members.map((name) => (
            <li
              key={name}
              className="flex items-center justify-between gap-3 py-2.5 text-[0.95rem] font-medium text-ink"
            >
              <span>{rosterDisplayName(name)}</span>
              {name === team.captainMemberName ? (
                <span className="rounded-md bg-court-soft px-1.5 py-0.5 text-[0.65rem] font-semibold text-court">
                  Captain
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function TournamentTwelveChampionsPage() {
  return (
    <div className="grid gap-5">
      <TournamentSectionCard title="Champions & Runners-up">
        <div className="grid items-start gap-4 sm:grid-cols-2">
          <PodiumTeam
            team={CHAMPIONS}
            badge="Champions"
            medal="🏆"
            photo={{
              src: "/images/tournaments/12/champions.jpg",
              width: 900,
              height: 1600,
              priority: true,
            }}
          />
          <PodiumTeam
            team={RUNNERS_UP}
            badge="Runners-up"
            medal="🥈"
            photo={{ src: "/images/tournaments/12/runners-up.jpg", width: 768, height: 1024 }}
          />
        </div>
      </TournamentSectionCard>
    </div>
  );
}
