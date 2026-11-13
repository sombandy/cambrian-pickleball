import { redirect } from "next/navigation";

import { TEAMS_PATH } from "../content";

// Old URL for the Teams tab; kept so shared links still work.
export default function TournamentTwelvePlayersPage() {
  redirect(TEAMS_PATH);
}
