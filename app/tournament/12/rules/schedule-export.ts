import { playerName, teamNumber, TOURNAMENT_TITLE } from "../content";
import {
  backToBackPlayersFor,
  PLAYOFF_ROUNDS,
  TENTATIVE_LEAGUE_STARTS,
  type LeagueFixture,
  type Pair,
  type Team,
} from "../schedule";

export type ExportFormat = "csv" | "pdf";

export const EXPORT_FORMATS: { id: ExportFormat; label: string }[] = [
  { id: "csv", label: "CSV" },
  { id: "pdf", label: "PDF" },
];

// A schedule view flattened to plain text, ready for any tabular exporter.
export type ScheduleSheet = {
  title: string;
  filename: string;
  note?: string;
  columns: string[];
  rows: string[][];
};

const FILE_PREFIX = "tournament-12";

function leaguePair(team: Team, pair: Pair, backToBack: string[]) {
  return pair
    .map((position) => `${playerName(team, position)}${backToBack.includes(`${team}${position}`) ? "*" : ""}`)
    .join(" + ");
}

export function leagueSheet(fixtures: LeagueFixture[], player?: { team: Team; position: number }): ScheduleSheet {
  const name = player && playerName(player.team, player.position);
  return {
    title: player ? `League schedule: ${name}'s games (Team ${teamNumber(player.team)})` : "League schedule",
    filename: name ? `${FILE_PREFIX}-league-${name.toLowerCase()}` : `${FILE_PREFIX}-league`,
    note: "* Back-to-back player in the tentative schedule. Start times are estimates.",
    columns: ["Game", "Matchup", "Tentative start", "Lead"],
    rows: fixtures.map((game) => {
      const backToBack = backToBackPlayersFor(game);
      return [
        String(game.priority),
        `${leaguePair(game.home, game.pair, backToBack)} vs ${leaguePair(game.away, game.pair, backToBack)}`,
        TENTATIVE_LEAGUE_STARTS[game.priority - 1].label,
        playerName(game.lead[0] as Team, Number(game.lead[1])),
      ];
    }),
  };
}

export function playoffSheet(team: Team): ScheduleSheet {
  const game = (pair?: Pair) =>
    pair ? `${playerName(team, pair[0])} + ${playerName(team, pair[1])} vs P${pair[0]} + P${pair[1]}` : "";
  return {
    title: `Playoff schedule: Team ${teamNumber(team)}`,
    filename: `${FILE_PREFIX}-playoffs-team-${teamNumber(team)}`,
    note: "Applies if the team qualifies. Times are estimates.",
    columns: ["Stage", "Est. time", "First court", "Second court"],
    rows: PLAYOFF_ROUNDS.flatMap(({ stage, slots }) =>
      slots.map(({ slot, pairs }) => [stage, slot.time, game(pairs[0]), game(pairs[1])]),
    ),
  };
}

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

async function exportCsv({ columns, rows, filename }: ScheduleSheet) {
  const { default: Papa } = await import("papaparse");
  const csv = Papa.unparse({ fields: columns, data: rows });
  // BOM so Excel reads the file as UTF-8.
  download(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }), `${filename}.csv`);
}

async function exportPdf({ title, note, columns, rows, filename }: ScheduleSheet) {
  const [{ jsPDF }, { autoTable }] = await Promise.all([import("jspdf"), import("jspdf-autotable")]);
  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.text(TOURNAMENT_TITLE, 14, 16);
  doc.setFontSize(11);
  doc.text(title, 14, 23);
  autoTable(doc, {
    head: [columns],
    body: rows,
    startY: 28,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [93, 115, 32] },
  });
  if (note) {
    const { finalY } = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable;
    doc.setFontSize(8);
    doc.text(note, 14, finalY + 6);
  }
  doc.save(`${filename}.pdf`);
}

// Libraries load on demand so the schedule page does not ship them up front.
export function exportSchedule(sheet: ScheduleSheet, format: ExportFormat) {
  return format === "csv" ? exportCsv(sheet) : exportPdf(sheet);
}
