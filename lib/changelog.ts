export interface RankMovement {
  player: string;
  before: number;
  after: number;
  type: "up" | "down" | "new";
}

export interface NewMatch {
  tournament: string;
  team1: string;
  team1Score: number;
  team2: string;
  team2Score: number;
  winner: string;
}

export interface ScoreCorrection {
  tournament: string;
  team1: string;
  team2: string;
  scoreBefore: string;
  scoreAfter: string;
  notes?: string;
}

export interface TournamentRecap {
  name: string;
  location: string;
  matches: number;
  players: number;
  funStats?: { label: string; text: string }[];
}

export interface ChangelogEntry {
  date: string; // YYYY-MM-DD format
  summary: string;
  tournament?: TournamentRecap;
  newMatches?: NewMatch[];
  scoreCorrections?: ScoreCorrection[];
  rankMovements?: RankMovement[];
}

export const changelogEntries: ChangelogEntry[] = [
  {
    date: "2026-10-04",
    summary:
      "Corrected t12 roster (Piyush injured, replaced by Shivesh) and fixed confidence decay for inactive players",
    scoreCorrections: [
      {
        tournament: "t12",
        team1: "Piyush & Arun",
        team2: "8 matches after match 13",
        scoreBefore: "Piyush & Arun",
        scoreAfter: "Shivesh & Arun",
        notes:
          "Piyush was injured after one match (Bhanu/Srini vs Piyush/Arun) and replaced by Shivesh for the rest of the tournament.",
      },
    ],
    rankMovements: [
      { player: "Jaynesh", before: 15, after: 14, type: "up" },
      { player: "Prabhu", before: 17, after: 15, type: "up" },
      { player: "Piyush", before: 14, after: 17, type: "down" },
      { player: "Shivesh", before: 28, after: 23, type: "up" },
      { player: "Kaushik", before: 23, after: 24, type: "down" },
      { player: "Devang", before: 24, after: 25, type: "down" },
      { player: "Ankit", before: 25, after: 27, type: "down" },
      { player: "Krishna", before: 27, after: 28, type: "down" },
      { player: "Ganesh", before: 32, after: 30, type: "up" },
      { player: "Rajan", before: 30, after: 31, type: "down" },
      { player: "Vijay", before: 31, after: 32, type: "down" },
    ],
  },
  {
    date: "2026-10-04",
    summary: "12th Cambrian Tournament data added (49 matches)",
    tournament: {
      name: "12th Cambrian Tournament",
      location: "AVAC, San Jose",
      matches: 49,
      players: 22,
      funStats: [
        {
          label: "On fire",
          text: "Abhinay & Nirav went 8-2, best record of the night",
        },
        { label: "Welcome", text: "Srini makes their debut" },
      ],
    },
    rankMovements: [
      { player: "Abhinay", before: 4, after: 2, type: "up" },
      { player: "Kulwinder", before: 2, after: 3, type: "down" },
      { player: "Monish", before: 3, after: 4, type: "down" },
      { player: "Satish", before: 8, after: 6, type: "up" },
      { player: "Arun", before: 6, after: 7, type: "down" },
      { player: "Raja", before: 9, after: 8, type: "up" },
      { player: "Priyank", before: 7, after: 9, type: "down" },
      { player: "Nirav", before: 15, after: 10, type: "up" },
      { player: "Rajesh", before: 13, after: 11, type: "up" },
      { player: "Muthu", before: 10, after: 12, type: "down" },
      { player: "Som", before: 12, after: 13, type: "down" },
      { player: "Piyush", before: 17, after: 14, type: "up" },
      { player: "Jaynesh", before: 11, after: 15, type: "down" },
      { player: "Basavaraj", before: 14, after: 16, type: "down" },
      { player: "Prabhu", before: 16, after: 17, type: "down" },
      { player: "Naresh", before: 20, after: 19, type: "up" },
      { player: "Sharan", before: 19, after: 20, type: "down" },
      { player: "Suren", before: 22, after: 21, type: "up" },
      { player: "Badhri", before: 23, after: 22, type: "up" },
      { player: "Kaushik", before: 21, after: 23, type: "down" },
      { player: "Ankit", before: 30, after: 25, type: "up" },
      { player: "Jaski", before: 25, after: 26, type: "down" },
      { player: "Krishna", before: 31, after: 27, type: "up" },
      { player: "Shivesh", before: 26, after: 28, type: "down" },
      { player: "Rajan", before: 28, after: 29, type: "down" },
      { player: "Vijay", before: 27, after: 30, type: "down" },
      { player: "Ganesh", before: 29, after: 31, type: "down" },
      { player: "Srini", before: 0, after: 34, type: "new" },
    ],
  },
  {
    date: "2026-06-11",
    summary: "11th Cambrian Tournament data added (48 matches)",
    tournament: {
      name: "11th Cambrian Tournament",
      location: "AVAC, San Jose",
      matches: 48,
      players: 24,
      funStats: [
        {
          label: "On fire",
          text: "Abhinay, Aditya & Balaji — 7-1 each",
        },
        {
          label: "Perfect pairs",
          text: "Arun & Balaji and Abhinay & Aditya went 4-0",
        },
      ],
    },
    rankMovements: [
      { player: "Abhinay", before: 7, after: 4, type: "up" },
      { player: "Aditya", before: 9, after: 5, type: "up" },
      { player: "Arun", before: 8, after: 6, type: "up" },
      { player: "Priyank", before: 5, after: 7, type: "down" },
      { player: "Satish", before: 4, after: 8, type: "down" },
      { player: "Raja", before: 12, after: 9, type: "up" },
      { player: "Muthu", before: 6, after: 10, type: "down" },
      { player: "Jaynesh", before: 10, after: 11, type: "down" },
      { player: "Som", before: 11, after: 12, type: "down" },
      { player: "Rajesh", before: 19, after: 13, type: "up" },
      { player: "Basavaraj", before: 15, after: 14, type: "up" },
      { player: "Nirav", before: 14, after: 15, type: "down" },
      { player: "Prabhu", before: 13, after: 16, type: "down" },
      { player: "Piyush", before: 23, after: 17, type: "up" },
      { player: "Anand", before: 17, after: 18, type: "down" },
      { player: "Sharan", before: 16, after: 19, type: "down" },
      { player: "Naresh", before: 25, after: 20, type: "up" },
      { player: "Kaushik", before: 18, after: 21, type: "down" },
      { player: "Suren", before: 20, after: 22, type: "down" },
      { player: "Badhri", before: 21, after: 23, type: "down" },
      { player: "Devang", before: 22, after: 24, type: "down" },
      { player: "Jaski", before: 26, after: 25, type: "up" },
      { player: "Bhanu", before: 27, after: 26, type: "up" },
      { player: "Shivesh", before: 31, after: 27, type: "up" },
      { player: "Rajan", before: 24, after: 29, type: "down" },
      { player: "Ganesh", before: 29, after: 30, type: "down" },
      { player: "Ankit", before: 30, after: 31, type: "down" },
      { player: "Krishna", before: 33, after: 32, type: "up" },
      { player: "Venkata", before: 32, after: 33, type: "down" },
      { player: "Rajib", before: 0, after: 37, type: "new" },
    ],
  },
  {
    date: "2026-05-25",
    summary: "Two new t6 matches and corrected t10 match scores",
    newMatches: [
      {
        tournament: "t6",
        team1: "Kulwinder & Jaynesh",
        team1Score: 9,
        team2: "Sharan & Basavaraj",
        team2Score: 15,
        winner: "Sharan & Basavaraj",
      },
      {
        tournament: "t6",
        team1: "Venkata & Balaji",
        team1Score: 14,
        team2: "Suren & Ganesh",
        team2Score: 15,
        winner: "Suren & Ganesh",
      },
    ],
    scoreCorrections: [
      {
        tournament: "t10",
        team1: "Anand & Krishna",
        team2: "Bhanu & Som",
        scoreBefore: "18 - 21",
        scoreAfter: "21 - 18",
        notes: "Corrected final match scores",
      },
    ],
    rankMovements: [
      { player: "Anand", before: 19, after: 17, type: "up" },
      { player: "Aditya", before: 11, after: 9, type: "up" },
      { player: "Satish", before: 5, after: 4, type: "up" },
      { player: "Basavaraj", before: 16, after: 15, type: "up" },
      { player: "Krishna", before: 35, after: 33, type: "up" },
      { player: "Som", before: 9, after: 11, type: "down" },
      { player: "Priyank", before: 4, after: 5, type: "down" },
      { player: "Sharan", before: 15, after: 16, type: "down" },
    ],
  },
];
