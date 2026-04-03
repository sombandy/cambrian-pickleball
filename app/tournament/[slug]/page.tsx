import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, MessageSquareText } from "lucide-react";
import { notFound } from "next/navigation";

import { TOURNAMENT_INDEX_PATH } from "@/lib/constants";
import { getTournament, listTournaments } from "@/lib/tournaments";

type TournamentPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: TournamentPageProps): Promise<Metadata> {
  const { slug } = await params;
  const tournament = getTournament(slug);

  if (!tournament) {
    return {};
  }

  return {
    title: tournament.title,
    description: tournament.summary,
  };
}

export function generateStaticParams() {
  return listTournaments().map((tournament) => ({ slug: tournament.slug }));
}

export default async function TournamentDetailPage({ params }: TournamentPageProps) {
  const { slug } = await params;
  const tournament = getTournament(slug);

  if (!tournament) {
    notFound();
  }

  if (tournament.status === "upcoming") {
    return (
      <main className="grid gap-5 pb-12">
        <Link
          href={TOURNAMENT_INDEX_PATH}
          className="inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" />
          All tournaments
        </Link>

        <section className="surface-card relative isolate overflow-hidden rounded-[32px] px-5 py-10 sm:px-8 sm:py-12">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(140,169,43,0.18),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(93,115,32,0.1),transparent_26%)]" />

          <div className="relative max-w-2xl">
            <span className="inline-flex rounded-full border border-court/15 bg-court-soft px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-court sm:text-xs">
              Tournament {tournament.edition}
            </span>
            <h1 className="mt-4 font-display text-4xl leading-[0.96] font-semibold tracking-tight text-ink sm:text-5xl">
              {tournament.title}
            </h1>
            <p className="mt-4 text-lg leading-8 text-muted">Coming up.</p>

            {tournament.feedbackHref ? (
              <div className="mt-7">
                <Link
                  href={tournament.feedbackHref}
                  className="primary-button inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium"
                >
                  <MessageSquareText className="h-4 w-4" />
                  Tournament feedback
                </Link>
              </div>
            ) : null}
          </div>
        </section>
      </main>
    );
  }

  if (!tournament.championImage || !tournament.participantImage) {
    notFound();
  }

  return (
    <main className="grid gap-5 pb-12">
      <Link
        href={TOURNAMENT_INDEX_PATH}
        className="inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        All tournaments
      </Link>

      <section className="surface-card relative isolate overflow-hidden rounded-[34px] p-3 sm:p-4">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(140,169,43,0.2),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(93,115,32,0.14),transparent_24%)]" />

        <div className="relative">
          <div className="px-1 py-1 sm:px-2">
            <h1 className="max-w-[12ch] font-display text-[2rem] leading-[0.96] font-semibold tracking-tight text-ink sm:max-w-none sm:text-[2.6rem]">
              {tournament.title}
            </h1>
            <p className="mt-3 text-sm leading-6 text-muted">
              {tournament.detailsLine}
            </p>
            <p className="mt-3 text-[1.02rem] leading-6 font-medium text-ink sm:text-[1.12rem]">
              {tournament.snapshotLine}
            </p>
          </div>

          <div className="mt-4 overflow-hidden rounded-[30px] bg-[#12261a] p-2 shadow-[0_34px_60px_-40px_rgba(17,34,23,0.72)]">
            <div className="mb-3 px-2 pt-2 sm:px-3">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-white/82">
                Champion
              </p>
            </div>
            <Image
              src={tournament.championImage.src}
              alt={tournament.championImage.alt}
              width={tournament.championImage.width}
              height={tournament.championImage.height}
              priority
              loading="eager"
              fetchPriority="high"
              sizes="100vw"
              className="h-auto w-full rounded-[24px] object-cover"
            />
          </div>
        </div>
      </section>

      <section className="surface-card overflow-hidden rounded-[34px] p-3 sm:p-4">
        <div className="mb-3 px-2 pt-1">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-court">
            Participants
          </p>
          <p className="mt-1 text-sm text-muted">Full tournament group on court</p>
        </div>
        <div className="overflow-hidden rounded-[30px] border border-outline/80 bg-white">
          <Image
            src={tournament.participantImage.src}
            alt={tournament.participantImage.alt}
            width={tournament.participantImage.width}
            height={tournament.participantImage.height}
            sizes="100vw"
            className="block aspect-[4/3] w-full object-cover sm:aspect-auto"
          />
        </div>
      </section>
    </main>
  );
}
