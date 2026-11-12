import { scoreError, TEAMS, type Tournament } from "./domain";
const object = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object" && !Array.isArray(v);
const text = (v: unknown, max = 80): v is string =>
  typeof v === "string" && v.length <= max;
const team = (v: unknown) => TEAMS.includes(v as (typeof TEAMS)[number]);
const pair = (v: unknown) =>
  Array.isArray(v) &&
  v.length === 2 &&
  new Set(v).size === 2 &&
  v.every((p) => Number.isInteger(p) && p >= 1 && p <= 5);
const result = (v: unknown, tiebreak = false) =>
  object(v) &&
  typeof v.a === "number" &&
  typeof v.b === "number" &&
  !scoreError(v.a, v.b, tiebreak) &&
  text(v.editor) &&
  !!v.editor.trim() &&
  text(v.at, 40);
export function isTournament(v: unknown): v is Tournament {
  if (
    !object(v) ||
    v.version !== 1 ||
    !["league", "semis-setup", "semis", "finals-setup", "finals"].includes(
      String(v.stage),
    )
  )
    return false;
  if (
    !object(v.players) ||
    !object(v.lineups) ||
    !object(v.swaps) ||
    !object(v.results) ||
    !object(v.tiebreaks) ||
    !object(v.finalists)
  )
    return false;
  if (
    !Array.isArray(v.seeds) ||
    ![0, 4].includes(v.seeds.length) ||
    !v.seeds.every(team) ||
    new Set(v.seeds).size !== v.seeds.length
  )
    return false;
  for (const t of TEAMS) {
    const names = v.players[t];
    if (
      !Array.isArray(names) ||
      names.length !== 5 ||
      !names.every((n) => text(n))
    )
      return false;
  }
  for (const phase of ["semis", "finals"]) {
    const lineup = v.lineups[phase],
      swaps = v.swaps[phase];
    if (!object(lineup) || !Array.isArray(swaps)) return false;
    for (const t of TEAMS) {
      const slots = lineup[t];
      if (
        !Array.isArray(slots) ||
        slots.length !== 5 ||
        new Set(slots).size !== 5 ||
        !slots.every((p) => Number.isInteger(p) && p >= 1 && p <= 5)
      )
        return false;
    }
    if (
      !swaps.every(
        (x) =>
          object(x) &&
          team(x.team) &&
          pair([x.first, x.second]) &&
          text(x.editor) &&
          text(x.at, 40),
      )
    )
      return false;
  }
  for (const key of ["final", "third"]) {
    const teams = v.finalists[key];
    if (
      !Array.isArray(teams) ||
      ![0, 2].includes(teams.length) ||
      !teams.every(team) ||
      new Set(teams).size !== teams.length
    )
      return false;
  }
  if (
    !Object.entries(v.results).every(
      ([id, r]) =>
        /^(L([1-9]|[1-5][0-9]|60)|(SF[12]|F|P3)-[1-5])$/.test(id) && result(r),
    )
  )
    return false;
  if (
    !Object.entries(v.tiebreaks).every(
      ([id, r]) =>
        /^(SF[12]|F|P3)$/.test(id) &&
        result(r, true) &&
        object(r) &&
        pair(r.positions) &&
        team(r.winner),
    )
  )
    return false;
  return (
    Array.isArray(v.history) &&
    v.history.length <= 200 &&
    v.history.every(
      (h) => object(h) && text(h.note, 500) && text(h.editor) && text(h.at, 40),
    )
  );
}
