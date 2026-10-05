import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CircleDot } from "lucide-react";

import { TournamentSectionCard } from "@/components/tournament-section-card";

import { LIFE_TIME_BALL_PATH } from "../content";

export const metadata: Metadata = {
  title: "Rules",
};

// Each rule with its own detail page. Add new entries as rules are finalized.
const RULE_PAGES = [
  {
    href: LIFE_TIME_BALL_PATH,
    icon: CircleDot,
    title: "Official ball: Life Time",
    description:
      "All tournament games use the Life Time ball instead of the Franklin X-40. Read why we're switching, how we'll help you practice, and the FAQ.",
  },
];

export default function TournamentTwelveRulesPage() {
  return (
    <div className="grid gap-5">
      <TournamentSectionCard title="Rules">
        <p>The teams and the format of the tournament will be posted soon.</p>

        <ul className="grid gap-3">
          {RULE_PAGES.map(({ href, icon: Icon, title, description }) => (
            <li key={href}>
              <Link
                href={href}
                className="group flex items-start gap-4 rounded-[24px] border border-outline/80 bg-white/80 p-5 transition duration-200 hover:-translate-y-0.5 hover:border-outline-strong sm:p-6"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-court-soft text-court">
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-lg font-semibold tracking-tight text-ink">
                    {title}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-muted">{description}</p>
                </div>
                <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted transition group-hover:translate-x-0.5 group-hover:text-ink" />
              </Link>
            </li>
          ))}
        </ul>
      </TournamentSectionCard>
    </div>
  );
}
