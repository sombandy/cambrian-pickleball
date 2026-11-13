import type { Metadata } from "next";
import Image from "next/image";
import { CalendarDays, MapPin, Users } from "lucide-react";

import { TournamentSubnav } from "@/components/tournament-subnav";

import {
  DATE_LABEL,
  ORGANIZERS,
  SECTIONS,
  TIME_LABEL,
  TOURNAMENT_TITLE,
  VENUE,
} from "./content";

export const metadata: Metadata = {
  title: {
    default: TOURNAMENT_TITLE,
    template: `%s · ${TOURNAMENT_TITLE}`,
  },
  description:
    "Teams, rules, and feedback for the 12th Cambrian Pickleball Tournament at Ace Pickleball Club, San Jose.",
};

export default function TournamentTwelveLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="grid gap-5 pb-12">
      <section className="surface-card relative isolate overflow-hidden rounded-[32px] px-5 py-8 sm:px-8 sm:py-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(140,169,43,0.18),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(93,115,32,0.12),transparent_28%)]" />

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-7">
          <Image
            unoptimized
            priority
            className="h-20 w-20 shrink-0 rounded-2xl object-contain sm:h-28 sm:w-28"
            src="/tournament12/tournament-art.png"
            alt={`${TOURNAMENT_TITLE} artwork`}
            width={112}
            height={112}
          />
          <div className="min-w-0 max-w-2xl">
            <span className="inline-flex rounded-full border border-court/15 bg-court-soft px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-court sm:text-xs">
              Tournament 12 · Upcoming
            </span>
            <h1 className="mt-4 font-display text-4xl leading-[0.96] font-semibold tracking-tight text-ink sm:text-5xl">
              {TOURNAMENT_TITLE}
            </h1>

            <ul className="mt-5 grid gap-2 text-sm text-muted sm:text-[0.98rem]">
              <li className="flex items-center gap-2.5">
                <CalendarDays className="h-4 w-4 shrink-0 text-court" />
                <span>
                  <span className="font-semibold text-ink">{DATE_LABEL}</span> ·{" "}
                  {TIME_LABEL}
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-1 h-4 w-4 shrink-0 text-court" />
                <span>
                  <a
                    href={VENUE.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-ink underline decoration-court/40 underline-offset-4 transition hover:decoration-court"
                  >
                    {VENUE.name}
                  </a>
                  {" · "}
                  <a
                    href={VENUE.mapsHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline decoration-outline-strong underline-offset-4 transition hover:text-ink"
                  >
                    {VENUE.address}
                  </a>
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Users className="h-4 w-4 shrink-0 text-court" />
                <span>
                  Organized by{" "}
                  <span className="font-semibold text-ink">{ORGANIZERS}</span>
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <TournamentSubnav sections={SECTIONS} />

      {children}
    </main>
  );
}
