import {
  gamesFor,
  LEAGUE,
  playerName,
  standings,
  TEAMS,
  type Tournament,
} from "./domain";
import { TEAM_DIRECTORY, teamDisplay } from "./team-directory";
export type Cell =
  string | number | { formula: string; result: string | number };
export interface ExportSheet {
  name: string;
  rows: Cell[][];
}
export function workbookSheets(s: Tournament, updated: string): ExportSheet[] {
  const scores: Cell[][] = [
    [
      "Game",
      "Round",
      "Series",
      "Team A",
      "Players A",
      "Team B",
      "Players B",
      "Score A",
      "Score B",
      "Win points A",
      "Win points B",
      "Differential A",
      "Entered by",
      "Saved at",
      "Team A name",
      "Team B name",
    ],
  ];
  [...LEAGUE, ...gamesFor(s, "semis"), ...gamesFor(s, "finals")].forEach(
    (g) => {
      const r = s.results[g.id],
        n = scores.length + 1;
      const complete = `OR(H${n}="",I${n}="")`;
      scores.push([
        g.id,
        g.phase,
        g.series,
        g.a,
        g.pair.map((p) => playerName(s, g.a, p, g.phase)).join(" + "),
        g.b,
        g.pair.map((p) => playerName(s, g.b, p, g.phase)).join(" + "),
        r?.a ?? "",
        r?.b ?? "",
        {
          formula: `IF(${complete},"",IF(H${n}>I${n},2+IF(AND(H${n}=21,I${n}<=14),1,0),0))`,
          result: r ? (r.a > r.b ? 2 + +(r.a === 21 && r.b <= 14) : 0) : "",
        },
        {
          formula: `IF(${complete},"",IF(I${n}>H${n},2+IF(AND(I${n}=21,H${n}<=14),1,0),0))`,
          result: r ? (r.b > r.a ? 2 + +(r.b === 21 && r.a <= 14) : 0) : "",
        },
        {
          formula: `IF(${complete},"",H${n}-I${n})`,
          result: r ? r.a - r.b : "",
        },
        r?.editor ?? "",
        r?.at ?? "",
        teamDisplay(g.a).name,
        teamDisplay(g.b).name,
      ]);
    },
  );
  const table: Cell[][] = [
    [
      "Team",
      "Played",
      "Wins",
      "Losses",
      "Bonus wins",
      "Win points",
      "Differential",
      "Points scored",
      "Points conceded",
      "Tied on points and PD",
      "Team name",
      "Abbreviation",
    ],
  ];
  standings(s).forEach((r, i) => {
    const n = i + 2,
      a = "Scores!$D$2:$D$61",
      b = "Scores!$F$2:$F$61",
      ap = "Scores!$J$2:$J$61",
      bp = "Scores!$K$2:$K$61";
    const formula = (formula: string, result: number | string): Cell => ({
      formula,
      result,
    });
    table.push([
      r.team,
      formula(`C${n}+D${n}`, r.played),
      formula(
        `COUNTIFS(${a},A${n},${ap},">0")+COUNTIFS(${b},A${n},${bp},">0")`,
        r.wins,
      ),
      formula(
        `COUNTIFS(${a},A${n},${bp},">0")+COUNTIFS(${b},A${n},${ap},">0")`,
        r.losses,
      ),
      formula(
        `COUNTIFS(${a},A${n},${ap},3)+COUNTIFS(${b},A${n},${bp},3)`,
        r.bonus,
      ),
      formula(`SUMIF(${a},A${n},${ap})+SUMIF(${b},A${n},${bp})`, r.points),
      formula(
        `SUMIF(${a},A${n},Scores!$L$2:$L$61)-SUMIF(${b},A${n},Scores!$L$2:$L$61)`,
        r.pd,
      ),
      formula(
        `SUMIF(${a},A${n},Scores!$H$2:$H$61)+SUMIF(${b},A${n},Scores!$I$2:$I$61)`,
        r.scored,
      ),
      formula(
        `SUMIF(${a},A${n},Scores!$I$2:$I$61)+SUMIF(${b},A${n},Scores!$H$2:$H$61)`,
        r.conceded,
      ),
      formula(
        `IF(COUNTIFS($F$2:$F$7,F${n},$G$2:$G$7,G${n})>1,"Yes","No")`,
        r.tied ? "Yes" : "No",
      ),
      teamDisplay(r.team).name,
      teamDisplay(r.team).abbreviation,
    ]);
  });
  const rosters: ExportSheet[] = (["league", "semis", "finals"] as const).map(
    (phase) => ({
      name:
        phase === "league"
          ? "League roster"
          : phase === "semis"
            ? "Semifinal roster"
            : "Final roster",
      rows: [
        ["Team", "Position", "Player", "Team name"],
        ...TEAMS.flatMap((t) =>
          [1, 2, 3, 4, 5].map((p) => [
            t,
            p,
            playerName(s, t, p, phase),
            teamDisplay(t).name,
          ]),
        ),
      ],
    }),
  );
  return [
    {
      name: "Read me",
      rows: [
        ["12th Cambrian Pickleball Tournament backup", ""],
        ["Snapshot saved at", updated],
        ["Tournament date", "November 14, 2026"],
        ["Current round", s.stage],
        [
          "How to continue in Sheets",
          "Edit Score A and Score B in Scores. Win points and league standings recalculate.",
        ],
        [
          "Sorting standings",
          "After editing, sort Standings by Win points descending, then Differential descending. Resolve exact ties with a played tiebreak.",
        ],
        [
          "Snapshot only",
          "Changes here do not update the tournament app. Do not have some editors use the app while others use this backup.",
        ],
        ["Valid final scores", "21–0 to 21–19; 22–20; 23–21; 23–22."],
        ["Bonus", "Only a 21–14 win or wider earns the extra win-point."],
        [
          "Playoffs",
          "Play all five games. Rank by win-points, then differential, then a played tiebreak.",
        ],
        ["Semifinal seeds", s.seeds.join(", ") || "Not confirmed"],
        ["Final", s.finalists.final.join(" vs ") || "Not determined"],
        ["Third place", s.finalists.third.join(" vs ") || "Not determined"],
        [
          "Lineups",
          "Only the published/current setup lineups are included. League roster remains unchanged.",
        ],
      ],
    },
    { name: "Scores", rows: scores },
    { name: "Standings", rows: table },
    ...rosters,
    {
      name: "Swaps",
      rows: [
        [
          "Round",
          "Team",
          "First position",
          "Second position",
          "Entered by",
          "Saved at",
        ],
        ...(["semis", "finals"] as const).flatMap((p) =>
          s.swaps[p].map((x) => [p, x.team, x.first, x.second, x.editor, x.at]),
        ),
      ],
    },
    {
      name: "Tiebreaks",
      rows: [
        [
          "Series",
          "Winning team",
          "Score A",
          "Score B",
          "Player positions",
          "Entered by",
          "Saved at",
        ],
        ...Object.entries(s.tiebreaks).map(([id, r]) => [
          id,
          r.winner,
          r.a,
          r.b,
          r.positions.join(" + "),
          r.editor,
          r.at,
        ]),
      ],
    },
    {
      name: "Changes",
      rows: [
        ["Saved at", "Entered by", "Change"],
        ...s.history.map((h) => [h.at, h.editor, h.note]),
      ],
    },
    {
      name: "Playoff guide",
      rows: [
        ["Round", "Series", "Game", "Positions", "Court"],
        ...["SF1", "SF2", "F", "P3"].flatMap((series) =>
          (series.startsWith("SF")
            ? [
                [1, 2],
                [3, 4],
                [1, 5],
                [2, 3],
                [4, 5],
              ]
            : [
                [1, 3],
                [2, 4],
                [1, 4],
                [2, 5],
                [3, 5],
              ]
          ).map((p, i) => [
            series.startsWith("SF")
              ? "Semifinal"
              : series === "F"
                ? "Final"
                : "Third place",
            series,
            i + 1,
            p.join(" + "),
            (series === "SF2" || series === "P3" ? 3 : 1) + (i % 2),
          ]),
        ),
      ],
    },
    {
      name: "Team directory",
      rows: [
        [
          "Team name",
          "Captain",
          "League player",
          "Member role",
          "Schedule letter",
          "Player position",
          "Status",
        ],
        ...TEAM_DIRECTORY.flatMap((t) =>
          t.members.map((name, i) => [
            t.name,
            t.captain,
            playerName(s, t.scheduleLetter, i + 1),
            name === t.captainMemberName ? "Captain" : "Player",
            t.scheduleLetter,
            i + 1,
            "Official league positions",
          ]),
        ),
      ],
    },
  ];
}
export function downloadFile(data: BlobPart, filename: string, type: string) {
  const url = URL.createObjectURL(new Blob([data], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
export async function downloadWorkbook(s: Tournament, at: string) {
  const ExcelJS = await import("exceljs");
  const book = new ExcelJS.Workbook();
  book.creator = "12th Cambrian Pickleball Tournament";
  book.calcProperties.fullCalcOnLoad = true;
  workbookSheets(s, at).forEach((sheet) => {
    const tab = book.addWorksheet(sheet.name, {
      views: [{ state: "frozen", ySplit: 1 }],
    });
    sheet.rows.forEach((row) => tab.addRow(row));
    tab.getRow(1).font = { bold: true, color: { argb: "FFF7F8F3" } };
    tab.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF275D4A" },
    };
    tab.columns.forEach(
      (col, i) =>
        (col.width = Math.min(
          65,
          Math.max(
            14,
            ...sheet.rows.map((r) =>
              typeof r[i] === "object" ? 16 : String(r[i] ?? "").length + 2,
            ),
          ),
        )),
    );
    tab.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: sheet.rows.length, column: sheet.rows[0].length },
    };
  });
  const buffer = await book.xlsx.writeBuffer();
  downloadFile(
    buffer as BlobPart,
    "cambrian-tournament-backup.xlsx",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  );
}
export async function createGoogleSpreadsheet(
  sheets: ExportSheet[],
  at: string,
  token: string,
  request: typeof fetch = fetch,
): Promise<string> {
  let createdUrl = "";
  try {
    const call = async (path: string, body: unknown) => {
      const response = await request(
        `https://sheets.googleapis.com/v4/spreadsheets${path}`,
        {
          method: "POST",
          signal: AbortSignal.timeout(20000),
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        },
      );
      if (!response.ok) throw new Error("Google request failed");
      return response.json();
    };
    const created = await call("", {
      properties: {
        title: `12th Cambrian Pickleball Tournament · ${new Date(at).toLocaleString()}`,
        locale: "en_US",
      },
      sheets: sheets.map((s, i) => ({
        properties: {
          sheetId: i,
          title: s.name,
          gridProperties: {
            rowCount: 1000,
            columnCount: 20,
            frozenRowCount: 1,
          },
        },
      })),
    });
    if (
      typeof created.spreadsheetId !== "string" ||
      !/^[A-Za-z0-9_-]+$/.test(created.spreadsheetId)
    )
      throw new Error("Invalid spreadsheet response");
    createdUrl = `https://docs.google.com/spreadsheets/d/${created.spreadsheetId}/edit`;
    await call(`/${created.spreadsheetId}:batchUpdate`, {
      requests: sheets.flatMap((s, i) => [
        {
          updateCells: {
            range: { sheetId: i },
            rows: s.rows.map((row) => ({
              values: row.map((v) => ({
                userEnteredValue:
                  typeof v === "number"
                    ? { numberValue: v }
                    : typeof v === "object"
                      ? { formulaValue: "=" + v.formula }
                      : { stringValue: v },
              })),
            })),
            fields: "userEnteredValue",
          },
        },
        {
          repeatCell: {
            range: { sheetId: i, startRowIndex: 0, endRowIndex: 1 },
            cell: {
              userEnteredFormat: {
                backgroundColor: { red: 0.15, green: 0.36, blue: 0.29 },
                textFormat: {
                  bold: true,
                  foregroundColor: { red: 1, green: 1, blue: 1 },
                },
              },
            },
            fields: "userEnteredFormat",
          },
        },
        {
          autoResizeDimensions: {
            dimensions: {
              sheetId: i,
              dimension: "COLUMNS",
              startIndex: 0,
              endIndex: s.rows[0].length,
            },
          },
        },
      ]),
    });
    return createdUrl;
  } catch {
    throw new Error(
      createdUrl
        ? "Google created a file but could not confirm its contents. Use the download fallback and check your Drive before exporting again."
        : "Google export failed. Download the spreadsheet instead.",
    );
  }
}
interface GoogleToken {
  access_token?: string;
  error?: string;
}
declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient(options: {
            client_id: string;
            scope: string;
            callback: (r: GoogleToken) => void;
            error_callback: () => void;
          }): { requestAccessToken(): void };
        };
      };
    };
  }
}
let googleLoading: Promise<void> | null = null;
export function prepareGoogleExport(): Promise<void> {
  if (window.google?.accounts.oauth2) return Promise.resolve();
  if (googleLoading) return googleLoading;
  googleLoading = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    const timer = setTimeout(() => {
      googleLoading = null;
      reject(
        new Error(
          "Google sign-in could not load. Download the spreadsheet instead.",
        ),
      );
    }, 12000);
    script.onload = () => {
      clearTimeout(timer);
      resolve();
    };
    script.onerror = () => {
      clearTimeout(timer);
      googleLoading = null;
      reject(
        new Error(
          "Google sign-in could not load. Download the spreadsheet instead.",
        ),
      );
    };
    document.head.append(script);
  });
  return googleLoading;
}
// Call from a user tap after prepareGoogleExport: popup must stay in the user-gesture stack on mobile.
export function exportToGoogle(s: Tournament, at: string): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!window.google || !process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
      reject(
        new Error(
          "Google export is not connected yet. Download the spreadsheet instead.",
        ),
      );
      return;
    }
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      scope: "https://www.googleapis.com/auth/drive.file",
      error_callback: () =>
        reject(
          new Error(
            "Google sign-in was closed or blocked. You can download the spreadsheet instead.",
          ),
        ),
      callback: async (response) => {
        if (!response.access_token || response.error) {
          reject(
            new Error(
              "Google export was not authorized. Your scores are unchanged.",
            ),
          );
          return;
        }
        try {
          resolve(
            await createGoogleSpreadsheet(
              workbookSheets(s, at),
              at,
              response.access_token,
            ),
          );
        } catch (error) {
          reject(error);
        }
      },
    });
    client.requestAccessToken();
  });
}
