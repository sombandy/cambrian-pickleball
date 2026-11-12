"use client";
import { usePathname } from "next/navigation";

// Courtside scoring needs the score rows near the top; retain the full introduction elsewhere.
export function TournamentIntro({ children }: { children: React.ReactNode }) {
  return usePathname() === "/tournament/12/scores" ? null : <>{children}</>;
}
