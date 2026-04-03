import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { getTournamentPath, listTournaments } from "@/lib/tournaments";

export const metadata: Metadata = {
  title: "Tournaments",
  description: "Browse completed and upcoming Cambrian Pickleball tournaments.",
};

export default function TournamentIndexPage() {
  const tournaments = listTournaments();

  return (
    <main className="grid gap-5 pb-12">
      <section className="surface-card relative isolate overflow-hidden rounded-[32px] px-5 py-8 sm:px-8 sm:py-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(140,169,43,0.18),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(93,115,32,0.12),transparent_28%)]" />

        <div className="relative max-w-2xl">
          <span className="inline-flex rounded-full border border-court/15 bg-court-soft px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-court sm:text-xs">
            Events
          </span>
          <h1 className="mt-4 font-display text-4xl leading-[0.96] font-semibold tracking-tight text-ink sm:text-5xl">
            Cambrian Pickleball Tournaments
          </h1>
          <p className="mt-4 max-w-[32ch] text-base leading-7 text-muted sm:text-[1.06rem]">
            Past winners, full-group photos, and the next tournament in one clean list.
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {tournaments.map((tournament) => (
          <Link
            key={tournament.slug}
            href={getTournamentPath(tournament.slug)}
            className="group surface-card overflow-hidden rounded-[30px] border border-transparent p-4 transition duration-200 hover:-translate-y-0.5 hover:border-outline-strong"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-3">
                <span className="inline-flex rounded-full border border-court/15 bg-court-soft px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-court sm:text-xs">
                  {tournament.statusLabel}
                </span>
                <div>
                  <p className="text-sm font-medium text-muted">{tournament.dateLabel}</p>
                  <h2 className="mt-1 font-display text-[1.7rem] leading-[1.02] font-semibold tracking-tight text-ink">
                    {tournament.title}
                  </h2>
                </div>
              </div>
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/80 text-ink shadow-[0_16px_24px_-24px_rgba(30,41,59,0.45)] transition duration-200 group-hover:bg-white">
                <ArrowRight className="h-5 w-5" />
              </span>
            </div>

            {tournament.previewImage ? (
              <div className="mt-5 overflow-hidden rounded-[24px] border border-outline/80 bg-white">
                <Image
                  src={tournament.previewImage.src}
                  alt={tournament.previewImage.alt}
                  width={tournament.previewImage.width}
                  height={tournament.previewImage.height}
                  sizes="(min-width: 768px) 44vw, 100vw"
                  className="aspect-[16/10] w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                />
              </div>
            ) : (
              <div className="mt-5 flex min-h-56 items-end overflow-hidden rounded-[24px] border border-outline/80 bg-[radial-gradient(circle_at_top_left,rgba(140,169,43,0.28),transparent_34%),linear-gradient(180deg,rgba(255,255,252,0.96)_0%,rgba(246,249,232,0.94)_100%)] p-6">
                <div>
                  <div className="font-display text-6xl leading-none font-semibold tracking-tight text-ink/90">
                    {tournament.edition}
                  </div>
                  <p className="mt-3 text-sm font-medium uppercase tracking-[0.18em] text-muted">
                    Coming up
                  </p>
                </div>
              </div>
            )}

            <p className="mt-4 max-w-[34ch] text-sm leading-6 text-muted sm:text-[0.98rem]">
              {tournament.summary}
            </p>
          </Link>
        ))}
      </section>
    </main>
  );
}
