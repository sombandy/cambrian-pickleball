import { redirect } from "next/navigation";

import { TEAMS_PATH } from "./content";

export default function TournamentTwelvePage() {
  redirect(TEAMS_PATH);
}
