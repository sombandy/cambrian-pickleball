"use client";

import { Fragment, useState } from "react";

import { cn } from "@/lib/utils";

import {
  groupStageFor,
  playoffsFor,
  POSITIONS,
  SEEDS,
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
  value: T | null;
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

type Labels = {
  team: Team;
  position: number;
  them: (entry: Extract<PlayerSlot, { kind: "play" }>, position: number) => string;
};

function SlotRow({ entry, team, position, them }: { entry: PlayerSlot } & Labels) {
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
            {entry.opponentPair ? (
              <span className="text-ink">
                {them(entry, entry.opponentPair[0])} + {them(entry, entry.opponentPair[1])}
              </span>
            ) : (
              <span className="text-muted">TBD</span>
            )}
          </td>
        </>
      ) : (
        <td colSpan={2} className="py-2 pr-3 pl-2 sm:pr-4">
          {entry.kind === "rest" ? (
            <>
              <span className="font-semibold text-clay">Rest</span>
              <span className="hidden text-muted sm:inline">
                {" "}
                · your team is on Courts {entry.courts[0]}–{entry.courts[1]}
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

function SlotTable({ entries, ...labels }: { entries: PlayerSlot[] } & Labels) {
  return (
    <div className="overflow-x-auto rounded-xl border border-outline/80 bg-white/60">
      <table className="w-full border-collapse text-left text-[0.85rem] sm:text-sm">
        <thead>
          <tr className="bg-court-soft/55 text-[0.66rem] font-semibold uppercase tracking-[0.06em] text-court sm:tracking-[0.16em]">
            <th className="w-px py-2 pr-2 pl-3 sm:pr-4 sm:pl-4">Time</th>
            <th className="w-px px-1.5 py-2 text-center sm:px-3">Court</th>
            <th className="w-px px-2 py-2 whitespace-nowrap sm:px-4">Your pair</th>
            <th className="py-2 pr-3 pl-2 sm:pr-4">Opponents</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, idx) => {
            const { stage } = entry.slot;
            const startsStage = stage !== "Groups" && stage !== entries[idx - 1]?.slot.stage;
            return (
              <Fragment key={entry.slot.number}>
                {startsStage && entry.kind !== "idle" ? (
                  <tr className="border-t border-outline/60 bg-court-soft/30">
                    <td colSpan={4} className="px-3 py-1.5 text-[0.7rem] sm:px-4">
                      <span className="font-semibold uppercase tracking-[0.16em] text-court">{stage}</span>
                      <span className="text-muted"> · vs {entry.opponent}</span>
                    </td>
                  </tr>
                ) : null}
                <SlotRow entry={entry} {...labels} />
                {entry.slot.breakAfter && idx < entries.length - 1 ? (
                  <tr className="border-t border-dashed border-outline-strong">
                    <td colSpan={4} className="py-0.5 text-center text-[0.68rem] text-muted">
                      Break {entry.slot.breakAfter}
                    </td>
                  </tr>
                ) : null}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

const TABS = [
  { id: "groups", label: "Group stage" },
  { id: "playoffs", label: "Playoffs" },
] as const;

type Tab = (typeof TABS)[number]["id"];

export function GameFinder() {
  const [team, setTeam] = useState<Team>("A");
  const [position, setPosition] = useState<number>(1);
  const [tab, setTab] = useState<Tab>("groups");
  const [seed, setSeed] = useState<number | null>(null);

  const you = `${team}${position}`;
  const groupStage = groupStageFor(team, position);
  const groupGames = groupStage.filter((entry) => entry.kind === "play").length;
  const groupRests = groupStage.filter((entry) => entry.kind === "rest").length;

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
        {tab === "groups" ? (
          <>
            <p className="text-ink">
              <span className="font-display text-xl font-semibold">{you}</span>
              <span className="text-muted">
                {" "}
                plays <span className="font-semibold text-ink">{groupGames} group games</span> and rests in{" "}
                {groupRests} {groupRests === 1 ? "slot" : "slots"}.
              </span>
            </p>
            <SlotTable
              entries={groupStage}
              team={team}
              position={position}
              them={(entry, p) => `${entry.opponentLabel}${p}`}
            />
          </>
        ) : (
          <>
            <ChoiceRow label="Seed" options={SEEDS} value={seed} onChange={setSeed} />
            <p className="text-sm leading-6">
              Seeds are set after the group stage.{" "}
              {seed === null ? (
                <>Pick a seed to see the games {you} would play if Team {team} finishes there and keeps winning.</>
              ) : (
                <>
                  Showing {you}&apos;s games if Team {team} finishes as{" "}
                  <span className="font-semibold text-ink">Seed {seed}</span> and keeps winning. Opponents are
                  shown by player number.
                </>
              )}
            </p>
            {seed !== null ? (
              <SlotTable entries={playoffsFor(seed, position)} team={team} position={position} them={(_, p) => `P${p}`} />
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
