import type { Metadata } from "next";

import { FeedbackBoard, type FeedbackSearchParams } from "@/components/feedback-board";

import { FEEDBACK_PATH, TOURNAMENT_SLUG } from "../content";

export const metadata: Metadata = {
  title: "Feedback",
  description: "Share ideas, issues, and suggestions for the 12th Cambrian Pickleball Tournament.",
};

export default async function TournamentTwelveFeedbackPage({
  searchParams,
}: {
  searchParams: Promise<FeedbackSearchParams>;
}) {
  return (
    <FeedbackBoard
      heading="Tell the organizers what you think"
      intro={
        <div className="grid gap-3 text-[0.98rem] leading-7 text-muted">
          <p>
            This page keeps feedback in one place, so issues stay in focus instead of getting lost
            in the WhatsApp thread. It&apos;s the official way to reach the organizers: we read
            every post here, try to respond, and build in ideas where they make sense. We
            don&apos;t have the bandwidth to follow WhatsApp, so please share your feedback here.
          </p>
          <p className="text-sm leading-6">
            You can post and comment anonymously, but signing in is encouraged and is required to
            upvote or to edit your posts later.
          </p>
        </div>
      }
      basePath={FEEDBACK_PATH}
      tournamentSlug={TOURNAMENT_SLUG}
      searchParams={await searchParams}
    />
  );
}
