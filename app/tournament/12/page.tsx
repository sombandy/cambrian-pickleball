import { redirect } from "next/navigation";

import { PLAYERS_PATH } from "./content";

export default function TournamentTwelvePage() {
  redirect(PLAYERS_PATH);
}
