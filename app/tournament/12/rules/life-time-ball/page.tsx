import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { TournamentSectionCard } from "@/components/tournament-section-card";

import { RULES_PATH } from "../../content";

export const metadata: Metadata = {
  title: "Why we're switching to the Life Time ball",
  description:
    "Why the 12th Cambrian Pickleball Tournament uses the Life Time ball instead of the Franklin X-40, how we'll help players adapt, and answers to common questions.",
};

const REASONS = [
  {
    title: "It will make us better players.",
    body: "The LT ball is faster, but it's also more predictable. It keeps its shape and bounces consistently, so you'll see fewer odd bounces and fewer of the unforced errors they cause.",
  },
  {
    title: "The pros play with it.",
    body: "It's the official ball of both pro leagues, the PPA Tour and Major League Pickleball. Most 3.5+ players have already switched.",
  },
  {
    title: "The question is when, not if.",
    body: "Most players agree we'll switch eventually. With 6 weeks to go, now is the right time.",
  },
  {
    title: "It's actually cheaper.",
    body: "Outdoors, an X-40 lasts about 2 games. An LT ball lasts 10 or more, so you buy far fewer balls.",
  },
];

const SUPPORT = [
  {
    title: "Practice balls this week.",
    body: "We're giving 6 LT balls to different groups so you can start practicing this week. To get one for your group, reach out to an organizer. We'll also keep a couple of balls with Piyush, so players at Lone Hill have access to them too.",
  },
  {
    title: "Balls for teams.",
    body: "We're also considering giving each team 2 LT balls once teams are formed, so you can practice together.",
  },
];

const FAQ = [
  {
    question: "This is our first indoor tournament. Why add another big change?",
    answer:
      "It doesn't add to the change. It's likely to help with it: indoors, the LT ball is actually easier to control.",
  },
  {
    question: "Why now? Why not wait until the spring tournament in February?",
    answer:
      "The current organizers can only set rules for this tournament. The next tournament's rules will be decided by its organizers.",
  },
  {
    question: "I'm fine with the LT ball, but I'm worried about visibility.",
    answer: "In our experience, visibility indoors is perfect. The LT ball is easy to see under indoor lighting.",
  },
  {
    question: "What happens to all the X-40 balls we already bought?",
    answer: "They won't go to waste. Keep playing and drilling with them anywhere outside the tournament.",
  },
  {
    question: "Honestly, I'll play worse with the LT ball. Isn't that a disadvantage?",
    answer:
      "What we've seen is that the ball itself isn't the real problem. Switching back and forth between balls is. Once you play consistently with the LT ball, most players adjust within a few games.",
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

function BulletList({ items }: { items: { title: string; body: string }[] }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.title} className="flex gap-3">
          <span aria-hidden className="mt-[0.7rem] h-1.5 w-1.5 shrink-0 rounded-full bg-court" />
          <p>
            <strong className="font-semibold text-ink">{item.title}</strong> {item.body}
          </p>
        </li>
      ))}
    </ul>
  );
}

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

      <TournamentSectionCard eyebrow="Rule · Official ball" title="Why we're switching to the Life Time ball">
        <p>
          For this tournament, we&apos;re switching from the Franklin X-40 to the Life Time (LT)
          ball. Here&apos;s why.
        </p>
        <BulletList items={REASONS} />
      </TournamentSectionCard>

      <TournamentSectionCard title="How the organizers will help you adapt">
        <BulletList items={SUPPORT} />
      </TournamentSectionCard>

      <TournamentSectionCard title="FAQ">
        <dl className="divide-y divide-outline/80">
          {FAQ.map((item) => (
            <div key={item.question} className="py-4 first:pt-0 last:pb-0">
              <dt className="font-semibold text-ink">{item.question}</dt>
              <dd className="mt-1.5">{item.answer}</dd>
            </div>
          ))}
        </dl>
      </TournamentSectionCard>

      <TournamentSectionCard title="Closing">
        <p>
          We made this decision to raise the level of Cambrian pickleball. The wider game has
          already moved to this ball, and we believe 6 weeks is enough time for Cambrian players
          to adapt, most within a few days to a week. We&apos;re confident this change will{" "}
          <span className="font-semibold text-ink">
            raise our players&apos; skill levels and make our tournament stronger.
          </span>
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
