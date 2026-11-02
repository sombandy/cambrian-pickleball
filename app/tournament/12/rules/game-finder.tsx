"use client";

import { Fragment, useState } from "react";

import { cn } from "@/lib/utils";

import {
  leagueFor,
  PLAYOFF_ROUNDS,
  POSITIONS,
  TEAMS,
  type PlayerSlot,
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

function BreakRow({ time, colSpan }: { time: string; colSpan: number }) {
  return (
    <tr className="border-t border-dashed border-outline-strong">
      <td colSpan={colSpan} className="py-0.5 text-center text-[0.68rem] text-muted">
        Break {time}
      </td>
    </tr>
  );
}

function SlotRow({ entry, team, position }: { entry: PlayerSlot } & Player) {
  const { slot } = entry;

  return (
    <tr
      className={cn(
        "border-t border-outline/60",
        entry.kind === "play" && "bg-white",
        entry.kind === "idle" && "text-muted/70",
      )}
    >
      <td className="py-2 pr-2 pl-3 whitespace-nowrap tabular-nums sm:pr-4 sm:pl-4">
        <span className={entry.kind === "play" ? "font-semibold text-ink" : undefined}>{slot.time}</span>
      </td>
      <td className="px-1.5 py-2 text-center sm:px-3">
        {entry.kind === "play" ? (
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-court text-xs font-semibold text-white">
            {entry.court}
          </span>
        ) : (
          <span className="text-muted/60">–</span>
        )}
      </td>
      {entry.kind === "play" ? (
        <>
          <td className="px-2 py-2 whitespace-nowrap text-ink sm:px-4">
            <span className="font-semibold">{`${team}${position}`}</span> + {`${team}${entry.partner}`}
          </td>
          <td className="py-2 pr-3 pl-2 whitespace-nowrap sm:pr-4">
            <span className="text-muted">vs </span>
            <span className="text-ink">{`${entry.opponent}${position} + ${entry.opponent}${entry.partner}`}</span>
          </td>
        </>
      ) : (
        <td colSpan={2} className="py-2 pr-3 pl-2 sm:pr-4">
          {entry.kind === "rest" ? (
            <>
              <span className="font-semibold text-clay">Rest</span>
              <span className="hidden text-muted sm:inline">
                {" "}
                · your team is on {entry.courts.length === 1 ? "Court" : "Courts"} {entry.courts.join(" & ")}
              </span>
            </>
          ) : (
            <>
              Off<span className="hidden sm:inline"> · your team isn&apos;t playing</span>
            </>
          )}
        </td>
      )}
    </tr>
  );
}

function LeagueTable({ entries, ...player }: { entries: PlayerSlot[] } & Player) {
  return (
    <div className="overflow-x-auto rounded-xl border border-outline/80 bg-white/60">
      <table className="w-full border-collapse text-left text-[0.85rem] sm:text-sm">
        <thead>
          <tr className={HEADER_ROW}>
            <th className="w-px py-2 pr-2 pl-3 sm:pr-4 sm:pl-4">Time</th>
            <th className="w-px px-1.5 py-2 text-center sm:px-3">Court</th>
            <th className="w-px px-2 py-2 whitespace-nowrap sm:px-4">Your pair</th>
            <th className="py-2 pr-3 pl-2 sm:pr-4">Opponents</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, idx) => (
            <Fragment key={entry.slot.number}>
              <SlotRow entry={entry} {...player} />
              {entry.slot.breakAfter && idx < entries.length - 1 ? (
                <BreakRow time={entry.slot.breakAfter} colSpan={4} />
              ) : null}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const PLAYOFF_NOTES: Record<string, string> = {
  Semifinals: "Seed 1 v Seed 4 on Courts 1 & 2 · Seed 2 v Seed 3 on Courts 3 & 4",
  Final: "Semifinal winners on Courts 1 & 2",
};

// Each playoff slot as First court / Second court, with the chosen player's game highlighted.
function PlayoffTable({ team, position }: Player) {
  const you = `${team}${position}`;
  return (
    <div className="overflow-x-auto rounded-xl border border-outline/80 bg-white/60">
      <table className="w-full border-collapse text-left text-[0.85rem] sm:text-sm">
        <thead>
          <tr className={HEADER_ROW}>
            <th className="w-px py-2 pr-2 pl-3 sm:pr-4 sm:pl-4">Time</th>
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
                const playing = pairs.some((pair) => pair.includes(position));
                return (
                  <Fragment key={slot.number}>
                    <tr className={cn("border-t border-outline/60", playing && "bg-white")}>
                      <td className="py-2 pr-2 pl-3 align-top whitespace-nowrap tabular-nums sm:pr-4 sm:pl-4">
                        <span className={playing ? "font-semibold text-ink" : "text-muted"}>{slot.time}</span>
                        {playing ? null : <span className="block text-xs font-semibold text-clay">{you} rests</span>}
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
                                  mine ? "bg-court font-semibold text-white" : "text-ink",
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

const TABS = [
  { id: "league", label: "League" },
  { id: "playoffs", label: "Playoffs" },
] as const;

type Tab = (typeof TABS)[number]["id"];

export function GameFinder() {
  const [team, setTeam] = useState<Team>("A");
  const [position, setPosition] = useState<number>(1);
  const [tab, setTab] = useState<Tab>("league");

  const you = `${team}${position}`;
  const league = leagueFor(team, position);
  const games = league.filter((entry) => entry.kind === "play");
  const rests = league.length - games.length;
  const opponents = TEAMS.filter((other) => other !== team).map((other) => ({
    team: other,
    count: games.filter((entry) => entry.opponent === other).length,
  }));

  return (
    <div className="grid gap-4">
      <div className="grid gap-3 rounded-[24px] border border-outline/80 bg-white/70 p-4 sm:p-5">
        <ChoiceRow label="Team" options={TEAMS} value={team} onChange={setTeam} />
        <ChoiceRow label="Player" options={POSITIONS} value={position} onChange={setPosition} />
      </div>

      <div role="tablist" aria-label="Stage" className="inline-flex w-full rounded-[18px] border border-outline/80 bg-white/70 p-1 sm:w-auto sm:justify-self-start">
        {TABS.map(({ id, label }) => {
          const selected = id === tab;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              id={`game-finder-tab-${id}`}
              aria-selected={selected}
              aria-controls={`game-finder-panel-${id}`}
              onClick={() => setTab(id)}
              className={cn(
                "flex-1 rounded-[14px] px-4 py-1.5 text-sm font-semibold whitespace-nowrap transition sm:flex-none",
                selected ? "primary-button" : "text-muted hover:text-ink",
              )}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div role="tabpanel" id={`game-finder-panel-${tab}`} aria-labelledby={`game-finder-tab-${tab}`} className="grid gap-3">
        {tab === "league" ? (
          <>
            <div className="grid gap-1">
              <p className="text-ink">
                <span className="font-display text-xl font-semibold">{you}</span>
                <span className="text-muted">
                  {" "}
                  plays <span className="font-semibold text-ink">{games.length} league games</span> and rests in{" "}
                  {rests} {rests === 1 ? "slot" : "slots"}.
                </span>
              </p>
              <p className="text-sm text-muted">
                Games against each team:{" "}
                {opponents.map(({ team: other, count }, idx) => (
                  <Fragment key={other}>
                    {idx > 0 ? " · " : null}
                    <span className="whitespace-nowrap">
                      <span className="font-semibold text-ink">{other}</span> ×{count}
                    </span>
                  </Fragment>
                ))}
              </p>
            </div>
            <LeagueTable entries={league} team={team} position={position} />
          </>
        ) : (
          <>
            <p className="text-sm leading-6">
              {you}&apos;s games are highlighted. P1–P5 are the players on the other team.
            </p>
            <PlayoffTable team={team} position={position} />
          </>
        )}
      </div>
    </div>
  );
}
