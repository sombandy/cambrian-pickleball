import { TOURNAMENT_FEEDBACK_PATH, TOURNAMENT_INDEX_PATH } from "@/lib/constants";

export type TournamentStatus = "completed" | "upcoming";

export type TournamentImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

export type Tournament = {
  slug: string;
  edition: number;
  title: string;
  dateLabel: string;
  summary: string;
  detailsLine?: string;
  snapshotLine?: string;
  status: TournamentStatus;
  statusLabel: string;
  previewImage?: TournamentImage;
  championImage?: TournamentImage;
  participantImage?: TournamentImage;
  feedbackHref?: string;
};

export function getTournamentPath(slug: string) {
  return `${TOURNAMENT_INDEX_PATH}/${slug}`;
}

const tournamentTenChampionImage: TournamentImage = {
  src: "/images/tournaments/10/champions.jpeg",
  alt: "Champions of the 10th Cambrian Pickleball Tournament celebrating together on court.",
  width: 1600,
  height: 1200,
};

const tournamentTenParticipantImage: TournamentImage = {
  src: "/images/tournaments/10/participants.jpeg",
  alt: "Participants gathered on court for the 10th Cambrian Pickleball Tournament.",
  width: 1600,
  height: 900,
};

const tournaments: Tournament[] = [
  {
    slug: "11",
    edition: 11,
    title: "11th Cambrian Pickleball Tournament",
    dateLabel: "Coming up",
    summary: "The next Cambrian community tournament is in planning now.",
    status: "upcoming",
    statusLabel: "Upcoming",
    feedbackHref: TOURNAMENT_FEEDBACK_PATH,
  },
  {
    slug: "10",
    edition: 10,
    title: "10th Cambrian Pickleball Tournament",
    dateLabel: "Saturday, March 28, 2026",
    summary: "A full-field Cambrian tournament that built to a dramatic final under the lights.",
    detailsLine: "32 players in eight teams on Saturday, March 28, 2026.",
    snapshotLine: "An intense day of play ended with a nail-biting final decided by a single point.",
    status: "completed",
    statusLabel: "Completed",
    previewImage: tournamentTenChampionImage,
    championImage: tournamentTenChampionImage,
    participantImage: tournamentTenParticipantImage,
  },
];

export function listTournaments() {
  return tournaments;
}

export function getTournament(slug: string) {
  return tournaments.find((tournament) => tournament.slug === slug);
}
