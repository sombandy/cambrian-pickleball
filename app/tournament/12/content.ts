import { getTournamentFeedbackPath, getTournamentPath } from "@/lib/tournaments";

export const TOURNAMENT_SLUG = "12";
export const TOURNAMENT_PATH = getTournamentPath(TOURNAMENT_SLUG);
export const FEEDBACK_PATH = getTournamentFeedbackPath(TOURNAMENT_SLUG);
export const PLAYERS_PATH = `${TOURNAMENT_PATH}/players`;
export const RULES_PATH = `${TOURNAMENT_PATH}/rules`;
export const LIFE_TIME_BALL_PATH = `${RULES_PATH}/life-time-ball`;

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

export const PLAYERS = [
  "Abhinay",
  "Ankit Agarwal",
  "Arun V",
  "Balaji",
  "Basavaraj",
  "Bhanu Pamidi",
  "Devang Bhagat",
  "GT",
  "Jaski Singh",
  "Jaynesh Doshi",
  "Kaushik Ram",
  "Krishna Veturi",
  "Kulwinder",
  "Monish",
  "Muthu Sada",
  "Naresh Ramaiya",
  "Nirav Shah",
  "Piyush",
  "Prabhu",
  "Priyank Jain",
  "Raja Rajendran",
  "Rajan",
  "Rajesh Radhakrishnan",
  "Satish Mavuri",
  "Sharan Jayadevaiah",
  "Shivesh",
  "Som",
  "Srini",
  "Suren Seshadri",
  "Venkata Ramanan",
];

export const WAITLIST = ["Badhri Krishnamoorthy"];
