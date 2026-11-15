import type { Metadata } from "next";
import Image from "next/image";

import { CompetitiveTournamentTabs } from "@/components/competitive-tournament-tabs";

export const metadata: Metadata = {
  title: "Cambrian Competitive Tournament 1",
  description:
    "A purely competitive doubles tournament for the Cambrian pickleball community. Tournament info, rules, and registered players.",
};

export default function CompetitiveTournamentPage() {
  return (
    <main className="grid gap-5 pb-12">
      <section className="surface-card relative isolate overflow-hidden rounded-[32px] px-5 py-8 sm:px-8 sm:py-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(140,169,43,0.18),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(93,115,32,0.12),transparent_28%)]" />

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-7">
          <Image
            priority
            className="aspect-[16/9] w-full shrink-0 rounded-2xl border border-outline/80 object-cover sm:w-64"
            src="/images/tournaments/competitive-1/participants.jpg"
            alt="Participants of Cambrian Competitive Tournament 1 gathered on court at AVAC"
            width={1600}
            height={900}
            sizes="(min-width: 640px) 256px, 100vw"
          />
          <div className="min-w-0 max-w-2xl">
            <span className="inline-flex rounded-full border border-court/15 bg-court-soft px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-court sm:text-xs">
              Cambrian Pickleball Community
            </span>
            <h1 className="mt-4 font-display text-4xl leading-[0.96] font-semibold tracking-tight text-ink sm:text-5xl">
              Cambrian Competitive Tournament 1
            </h1>
            <p className="mt-4 text-base leading-7 text-muted sm:text-[1.06rem]">
              Community Spirit. Competitive Play. One Tournament.
            </p>
            <p className="mt-3 text-sm font-medium text-muted">
              Organized by{" "}
              <span className="font-semibold text-ink">Abhinay and Bhanu</span>
            </p>
          </div>
        </div>
      </section>

      <CompetitiveTournamentTabs />
    </main>
  );
}
