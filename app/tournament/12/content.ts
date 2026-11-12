import { getTournamentFeedbackPath, getTournamentPath } from "@/lib/tournaments";

import { TEAMS, type Team } from "./schedule";

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

// Each team in its captain's proposed lineup order; position sets the player number (first name is player 1, last is player 5).
export const TEAM_ROSTERS: Record<Team, string[]> = {
  A: ["Sharan Jayadevaiah", "Nirav Shah", "Naresh Ramaiya", "Kaushik Ram", "Suren Seshadri"],
  B: ["Kulwinder", "Jaynesh Doshi", "Srini", "Som", "Devang Bhagat"],
  C: ["Satish Mavuri", "Piyush", "Ankit Agarwal", "Monish", "Rajan"],
  D: ["Rajesh Radhakrishnan", "Aditya", "Bhanu Pamidi", "Badhri Krishnamoorthy", "Raja Rajendran"],
  E: ["Venkata Ramanan", "Priyank Jain", "Arun V", "Basavaraj", "Shivesh"],
  F: ["Abhinay", "Balaji", "Prabhu", "Krishna Veturi", "Jaski Singh"],
};

export const TEAM_NAMES: Record<Team, string> = {
  A: "Diwali Dinkers",
  B: "Dink-A-Dhamaka",
  C: "Susurbati Lobbers",
  D: "Patakha Paddles",
  E: "Lamp Lighters",
  F: "Sutli Bomb Smashers",
};

// Captain per team (must match a TEAM_ROSTERS name).
export const TEAM_CAPTAINS: Record<Team, string> = {
  A: "Kaushik Ram",
  B: "Jaynesh Doshi",
  C: "Ankit Agarwal",
  D: "Raja Rajendran",
  E: "Arun V",
  F: "Balaji",
};

export const PLAYERS = Object.values(TEAM_ROSTERS).flat();

// Teams are known by number (Team 1–6); the schedule keys them A–F.
export const teamNumber = (team: Team) => TEAMS.indexOf(team) + 1;

// First name of a team's player at a 1-based lineup position. First names are unique across the tournament.
export const playerName = (team: Team, position: number) => TEAM_ROSTERS[team][position - 1].split(" ")[0];

export const WAITLIST: string[] = [];
