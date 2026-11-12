import { TEAM_DIRECTORY, leaguePlayerNames } from '@/lib/tournament12/team-directory';
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
  { label: "Scores", href: `${TOURNAMENT_PATH}/scores` },
  { label: "Players", href: PLAYERS_PATH },
  { label: "Rules", href: RULES_PATH },
  { label: "Feedback", href: FEEDBACK_PATH },
];

// Each team in its captain's proposed lineup order; position sets the player number (first name is player 1, last is player 5).
export const TEAM_ROSTERS = leaguePlayerNames();
export const TEAM_NAMES = Object.fromEntries(TEAM_DIRECTORY.map(t => [t.scheduleLetter,t.name])) as Record<Team,string>;
export const TEAM_CAPTAINS = Object.fromEntries(TEAM_DIRECTORY.map(t => [t.scheduleLetter,t.captainMemberName])) as Record<Team,string>;

export const PLAYERS = Object.values(TEAM_ROSTERS).flat();

// Teams are known by number (Team 1–6); the schedule keys them A–F.
export const teamNumber = (team: Team) => TEAMS.indexOf(team) + 1;

// First name of a team's player at a 1-based lineup position. First names are unique across the tournament.
export const playerName = (team: Team, position: number) => TEAM_ROSTERS[team][position - 1].split(" ")[0];

export const WAITLIST: string[] = [];
