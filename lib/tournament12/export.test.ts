import { test } from "node:test";
import assert from "node:assert/strict";
import ExcelJS from "exceljs";
import { HyperFormula } from "hyperformula";
import { workbookSheets } from "./export";
import { applyAction, initialTournament } from "./domain";

test("workbook includes 60 editable fixtures, formula standings, phase rosters, and Unicode names", async () => {
  let s = initialTournament();
  s = applyAction(
    s,
    {
      type: "names",
      team: "D",
      names: ["山田", "Alex & Bo", 'A "quote"', "Name, comma", "=1+2"],
    },
    "Test",
  );
  s = applyAction(s, { type: "score", id: "L1", a: 21, b: 14 }, "Test");
  const sheets = workbookSheets(s, "2026-11-14T19:00:00Z");
  assert.equal(sheets.length, 11);
  assert.equal(sheets.find((s) => s.name === "Scores")!.rows.length, 61);
  const scores = sheets.find((s) => s.name === "Scores")!.rows;
  assert.deepEqual(scores[1].slice(7, 9), [21, 14]);
  assert.deepEqual(scores[2].slice(7, 9), ["", ""]);
  assert.equal((scores[1][9] as { result: number }).result, 3);
  assert.match((scores[1][9] as { formula: string }).formula, /H2=21/);
  const book = new ExcelJS.Workbook();
  book.calcProperties.fullCalcOnLoad = true;
  for (const sheet of sheets) {
    const tab = book.addWorksheet(sheet.name);
    for (const row of sheet.rows) tab.addRow(row);
  }
  const bytes = await book.xlsx.writeBuffer();
  const loaded = new ExcelJS.Workbook();
  await loaded.xlsx.load(bytes);
  assert.equal(loaded.worksheets.length, 11);
  assert.equal(loaded.getWorksheet("Scores")!.getCell("H2").value, 21);
  const directory = loaded.getWorksheet("Team directory")!;
  assert.equal(directory.rowCount, 31);
  assert.equal(directory.getCell("A2").value, "Diwali Dinkers");
  assert.equal(directory.getCell("E2").value, "A");
  assert.equal(directory.getCell("F2").value, 1);
  assert.equal(directory.getCell("C2").value, "Sharan Jayadevaiah");
  assert.equal(directory.getCell("C4").value, "Naresh Ramaiya");
  assert.equal(directory.getCell("C5").value, "Kaushik Ram");
  assert.equal(directory.getCell("D5").value, "Captain");
  assert.equal(
    loaded.getWorksheet("Scores")!.getCell("O2").value,
    "Patakha Paddles",
  );
  assert.equal(
    loaded.getWorksheet("League roster")!.getCell("C17").value,
    "山田",
  );
  assert.equal(
    typeof loaded.getWorksheet("Standings")!.getCell("F2").value,
    "object",
  );
  assert.deepEqual(loaded.getWorksheet("Scores")!.getCell("J2").value, {
    formula: (scores[1][9] as { formula: string }).formula,
    result: 3,
  });
});
test("export is a copy and cannot mutate the tournament state", () => {
  const s = initialTournament();
  const before = JSON.stringify(s);
  workbookSheets(s, new Date().toISOString());
  assert.equal(JSON.stringify(s), before);
});
test("backup formulas independently recalculate bonus, winner, and PD after manual score edits", () => {
  const s = applyAction(
    initialTournament(),
    { type: "score", id: "L1", a: 21, b: 14 },
    "Test",
  );
  const sheets = workbookSheets(s, new Date().toISOString());
  const values = Object.fromEntries(
    sheets.map((s) => [
      s.name,
      s.rows.map((row) =>
        row.map((v) =>
          typeof v === "object"
            ? "=" + v.formula
            : typeof v === "string" && v.startsWith("=")
              ? "'" + v
              : v,
        ),
      ),
    ]),
  );
  const engine = HyperFormula.buildFromSheets(values, { licenseKey: "gpl-v3" });
  try {
    const scoreId = engine.getSheetId("Scores")!,
      standingsId = engine.getSheetId("Standings")!;
    const dRow = sheets
      .find((s) => s.name === "Standings")!
      .rows.findIndex((r) => r[0] === "D");
    const eRow = sheets
      .find((s) => s.name === "Standings")!
      .rows.findIndex((r) => r[0] === "E");
    const cell = (row: number, col: number) =>
      engine.getCellValue({ sheet: standingsId, row, col });
    assert.equal(cell(dRow, 5), 3);
    assert.equal(cell(dRow, 6), 7);
    assert.equal(cell(dRow, 1), 1);
    engine.setCellContents({ sheet: scoreId, col: 8, row: 1 }, [[15]]);
    assert.equal(cell(dRow, 5), 2);
    assert.equal(cell(dRow, 4), 0);
    assert.equal(cell(dRow, 6), 6);
    engine.setCellContents({ sheet: scoreId, col: 7, row: 1 }, [[19]]);
    engine.setCellContents({ sheet: scoreId, col: 8, row: 1 }, [[21]]);
    assert.equal(cell(dRow, 5), 0);
    assert.equal(cell(dRow, 6), -2);
    assert.equal(cell(eRow, 5), 2);
    assert.equal(cell(eRow, 6), 2);
    engine.setCellContents({ sheet: scoreId, col: 7, row: 1 }, [[""]]);
    engine.setCellContents({ sheet: scoreId, col: 8, row: 1 }, [[""]]);
    assert.equal(cell(dRow, 1), 0);
    assert.equal(cell(dRow, 5), 0);
    assert.equal(cell(eRow, 1), 0);
  } finally {
    engine.destroy();
  }
});
