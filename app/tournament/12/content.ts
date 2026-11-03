import { getTournamentFeedbackPath, getTournamentPath } from "@/lib/tournaments";

import type { Team } from "./schedule";

export const TOURNAMENT_SLUG = "12";
export const TOURNAMENT_PATH = getTournamentPath(TOURNAMENT_SLUG);
export const FEEDBACK_PATH = getTournamentFeedbackPath(TOURNAMENT_SLUG);
export const PLAYERS_PATH = `${TOURNAMENT_PATH}/players`;
export const RULES_PATH = `${TOURNAMENT_PATH}/rules`;

export const TOURNAMENT_TITLE = "12th Cambrian Pickleball Tournament";
export const ORGANIZERS = "Prabhu, Shivesh and Som";
export const DATE_LABEL = "Saturday, November 14, 2026";
export const TIME_LABEL = "11 AM – 7 PM";
export const VENUE = {
  name: "Ace Pickleball Club, San Jose",
  href: "https://www.acepickleballclub.com/san-jose-ca",
  address: "5502 Monterey Rd, San Jose",
  mapsHref: "https://www.google.com/maps/search/?api=1&query=Ace+Pickleball+Club+5502+Monterey+Rd+San+Jose",
};

// Add new sections (e.g. Format) here; the tab bar picks them up.
export const SECTIONS = [
  { label: "Players", href: PLAYERS_PATH },
  { label: "Rules", href: RULES_PATH },
  { label: "Feedback", href: FEEDBACK_PATH },
];

// Each team sorted alphabetically; position sets the player number (first name is A1, last is A5).
export const TEAM_ROSTERS: Record<Team, string[]> = {
  A: ["Kaushik Ram", "Naresh Ramaiya", "Nirav Shah", "Sharan Jayadevaiah", "Suren Seshadri"],
  B: ["Devang Bhagat", "Jaynesh Doshi", "Kulwinder", "Som", "Srini"],
  C: ["Ankit Agarwal", "Monish", "Piyush", "Rajan", "Satish Mavuri"],
  D: ["Aditya", "Badhri Krishnamoorthy", "Bhanu Pamidi", "Raja Rajendran", "Rajesh Radhakrishnan"],
  E: ["Arun V", "Basavaraj", "Priyank Jain", "Shivesh", "Venkata Ramanan"],
  F: ["Abhinay", "Balaji", "Jaski Singh", "Krishna Veturi", "Prabhu"],
};

export const PLAYERS = Object.values(TEAM_ROSTERS).flat();

export const WAITLIST: string[] = [];
