import type { Metadata } from "next";

import { FeedbackBoard, type FeedbackSearchParams } from "@/components/feedback-board";
import { TOURNAMENT_FEEDBACK_PATH } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Tournament Feedback",
  description: "Share ideas, issues, and suggestions for the upcoming 11th Cambrian Pickleball Tournament.",
};

export default async function FeedbackPage({
  searchParams,
}: {
  searchParams: Promise<FeedbackSearchParams>;
}) {
  return (
    <main className="grid gap-5 pb-12">
      <FeedbackBoard
        heading="Help shape tournament 11."
        basePath={TOURNAMENT_FEEDBACK_PATH}
        searchParams={await searchParams}
      />
    </main>
  );
}
