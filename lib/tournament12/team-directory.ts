// Official league order supplied by the organizer on November 12, 2026.
// Team rows map to A–F; members map to P1–P5. Playoff swaps live in tournament state.
export type TeamCode = "A" | "B" | "C" | "D" | "E" | "F";
export interface NamedTeam {
  id: string;
  scheduleLetter: TeamCode;
  name: string;
  shortName: string;
  abbreviation: string;
  captain: string;
  captainMemberName: string;
  members: readonly string[];
  logo: string;
}
export const TEAM_DIRECTORY: readonly NamedTeam[] = [
  {
    id: "diwali-dinkers",
    scheduleLetter: "A",
    name: "Diwali Dinkers",
    shortName: "Dinkers",
    abbreviation: "DD",
    captain: "Kaushik Ram",
    captainMemberName: "Kaushik Ram",
    members: [
      "Sharan Jayadevaiah",
      "Nirav Shah",
      "Naresh Ramaiya",
      "Kaushik Ram",
      "Suren Seshadri",
    ],
    logo: "team-logos/diwali-dinkers.jpg",
  },
  {
    id: "dink-a-dhamaka",
    scheduleLetter: "B",
    name: "Dink-A-Dhamaka",
    shortName: "Dhamaka",
    abbreviation: "DAD",
    captain: "Jaynesh Doshi",
    captainMemberName: "Jaynesh Doshi",
    members: ["Kulwinder", "Jaynesh Doshi", "Srini", "Som", "Devang Bhagat"],
    logo: "team-logos/dink-a-dhamaka.jpg",
  },
  {
    id: "susurbati-lobbers",
    scheduleLetter: "C",
    name: "Susurbati Lobbers",
    shortName: "Lobbers",
    abbreviation: "SL",
    captain: "Ankit Agarwal",
    captainMemberName: "Ankit Agarwal",
    members: ["Satish Mavuri", "Piyush", "Ankit Agarwal", "Monish", "Rajan"],
    logo: "team-logos/susurbati-lobbers.jpg",
  },
  {
    id: "patakha-paddles",
    scheduleLetter: "D",
    name: "Patakha Paddles",
    shortName: "Patakha",
    abbreviation: "PP",
    captain: "Raja Rajendran",
    captainMemberName: "Raja Rajendran",
    members: [
      "Rajesh Radhakrishnan",
      "Aditya",
      "Bhanu Pamidi",
      "Badhri Krishnamoorthy",
      "Raja Rajendran",
    ],
    logo: "team-logos/patakha-paddles.jpg",
  },
  {
    id: "lamp-lighters",
    scheduleLetter: "E",
    name: "Lamp Lighters",
    shortName: "Lighters",
    abbreviation: "LL",
    captain: "Arun Venkatesan",
    captainMemberName: "Arun V",
    members: [
      "Venkata Ramanan",
      "Priyank Jain",
      "Arun V",
      "Basavaraj",
      "Shivesh",
    ],
    logo: "team-logos/lamp-lighters.jpg",
  },
  {
    id: "sutli-bomb-smashers",
    scheduleLetter: "F",
    name: "Sutli Bomb Smashers",
    shortName: "Smashers",
    abbreviation: "SBS",
    captain: "Balaji Rengarajan",
    captainMemberName: "Balaji",
    members: ["Abhinay", "Balaji", "Prabhu", "Krishna", "Jaski Singh"],
    logo: "team-logos/sutli-bomb-smashers.jpg",
  },
];

export function teamDisplay(code: TeamCode) {
  const named = TEAM_DIRECTORY.find((t) => t.scheduleLetter === code)!;
  return {
    code,
    name: named.name,
    shortName: named.shortName,
    abbreviation: named.abbreviation,
    logo: named.logo,
  };
}
export function leaguePlayerNames(): Record<TeamCode, string[]> {
  return Object.fromEntries(
    TEAM_DIRECTORY.map((t) => [t.scheduleLetter, [...t.members]]),
  ) as Record<TeamCode, string[]>;
}
