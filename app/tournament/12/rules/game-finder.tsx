"use client";

import { Fragment, useState } from "react";

import { cn } from "@/lib/utils";

import { playerName, teamNumber } from "../content";
import {
  backToBackPlayersFor,
  LEAGUE_FIXTURES,
  leagueFixturesFor,
  PLAYOFF_ROUNDS,
  POSITIONS,
  SLOT_MINUTES,
  TEAMS,
  TENTATIVE_LEAGUE_STARTS,
  type Pair,
  type Team,
} from "../schedule";
import { ExportMenu } from "./export-menu";
import { leagueSheet, playoffSheet } from "./schedule-export";

function ChoiceRow<T extends string | number>({
  label,
  options,
  value,
  onChange,
  optionLabel = String,
}: {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  optionLabel?: (option: T) => string | number;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="w-full shrink-0 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-court sm:w-16">
        {label}
      </span>
      <div className="flex flex-1 flex-wrap gap-1.5 sm:flex-none" role="radiogroup" aria-label={label}>
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
              {optionLabel(option)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

type Player = { team: Team; position: number };

function possessiveName(team: Team, position: number) {
  return `${playerName(team, position)}'s`;
}

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

const PLAYOFF_NOTES: Record<string, string> = {
  Semifinals: "Seed 1 v Seed 4 on Courts 1 & 2 · Seed 2 v Seed 3 on Courts 3 & 4",
  Final: "Winners on Courts 1 & 2 · 3rd place: losers on Courts 3 & 4",
};

// Each playoff slot as First court / Second court, with the chosen player's game highlighted.
function PlayoffTable({ team, position }: Player) {
  return (
    <div className="overflow-x-auto rounded-xl border border-outline/80 bg-white/60">
      <table className="w-full border-collapse text-left text-[0.85rem] sm:text-sm">
        <thead>
          <tr className={HEADER_ROW}>
            <th className="w-px py-2 pr-2 pl-3 sm:pr-4 sm:pl-4">Est. time</th>
            <th className="px-2 py-2 whitespace-nowrap">First court</th>
            <th className="py-2 pr-3 pl-2 whitespace-nowrap sm:pr-4">Second court</th>
          </tr>
        </thead>
        <tbody>
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
                                <span className="whitespace-nowrap">{`${playerName(team, pair[0])} + ${playerName(team, pair[1])}`}</span>{" "}
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

type Tab = (typeof STAGE_TABS)[number]["id"];

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
}: {
  team: Team;
  pair: Pair;
  backToBack: string[];
  highlighted?: boolean;
}) {
  return (
    <span className="whitespace-nowrap">
      {pair.map((position, idx) => {
        const player = playerName(team, position);
        const consecutive = backToBack.includes(`${team}${position}`);
        return (
          <Fragment key={player}>
            {idx > 0 && "+"}
            <span
              title={`Team ${teamNumber(team)}${consecutive ? " · back-to-back in the tentative schedule" : ""}`}
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
  const possessive = possessiveName(team, position);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <h3 id="league-list-heading" className="font-semibold text-ink">
          {myGamesOnly ? `${possessive} ${fixtures.length} league games` : `Highlighted games are ${possessive}`}
        </h3>
        <div className="flex items-center gap-4">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={myGamesOnly}
              onChange={(event) => onFilterChange(event.target.checked)}
              className="h-4 w-4 accent-berry"
            />
            {possessive} games only
          </label>
          <ExportMenu getSheet={() => leagueSheet(fixtures, myGamesOnly ? { team, position } : undefined)} />
        </div>
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
                  <td className="px-3 py-2">{playerName(game.lead[0] as Team, Number(game.lead[1]))}</td>
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

const PLAYERS = TEAMS.length * POSITIONS.length;
const GAMES_PER_PLAYER = (LEAGUE_FIXTURES.length * 4) / PLAYERS;
const GAMES_PER_TEAM = (LEAGUE_FIXTURES.length * 2) / TEAMS.length;
const HEAD_TO_HEAD = GAMES_PER_TEAM / (TEAMS.length - 1);

function Intro({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="list-disc space-y-1 rounded-2xl border border-outline/80 bg-court-soft/30 py-3 pr-4 pl-8 text-sm leading-6">
      {items.map((item, idx) => <li key={idx}>{item}</li>)}
    </ul>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <strong className="font-semibold text-ink">{children}</strong>;
}

const LEAGUE_INTRO = [
  <><Label>{LEAGUE_FIXTURES.length} league games:</Label> {GAMES_PER_PLAYER} per player, {GAMES_PER_TEAM} per team, {HEAD_TO_HEAD} against each other team.</>,
  <><Label>Open Courts:</Label> no fixed courts or times. When a court frees up, the lowest-numbered game whose four players are free takes it.</>,
  <><Label>Game duration:</Label> about {SLOT_MINUTES} min, so start times below are estimates, not call times.</>,
  <><Label>Lead:</Label> when your game is up, gather the other three players and take the empty court.</>,
  <><Label>Everyone leads twice:</Label> once in games 1–30 and once in 31–60.</>,
  <><Label>No referees:</Label> honor code; if the teams disagree on a call, replay the point.</>,
];

const PLAYOFF_INTRO = [
  <><Label>Top 4 teams</Label> from the league qualify.</>,
  <><Label>Semifinals:</Label> Seed 1 v 4 and Seed 2 v 3.</>,
  <><Label>Final and 3rd place:</Label> semifinal winners play the final; semifinal losers play for 3rd place at the same time.</>,
  <><Label>5 games per series:</Label> 2 per player. Play all 5, even if the series is decided.</>,
  <><Label>Fixed courts:</Label> playoffs use the courts shown below.</>,
  <><Label>Referees:</Label> neutral referees cover every playoff game.</>,
];

export function GameFinder() {
  const [team, setTeam] = useState<Team>("A");
  const [position, setPosition] = useState<number>(1);
  const [tab, setTab] = useState<Tab>("league");
  const [myGamesOnly, setMyGamesOnly] = useState(false);

  const league = tab === "league";

  return (
    <div className="grid gap-4">
      <FinderTabs id="game-finder" label="Stage" tabs={STAGE_TABS} value={tab} onChange={setTab} />

      <div role="tabpanel" id={`game-finder-panel-${tab}`} aria-labelledby={`game-finder-tab-${tab}`} className="grid min-w-0 gap-4">
        <Intro items={league ? LEAGUE_INTRO : PLAYOFF_INTRO} />
        <div className="grid gap-3 rounded-[24px] border border-outline/80 bg-white/70 p-4 sm:p-5">
          <ChoiceRow label="Team" options={TEAMS} value={team} onChange={setTeam} optionLabel={teamNumber} />
          <ChoiceRow label="Player" options={POSITIONS} value={position} onChange={setPosition} optionLabel={(option) => playerName(team, option)} />
        </div>
        <div className="grid min-w-0 gap-3">
          {league ? (
            <OpenLeagueTable team={team} position={position} myGamesOnly={myGamesOnly} onFilterChange={setMyGamesOnly} />
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                <p className="text-sm leading-6">Highlighted pairs are {possessiveName(team, position)} games if their team qualifies.</p>
                <ExportMenu getSheet={() => playoffSheet(team)} />
              </div>
              <PlayoffTable team={team} position={position} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
