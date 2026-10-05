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
      heading="Help shape tournament 12."
      basePath={FEEDBACK_PATH}
      tournamentSlug={TOURNAMENT_SLUG}
      searchParams={await searchParams}
    />
  );
}
