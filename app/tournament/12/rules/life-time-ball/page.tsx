import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { TournamentSectionCard } from "@/components/tournament-section-card";

import { RULES_PATH } from "../../content";

export const metadata: Metadata = {
  title: "Why We're Switching to the Life Time Ball",
  description:
    "Why the 12th Cambrian Pickleball Tournament uses the Life Time ball instead of the Franklin X-40, how we'll help players adapt, and answers to common questions.",
};

const MOTIVATIONS = [
  {
    title: "It will make us better players.",
    body: "The LT ball is faster, but it's also more predictable. It keeps its shape and bounces consistently, so you'll see fewer odd bounces and fewer of the unforced errors they cause. It's the official ball of the PPA Tour, and independent reviewers rate it highly for consistency at speed.",
  },
  {
    title: "The game has already moved.",
    body: "Most 3.5+ players, and premium centers like The Hub, have switched to the LT ball, and many of those players won't go back to the X-40. Cambrian players compete at a high level, and our tournament should reflect that.",
  },
  {
    title: "The question is when, not if.",
    body: "Most players we've talked to agree we need to switch eventually. The main concern is timing. With six weeks until the tournament, we believe now is the right time, and there's enough runway to practice and adjust.",
  },
  {
    title: "It lasts much longer.",
    body: "Outdoors, an X-40 typically lasts about two games. An LT ball lasts ten or more. That means less plastic, less waste, and less money spent on balls.",
  },
];

const FAQ = [
  {
    question: "Why now? Why not wait until the spring tournament in February?",
    answer:
      "The current organizers can only set rules for this tournament. The next tournament's rules will be decided by its organizers. If we believe this change is right, this tournament is where we can make it.",
  },
  {
    question: "This is our first indoor tournament. Why add another big change?",
    answer:
      "Indoors, the LT ball is actually easier to control. Sticking with the X-40 wouldn't make the indoor transition any smaller. Both balls will play differently indoors than they do outdoors.",
  },
  {
    question: "I'm fine with the LT ball, but I'm worried about visibility.",
    answer:
      "Under indoor lighting, LT balls are easy to see. In bright sunlight, the X-40's fluorescent color does stand out more. Indoors, the LT ball is perfectly fine.",
  },
  {
    question: "What happens to all the X-40 balls we already bought?",
    answer:
      "They won't go to waste. We can use them for drills and casual post-tournament play, and players who aren't in the tournament are welcome to buy or borrow them.",
  },
  {
    question: "Honestly, I'll play worse with the LT ball. Isn't that a disadvantage?",
    answer:
      "What we've seen is that the ball itself isn't the real problem. Switching back and forth between balls is. Once you play consistently with the LT ball, most players adjust within a few games. Our advice is to commit to it now and practice with it until the tournament.",
  },
];

const FURTHER_READING = [
  {
    label: "Pickleheads: Best Pickleball Balls",
    href: "https://www.pickleheads.com/pickleball-gear/pickleball-balls",
  },
  {
    label: "Pickleball Effect: Best Pickleball Balls, Tested & Ranked",
    href: "https://pickleballeffect.com/equipment-reviews/best-pickleball-balls-tested-ranked/",
  },
];

const linkClassName =
  "font-medium text-court underline decoration-court/40 underline-offset-4 transition hover:decoration-court";

export default function LifeTimeBallPage() {
  return (
    <div className="grid gap-5">
      <Link
        href={RULES_PATH}
        className="soft-button inline-flex w-fit items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium"
      >
        <ArrowLeft className="h-4 w-4" />
        All rules
      </Link>

      <TournamentSectionCard eyebrow="Rule · Official ball" title="Why We're Switching to the Life Time Ball">
        <p>
          For this tournament, we&apos;re moving from the Franklin X-40 to the Life Time (LT)
          ball. We know this is a big change, so we want to explain why we&apos;re making it.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {MOTIVATIONS.map((item) => (
            <div
              key={item.title}
              className="rounded-[24px] border border-outline/80 bg-white/80 p-5"
            >
              <h3 className="font-display text-lg font-semibold tracking-tight text-ink">
                {item.title}
              </h3>
              <p className="mt-2 text-[0.95rem] leading-7">{item.body}</p>
            </div>
          ))}
        </div>
      </TournamentSectionCard>

      <TournamentSectionCard title="How We'll Help You Adapt">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="font-semibold text-ink">Practice balls at Lone Hill:</strong> The
            organizers are providing six LT balls at the Lone Hill Pickleball Courts, two per
            court. They&apos;ll be kept with the court regulars, and anyone can use them.
          </li>
          <li>
            <strong className="font-semibold text-ink">Balls for teams:</strong> We&apos;re also
            considering giving each team two LT balls once teams are formed, so you can practice
            together.
          </li>
        </ul>
      </TournamentSectionCard>

      <TournamentSectionCard title="FAQ">
        <div className="divide-y divide-outline/80 overflow-hidden rounded-[24px] border border-outline/80 bg-white/80">
          {FAQ.map((item) => (
            <details key={item.question} className="group px-5 py-4">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4 font-semibold text-ink [&::-webkit-details-marker]:hidden">
                <span>{item.question}</span>
                <span
                  aria-hidden
                  className="mt-0.5 text-lg leading-none text-court transition group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="mt-3 text-[0.95rem] leading-7">{item.answer}</p>
            </details>
          ))}
        </div>
      </TournamentSectionCard>

      <TournamentSectionCard title="Closing">
        <p>
          We made this decision to raise the skill and competitiveness of Cambrian pickleball.
          The wider game has already moved to this ball, and we believe six weeks is enough time
          for Cambrian players to adapt, most within a few days to a week. We&apos;re confident
          this change will make our tournament stronger.{" "}
          <span className="font-semibold text-ink">See you on the courts!</span>
        </p>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-court">
            Further reading
          </p>
          <ul className="mt-2 space-y-1.5">
            {FURTHER_READING.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClassName}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </TournamentSectionCard>
    </div>
  );
}
