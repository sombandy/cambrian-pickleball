"use client";

import { Fragment, useState } from "react";

import { cn } from "@/lib/utils";

import {
  backToBackPlayersFor,
  gamesIn,
  LEAGUE_FIXTURES,
  LEAGUE_SLOTS,
  leagueFor,
  leagueFixturesFor,
  PLAYOFF_ROUNDS,
  POSITIONS,
  TEAMS,
  TENTATIVE_LEAGUE_STARTS,
  type Pair,
  type Team,
} from "../schedule";

function ChoiceRow<T extends string | number>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="w-full shrink-0 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-court sm:w-16">
        {label}
      </span>
      <div className="flex flex-1 gap-1.5 sm:flex-none" role="radiogroup" aria-label={label}>
        {options.map((option) => {
          const selected = option === value;
          return (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(option)}
              className={cn(
                "flex-1 rounded-xl px-2 py-1.5 text-sm font-semibold transition sm:min-w-11 sm:flex-none sm:px-3",
                selected ? "primary-button" : "soft-button text-muted hover:text-ink",
              )}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

type Player = { team: Team; position: number };

const HEADER_ROW = "bg-court-soft/55 text-[0.66rem] font-semibold uppercase tracking-[0.06em] text-court sm:tracking-[0.16em]";
const SELECTED_GAME = "bg-court font-semibold text-white";

function BreakRow({ time, colSpan }: { time: string; colSpan: number }) {
  return (
    <tr className="border-t border-dashed border-outline-strong">
      <td colSpan={colSpan} className="py-0.5 text-center text-[0.68rem] text-muted">
        Break {time}
      </td>
    </tr>
  );
}

const COURTS = [1, 2, 3, 4] as const;

function LeagueTable({ team, position }: Player) {
  return (
    <>
      <h3 id="assigned-league-heading" className="font-semibold text-ink">Highlighted games are yours</h3>
      <div
        role="region"
        aria-labelledby="assigned-league-heading"
        tabIndex={0}
        className="relative max-h-[28rem] overflow-auto rounded-xl border border-outline/80 bg-white/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-berry"
      >
        <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
          <caption className="sr-only">Assigned Courts league games by time and court</caption>
          <thead className="sticky top-0 z-20 bg-court-soft">
            <tr className={HEADER_ROW}>
              <th scope="col" className="sticky left-0 z-10 bg-court-soft px-3 py-2 whitespace-nowrap">Time</th>
              {COURTS.map((court) => (
                <th key={court} scope="col" className="px-3 py-2 whitespace-nowrap">Court {court}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {LEAGUE_SLOTS.map((slot, idx) => {
              const games = gamesIn(slot);
              const previousSlot = LEAGUE_SLOTS[idx - 1];
              const previousPlayers = previousSlot && !previousSlot.breakAfter
                ? gamesIn(previousSlot).flatMap((game) =>
                  [game.home, game.away].flatMap((side) => game.pair.map((player) => `${side}${player}`)),
                )
                : [];

              return (
                <Fragment key={slot.number}>
                  <tr className="border-t border-outline/60 text-ink">
                    <th scope="row" className="sticky left-0 z-10 bg-white px-3 py-2 font-normal whitespace-nowrap tabular-nums">
                      {slot.time}
                    </th>
                    {COURTS.map((court) => {
                      const game = games.find((game) => game.court === court);
                      const mine = game && (game.home === team || game.away === team) && game.pair.includes(position);
                      return (
                        <td key={court} className={cn("px-3 py-2", mine ? SELECTED_GAME : "bg-white")}>
                          {game ? (
                            <>
                              {mine && <span className="sr-only">Your game: </span>}
                              <LeaguePair
                                team={game.home}
                                pair={game.pair}
                                backToBack={previousPlayers}
                                highlighted={mine}
                                backToBackNote="back-to-back with the previous slot (no scheduled break)"
                              />
                              <span className="block whitespace-nowrap">
                                <span className={cn("font-normal", mine ? "text-white/80" : "text-muted")}>vs </span>
                                <LeaguePair
                                  team={game.away}
                                  pair={game.pair}
                                  backToBack={previousPlayers}
                                  highlighted={mine}
                                  backToBackNote="back-to-back with the previous slot (no scheduled break)"
                                />
                              </span>
                            </>
                          ) : <span className="text-muted/60">–</span>}
                        </td>
                      );
                    })}
                  </tr>
                  {slot.breakAfter && idx < LEAGUE_SLOTS.length - 1 ? (
                    <BreakRow time={slot.breakAfter} colSpan={COURTS.length + 1} />
                  ) : null}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted">* Played in the previous slot without a scheduled break.</p>
    </>
  );
}

const PLAYOFF_NOTES: Record<string, string> = {
  Semifinals: "Seed 1 v Seed 4 on Courts 1 & 2 · Seed 2 v Seed 3 on Courts 3 & 4",
  Final: "Semifinal winners on Courts 1 & 2",
};

// Each playoff slot as First court / Second court, with the chosen player's game highlighted.
function PlayoffTable({ team, position, openCourts }: Player & { openCourts: boolean }) {
  const breakBefore = LEAGUE_SLOTS[LEAGUE_SLOTS.length - 1].breakAfter;

  return (
    <div className="overflow-x-auto rounded-xl border border-outline/80 bg-white/60">
      <table className="w-full border-collapse text-left text-[0.85rem] sm:text-sm">
        <thead>
          <tr className={HEADER_ROW}>
            <th className="w-px py-2 pr-2 pl-3 sm:pr-4 sm:pl-4">{openCourts ? "Est. time" : "Time"}</th>
            <th className="px-2 py-2 whitespace-nowrap">First court</th>
            <th className="py-2 pr-3 pl-2 whitespace-nowrap sm:pr-4">Second court</th>
          </tr>
        </thead>
        <tbody>
          {!openCourts && breakBefore ? <BreakRow time={breakBefore} colSpan={3} /> : null}
          {PLAYOFF_ROUNDS.map(({ stage, slots }) => (
            <Fragment key={stage}>
              <tr className="border-t border-outline/60 bg-court-soft/30">
                <td colSpan={3} className="px-3 py-1.5 text-[0.7rem] sm:px-4">
                  <span className="font-semibold uppercase tracking-[0.16em] text-court">{stage}</span>
                  <span className="text-muted"> · {PLAYOFF_NOTES[stage]}</span>
                </td>
              </tr>
              {slots.map(({ slot, pairs }) => {
                return (
                  <Fragment key={slot.number}>
                    <tr className="border-t border-outline/60">
                      <td className="py-2 pr-2 pl-3 align-top whitespace-nowrap tabular-nums sm:pr-4 sm:pl-4">
                        {slot.time}
                      </td>
                      {[0, 1].map((idx) => {
                        const pair = pairs[idx];
                        const mine = pair?.includes(position);
                        return (
                          <td key={idx} className={cn("py-1.5", idx === 0 ? "px-2" : "pr-3 pl-2 sm:pr-4")}>
                            {pair ? (
                              <span
                                className={cn(
                                  "inline-block rounded-lg px-2 py-0.5",
                                  mine ? SELECTED_GAME : "text-ink",
                                )}
                              >
                                <span className="whitespace-nowrap">{`${team}${pair[0]} + ${team}${pair[1]}`}</span>{" "}
                                <span className={cn("whitespace-nowrap", !mine && "text-muted")}>
                                  vs P{pair[0]} + P{pair[1]}
                                </span>
                              </span>
                            ) : (
                              <span className="px-2 text-muted/60">–</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                    {slot.breakAfter ? <BreakRow time={slot.breakAfter} colSpan={3} /> : null}
                  </Fragment>
                );
              })}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const STAGE_TABS = [
  { id: "league", label: "League" },
  { id: "playoffs", label: "Playoffs" },
] as const;

const FORMAT_TABS = [
  { id: "assigned", label: "Assigned Courts" },
  { id: "open", label: "Open Courts" },
] as const;

type Tab = (typeof STAGE_TABS)[number]["id"];
type Format = (typeof FORMAT_TABS)[number]["id"];

function FinderTabs<T extends string>({
  id,
  label,
  tabs,
  value,
  onChange,
}: {
  id: string;
  label: string;
  tabs: readonly { id: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div role="tablist" aria-label={label} className="inline-flex w-full rounded-[18px] border border-outline/80 bg-white/70 p-1 sm:w-auto sm:justify-self-start">
      {tabs.map((tab, idx) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          id={`${id}-tab-${tab.id}`}
          aria-selected={value === tab.id}
          aria-controls={`${id}-panel-${tab.id}`}
          tabIndex={value === tab.id ? 0 : -1}
          onClick={() => onChange(tab.id)}
          onKeyDown={(event) => {
            const next = event.key === "ArrowRight" ? (idx + 1) % tabs.length
              : event.key === "ArrowLeft" ? (idx + tabs.length - 1) % tabs.length
                : event.key === "Home" ? 0
                  : event.key === "End" ? tabs.length - 1 : null;
            if (next === null) return;
            event.preventDefault();
            onChange(tabs[next].id);
            document.getElementById(`${id}-tab-${tabs[next].id}`)?.focus();
          }}
          className={cn(
            "flex-1 rounded-[14px] px-3 py-2 text-sm font-semibold whitespace-nowrap transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-berry sm:flex-none sm:px-4",
            value === tab.id ? "primary-button" : "text-muted hover:text-ink",
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

function LeaguePair({
  team,
  pair,
  backToBack,
  highlighted = false,
  backToBackNote = "back-to-back in the tentative schedule",
}: {
  team: string;
  pair: Pair;
  backToBack: string[];
  highlighted?: boolean;
  backToBackNote?: string;
}) {
  return (
    <span className="whitespace-nowrap">
      {pair.map((position, idx) => {
        const player = `${team}${position}`;
        const consecutive = backToBack.includes(player);
        return (
          <Fragment key={player}>
            {idx > 0 && "+"}
            <span
              title={consecutive ? `${player}: ${backToBackNote}` : undefined}
            >
              {player}
              {consecutive && (
                <>
                  <sup aria-hidden="true" className={cn("ml-px", highlighted ? "text-white" : "text-berry")}>*</sup>
                  <span className="sr-only"> (back-to-back)</span>
                </>
              )}
            </span>
          </Fragment>
        );
      })}
    </span>
  );
}

function OpenLeagueTable({
  team,
  position,
  myGamesOnly,
  onFilterChange,
}: Player & { myGamesOnly: boolean; onFilterChange: (value: boolean) => void }) {
  const myFixtures = leagueFixturesFor(team, position);
  const fixtures = myGamesOnly ? myFixtures : LEAGUE_FIXTURES;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <h3 id="league-list-heading" className="font-semibold text-ink">
          {myGamesOnly ? `My ${fixtures.length} league games` : "Highlighted games are yours"}
        </h3>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            checked={myGamesOnly}
            onChange={(event) => onFilterChange(event.target.checked)}
            className="h-4 w-4 accent-berry"
          />
          My games only
        </label>
      </div>
      <div
        key={`${team}${position}-${myGamesOnly}`}
        role="region"
        aria-labelledby="league-list-heading"
        tabIndex={0}
        className="max-h-[28rem] overflow-auto rounded-xl border border-outline/80 bg-white/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-berry"
      >
        <table className="w-full border-collapse text-left text-sm">
          <caption className="sr-only">Open Courts league games in priority order</caption>
          <thead className="sticky top-0 z-10 bg-court-soft">
            <tr className={HEADER_ROW}>
              <th scope="col" className="px-3 py-2">Game</th>
              <th scope="col" className="px-2 py-2">Matchup</th>
              <th scope="col" className="px-2 py-2">Tentative start</th>
              <th scope="col" className="px-3 py-2">Lead</th>
            </tr>
          </thead>
          <tbody>
            {fixtures.map((game, idx) => {
              const planned = TENTATIVE_LEAGUE_STARTS[game.priority - 1];
              const mine = myFixtures.some((fixture) => fixture.id === game.id);
              const backToBack = backToBackPlayersFor(game);
              const newBatch = idx > 0 && planned.batch !== TENTATIVE_LEAGUE_STARTS[fixtures[idx - 1].priority - 1].batch;
              return (
                <tr
                  key={game.id}
                  className={cn(
                    mine ? SELECTED_GAME : "bg-white text-ink",
                    newBatch ? "border-t-2 border-outline-strong" : "border-t border-outline/60",
                  )}
                >
                  <th scope="row" className="px-3 py-2">{game.priority}</th>
                  <td className="px-2 py-2">
                    <LeaguePair team={game.home} pair={game.pair} backToBack={backToBack} highlighted={mine} />{" "}
                    <span className="inline-block whitespace-nowrap">
                      <span className={cn("font-normal", mine ? "text-white/80" : "text-muted")}>vs </span>
                      <LeaguePair team={game.away} pair={game.pair} backToBack={backToBack} highlighted={mine} />
                    </span>
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap tabular-nums">{planned.label}</td>
                  <td className="px-3 py-2">{game.lead}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted">* Back-to-back player in the tentative schedule.</p>
    </>
  );
}

export function GameFinder() {
  const [team, setTeam] = useState<Team>("A");
  const [position, setPosition] = useState<number>(1);
  const [tab, setTab] = useState<Tab>("league");
  const [format, setFormat] = useState<Format>("assigned");
  const [myGamesOnly, setMyGamesOnly] = useState(false);
  const openCourts = format === "open";

  const league = leagueFor(team, position);
  const gamesPerPlayer = league.filter((entry) => entry.kind === "play").length;
  const gamesPerTeam = LEAGUE_FIXTURES.filter((game) => game.home === team || game.away === team).length;
  const headToHeadGames = gamesPerTeam / (TEAMS.length - 1);

  return (
    <div className="grid gap-4">
      <FinderTabs id="game-format" label="Court format" tabs={FORMAT_TABS} value={format} onChange={setFormat} />
      <div role="tabpanel" id={`game-format-panel-${format}`} aria-labelledby={`game-format-tab-${format}`} className="grid min-w-0 gap-4">
        <div className="rounded-2xl border border-outline/80 bg-court-soft/30 px-4 py-3 text-sm leading-6">
          {openCourts ? (
            <>
              <p><strong className="text-ink">Priority:</strong> lower ready game numbers go first.</p>
              <p><strong className="text-ink">Lead:</strong> gather all four rested players and take an empty court.</p>
            </>
          ) : (
            <p>Follow your assigned court on the organizer&apos;s slot call. Ten-minute breaks between blocks of three slots.</p>
          )}
        </div>
        <div className="grid gap-3 rounded-[24px] border border-outline/80 bg-white/70 p-4 sm:p-5">
          <ChoiceRow label="Team" options={TEAMS} value={team} onChange={setTeam} />
          <ChoiceRow label="Player" options={POSITIONS} value={position} onChange={setPosition} />
        </div>

        <FinderTabs id="game-finder" label="Stage" tabs={STAGE_TABS} value={tab} onChange={setTab} />

        <div role="tabpanel" id={`game-finder-panel-${tab}`} aria-labelledby={`game-finder-tab-${tab}`} className="grid min-w-0 gap-3">
          {tab === "league" ? (
            <>
              <p className="text-sm leading-6 text-ink">
                {gamesPerPlayer} games per player · {gamesPerTeam} games per team ·{" "}
                {headToHeadGames} head-to-head games against each other team
              </p>
              {openCourts ? (
                <OpenLeagueTable team={team} position={position} myGamesOnly={myGamesOnly} onFilterChange={setMyGamesOnly} />
              ) : (
                <LeagueTable team={team} position={position} />
              )}
            </>
          ) : (
            <>
              <p className="text-sm text-ink">
                Each playoff round: 2 games per player · Play all 5 games, even if the series is decided.
              </p>
              {openCourts && (
                <p className="text-sm leading-6">Playoffs use fixed courts.</p>
              )}
              <PlayoffTable team={team} position={position} openCourts={openCourts} />
              {openCourts && (
                <p className="text-sm leading-6">
                  Highlighted pairs are your games if your team qualifies. For each game, agree a lead among
                  its four players to gather the group and record the result.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
