import { test } from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Games } from "./ui";
import { applyAction, initialTournament, type Tournament } from "./domain";
import { practiceScenario } from "./practice";

const render = (state: Tournament, resultsOnly = true, editor = false) =>
  renderToStaticMarkup(
    createElement(Games, {
      state,
      phase: state.stage.startsWith("semis") ? "semis" : "league",
      resultsOnly,
      editor,
      ready: editor,
      saving: false,
      draftScope: "results-test",
      save: async () => true,
    }),
  );
test("a saved score is visible to read-only visitors in Results and leaves the upcoming queue", () => {
  const state = applyAction(
    initialTournament(),
    { type: "score", id: "L1", a: 23, b: 22 },
    "Som",
    "2026-11-14T19:00:00Z",
  );
  const results = render(state);
  assert.match(results, /GAME 01/);
  assert.match(results, />23</);
  assert.match(results, />22</);
  assert.doesNotMatch(results, /GAME 02|Enter score|Edit score/);
  const upcoming = render(state, false);
  assert.doesNotMatch(upcoming, /GAME 01/);
  assert.match(upcoming, /GAME 02/);
  assert.match(upcoming, /Open Results/);
});
test("Results puts the newest save or correction first without changing standings data", () => {
  let state = applyAction(
    initialTournament(),
    { type: "score", id: "L1", a: 21, b: 14 },
    "Som",
    "2026-11-14T19:00:00Z",
  );
  state = applyAction(
    state,
    { type: "score", id: "L2", a: 23, b: 22 },
    "Som",
    "2026-11-14T19:01:00Z",
  );
  assert.ok(
    render(state).indexOf("GAME 02") < render(state).indexOf("GAME 01"),
  );
  state = applyAction(
    state,
    { type: "score", id: "L1", a: 21, b: 19 },
    "Som",
    "2026-11-14T19:02:00Z",
  );
  const before = structuredClone(state),
    html = render(state);
  assert.ok(html.indexOf("GAME 01") < html.indexOf("GAME 02"));
  assert.deepEqual(state, before);
  assert.match(html, />19</);
});
test("all-round Results retain league scores during playoffs while only the current round is editable", () => {
  let state = applyAction(
    practiceScenario("semis-setup"),
    { type: "publish-lineups" },
    "Som",
  );
  state = applyAction(
    state,
    { type: "score", id: "SF1-1", a: 21, b: 14 },
    "Som",
    "2027-01-01T00:00:00Z",
  );
  const html = render(state, true, true);
  assert.match(html, /All rounds/);
  assert.match(html, /GAME 60/);
  assert.match(html, /SF1 · GAME 1/);
  assert.equal((html.match(/Edit score/g) || []).length, 1);
  assert.match(html, /Show more results/);
});
test("Results has an explicit empty state before the first score", () => {
  const html = render(initialTournament());
  assert.match(html, /No results yet/);
  assert.match(html, /Saved scores will appear here for everyone/);
  assert.doesNotMatch(html, /GAME 01|Edit score|Enter score/);
});
