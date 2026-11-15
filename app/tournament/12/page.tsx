import { redirect } from "next/navigation";

import { CHAMPIONS_PATH } from "./content";

export default function TournamentTwelvePage() {
  redirect(CHAMPIONS_PATH);
}
