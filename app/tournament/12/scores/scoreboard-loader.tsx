"use client";
import dynamic from "next/dynamic";

const ScoringClient = dynamic(() => import("@/lib/tournament12/client"), {
  ssr: false,
  loading: () => <p role="status">Opening tournament scores…</p>,
});
export function ScoreboardLoader({
  authenticationEnabled,
}: {
  authenticationEnabled: boolean;
}) {
  return <ScoringClient authenticationEnabled={authenticationEnabled} />;
}
