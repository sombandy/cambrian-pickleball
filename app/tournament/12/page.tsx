import Link from "next/link";
import { ArrowRight, BookOpen, MessageSquareText, Users } from "lucide-react";

import { TournamentSectionCard } from "@/components/tournament-section-card";

import {
  DATE_LABEL,
  FEEDBACK_PATH,
  PLAYERS,
  PLAYERS_PATH,
  RULES_PATH,
  TIME_LABEL,
  VENUE,
  WAITLIST,
} from "./content";

const QUICK_LINKS = [
  {
    href: PLAYERS_PATH,
    icon: Users,
    title: "Players",
    description: `${PLAYERS.length} registered · ${WAITLIST.length} on the waitlist`,
  },
  {
    href: RULES_PATH,
    icon: BookOpen,
    title: "Rules",
    description: "Ball choice now. Full tournament rules closer to the day.",
  },
  {
    href: FEEDBACK_PATH,
    icon: MessageSquareText,
    title: "Feedback",
    description: "Ideas, issues, and suggestions for this tournament.",
  },
];

export default function TournamentTwelveOverviewPage() {
  return (
    <div className="grid gap-5">
      <TournamentSectionCard title="When & Where">
        <p className="font-display text-lg font-semibold tracking-tight text-ink">
          {DATE_LABEL} · {TIME_LABEL}
        </p>
        <p className="font-display text-lg font-semibold tracking-tight text-ink">
          <a
            href={VENUE.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-court underline decoration-court/40 underline-offset-4 transition hover:decoration-court"
          >
            {VENUE.name}
          </a>
        </p>
        <p>
          <a
            href={VENUE.mapsHref}
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-outline-strong underline-offset-4 transition hover:text-ink"
          >
            {VENUE.address}
          </a>
        </p>
        <p>This is our first indoor tournament.</p>
      </TournamentSectionCard>

      <section className="grid gap-4 sm:grid-cols-3">
        {QUICK_LINKS.map(({ href, icon: Icon, title, description }) => (
          <Link
            key={href}
            href={href}
            className="group surface-card flex flex-col rounded-[26px] border border-transparent p-5 transition duration-200 hover:-translate-y-0.5 hover:border-outline-strong"
          >
            <div className="flex items-center justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-court-soft text-court">
                <Icon className="h-[18px] w-[18px]" />
              </span>
              <ArrowRight className="h-4 w-4 text-muted transition group-hover:translate-x-0.5 group-hover:text-ink" />
            </div>
            <h3 className="mt-4 font-display text-lg font-semibold tracking-tight text-ink">
              {title}
            </h3>
            <p className="mt-1 text-sm leading-6 text-muted">{description}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
