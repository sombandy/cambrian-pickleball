import type { Metadata } from "next";
import { clerkEnabled } from "@/lib/clerk-enabled";
import { ScoreboardLoader } from "./scoreboard-loader";

export const metadata: Metadata = { title: "Scores and standings" };
export default function ScoresPage() {
  return <ScoreboardLoader authenticationEnabled={clerkEnabled} />;
}
