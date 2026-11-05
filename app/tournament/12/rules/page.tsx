import type { Metadata } from "next";

import { TournamentSectionCard } from "@/components/tournament-section-card";
import { cn } from "@/lib/utils";

import {
  FINISH_TIME,
  GAMES,
  gamesIn,
  LEAGUE_SLOTS,
  leagueFor,
  pairLabel,
  PLAYOFF_ROUNDS,
  PLAYOFF_SLOTS,
  SLOTS,
  SLOT_MINUTES,
  type Pair,
  type Slot,
  type Stage,
} from "../schedule";
import { GameFinder } from "./game-finder";

export const metadata: Metadata = {
  title: "Rules",
  description:
    "Format, court-by-court schedule, game rules, points system and check-in details for the 12th Cambrian Pickleball Tournament.",
};

const ON_THIS_PAGE = [
  { href: "#my-games", label: "Find your games" },
  { href: "#format", label: "Format" },
  { href: "#game-rules", label: "Game rules & points" },
  { href: "#league", label: "League matchups" },
  { href: "#venue", label: "Venue & check-in" },
];

function stageSlots(stage: Stage) {
  return SLOTS.filter((slot) => slot.stage === stage);
}

function stageGames(stage: Stage) {
  return stageSlots(stage).flatMap((slot) => gamesIn(slot)).length;
}

const LEAGUE_GAMES = stageGames("League");
const LEAGUE_GAMES_PER_PLAYER = leagueFor("A", 1).filter((entry) => entry.kind === "play").length;
// Five-game playoff series: each player plays two games per round.
const PLAYOFF_GAMES_PER_PLAYER = 2;

const SUMMARY = [
  { label: "Teams", value: "6", detail: "5 players each" },
  { label: "Courts", value: "4", detail: "11 AM – 7 PM" },
  { label: "Slot", value: `${SLOT_MINUTES} min`, detail: "game + changeover" },
  {
    label: "Games",
    value: `${GAMES.length}`,
    detail: `${LEAGUE_GAMES} league + ${GAMES.length - LEAGUE_GAMES} playoffs`,
  },
];

const FIRST_SEMIFINAL_SLOT = stageSlots("Semifinals")[0].number;
const FIRST_FINAL_SLOT = stageSlots("Final")[0].number;

function Strong({ children }: { children: React.ReactNode }) {
  return <strong className="font-semibold text-ink">{children}</strong>;
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return <h3 className="pt-2 font-display text-lg font-semibold tracking-tight text-ink">{children}</h3>;
}

function BulletList({ ordered, children }: { ordered?: boolean; children: React.ReactNode }) {
  const List = ordered ? "ol" : "ul";
  return <List className={cn("space-y-1.5 pl-5", ordered ? "list-decimal" : "list-disc")}>{children}</List>;
}

function ToConfirm({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-clay/50 bg-sun px-5 py-3.5 text-[0.95rem] leading-7 text-ink">
      <span className="mr-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-clay">To confirm</span>
      {children}
    </div>
  );
}

type Row = { key: string; cells: React.ReactNode[]; muted?: boolean };

function Table({ head, rows }: { head: React.ReactNode[]; rows: Row[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-outline/80 bg-white/70">
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="bg-court-soft/55 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-court">
            {head.map((cell, idx) => (
              <th key={idx} className="px-3 py-2.5 whitespace-nowrap sm:px-4">
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key} className={cn("border-t border-outline/60", row.muted ? "text-muted italic" : "text-ink")}>
              {row.cells.map((cell, idx) => (
                <td key={idx} className="px-3 py-2 whitespace-nowrap sm:px-4">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// One cell per court, in court order; both sides use the same numbered pair.
function courtCells(slot: Slot) {
  const games = gamesIn(slot);
  return [1, 2, 3, 4].map((court) => {
    const game = games.find((g) => g.court === court);
    return game ? `${pairLabel(game.home, game.pair)} v ${pairLabel(game.away, game.pair)}` : "Free";
  });
}

// A slot's row, followed by a full-width "Break" row if a break comes after it.
function withBreak(slot: Slot, row: Row): Row[] {
  if (!slot.breakAfter) return [row];
  const cells: React.ReactNode[] = ["", slot.breakAfter, "Break"];
  const padding = Array(row.cells.length - cells.length).fill("");
  return [row, { key: `${slot.number}-break`, muted: true, cells: [...cells, ...padding] }];
}

const PLAYOFF_ROWS = PLAYOFF_SLOTS.flatMap((slot) =>
  withBreak(slot, { key: `${slot.number}`, cells: [slot.number, slot.time, slot.stage, ...courtCells(slot)] }),
);

const pairText = (pair: Pair) => pair.join("+");

// Matchups that use the same four partnerships, e.g. "A–F, B–E, C–D" → 1+2, 1+3, 2+5, 3+4.
const MATCHUP_ROWS: Row[] = (() => {
  const pairsByMatchup = new Map<string, string[]>();
  for (const game of LEAGUE_SLOTS.flatMap((slot) => gamesIn(slot))) {
    const matchup = [game.home, game.away].sort().join("–");
    pairsByMatchup.set(matchup, [...(pairsByMatchup.get(matchup) ?? []), pairText(game.pair)]);
  }
  const matchupsByPairs = new Map<string, string[]>();
  for (const [matchup, pairs] of pairsByMatchup) {
    const key = pairs.sort().join(", ");
    matchupsByPairs.set(key, [...(matchupsByPairs.get(key) ?? []), matchup]);
  }
  return [...matchupsByPairs]
    .map(([pairs, matchups]) => ({ key: pairs, cells: [matchups.sort().join(", "), pairs] }))
    .sort((a, b) => String(a.cells[0]).localeCompare(String(b.cells[0])));
})();

const PLAYOFF_PAIR_ROWS: Row[] = PLAYOFF_ROUNDS.map(({ stage, slots }) => ({
  key: stage,
  cells: [stage, slots.map(({ pairs }) => pairs.map(pairText).join(", ")).join(" · ")],
}));

const LEAGUE_ROWS = LEAGUE_SLOTS.flatMap((slot) =>
  withBreak(slot, { key: `${slot.number}`, cells: [slot.number, slot.time, ...courtCells(slot)] }),
);

export default function TournamentTwelveRulesPage() {
  return (
    <div className="grid min-w-0 grid-cols-1 gap-5">
      <TournamentSectionCard eyebrow="Rules guide" title="How the tournament works">
        <p>
          Six teams of five players in one pool. Every team plays every other team, always with the same numbered
          pair on both sides (A1+A2 v B1+B2). The top four teams play semifinals (Seed 1 v 4, Seed 2 v 3), then a
          final. The final is scheduled to finish at {FINISH_TIME} PM.
        </p>

        <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {SUMMARY.map(({ label, value, detail }) => (
            <li key={label} className="rounded-2xl border border-outline/80 bg-white/80 px-4 py-3">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-court">{label}</p>
              <p className="font-display text-2xl font-semibold text-ink">{value}</p>
              <p className="text-xs leading-5">{detail}</p>
            </li>
          ))}
        </ul>

        <nav aria-label="On this page" className="flex flex-wrap gap-2">
          {ON_THIS_PAGE.map(({ href, label }) => (
            <a key={href} href={href} className="soft-button rounded-full px-3.5 py-1.5 text-sm font-semibold">
              {label}
            </a>
          ))}
        </nav>
      </TournamentSectionCard>

      <section id="my-games" className="scroll-mt-6">
        <TournamentSectionCard eyebrow="Your schedule" title="Find your games">
          <p>
            Pick your team and your player number to see every slot: which court you&apos;re on, who you&apos;re
            partnered with, who you&apos;re playing, and when you sit out.
          </p>
          <GameFinder />
        </TournamentSectionCard>
      </section>

      <section id="format" className="scroll-mt-6">
        <TournamentSectionCard eyebrow="Section 1" title="Format">
          <SubHeading>Format and timing</SubHeading>
          <BulletList>
            <li>Courts: 4. Teams: 6, all in one pool. Every team plays all five other teams.</li>
            <li>
              Each team has 5 players, labelled by team letter and number (Team A: A1, A2, A3, A4, A5). Player
              numbers are fixed roster positions.
            </li>
            <li>
              Every game matches the <Strong>same numbered pair</Strong> on both teams: A1+A2 v B1+B2, never A1+A2 v
              B3+B4.
            </li>
            <li>
              League: <Strong>4 games against each opponent</Strong>, each with a different partnership. Every
              player plays exactly {LEAGUE_GAMES_PER_PLAYER} league games and partners each teammate exactly twice.
            </li>
            <li>
              All six teams play in every league slot. A team can be on two courts at once against different
              opponents, but never more than 4 of its players play at the same time.
            </li>
            <li>Each slot is {SLOT_MINUTES} minutes, game and changeover included.</li>
            <li>A 10-minute group break follows every third slot, except after the final.</li>
            <li>
              Nobody plays three league slots in a row. Players who are not listed in a slot rest.
            </li>
            <li>
              Games use assigned courts. If a game runs long, wait for the organizer&apos;s call before starting
              the next slot; a player cannot be called onto two courts at once.
            </li>
            <li>
              The schedule uses the full 11 AM–7 PM reservation. Overruns or extra tiebreak games require time
              saved earlier in the day.
            </li>
            <li>
              Semifinals and the final are 5-game series: every player plays exactly {PLAYOFF_GAMES_PER_PLAYER} games
              per round. All 5 games are played even if the series is already decided.
            </li>
          </BulletList>

          <SubHeading>Stage summary</SubHeading>
          <Table
            head={["Stage", "Matchups", "Slots", "Games", "Courts"]}
            rows={[
              {
                key: "league",
                cells: ["League", "Every team v every other team, 4 games each", stageSlots("League").length, LEAGUE_GAMES, "4"],
              },
              {
                key: "semis",
                cells: ["Semifinals", "Seed 1 v 4, Seed 2 v 3", stageSlots("Semifinals").length, stageGames("Semifinals"), "4 (2 in last slot)"],
              },
              {
                key: "final",
                cells: ["Final", "Semifinal winners", stageSlots("Final").length, stageGames("Final"), "2 (1 in last slot)"],
              },
              {
                key: "total",
                cells: [<Strong key="t">Total</Strong>, "", <Strong key="s">{SLOTS.length}</Strong>, <Strong key="g">{GAMES.length}</Strong>, ""],
              },
            ]}
          />

          <SubHeading>Games per player</SubHeading>
          <Table
            head={["Team finishes", "Games for every player on the team"]}
            rows={[
              { key: "league", cells: ["5th or 6th (league only)", LEAGUE_GAMES_PER_PLAYER] },
              { key: "semi", cells: ["Loses a semifinal", LEAGUE_GAMES_PER_PLAYER + PLAYOFF_GAMES_PER_PLAYER] },
              { key: "final", cells: ["Reaches the final", LEAGUE_GAMES_PER_PLAYER + 2 * PLAYOFF_GAMES_PER_PLAYER] },
            ]}
          />

          <SubHeading>Court-by-court schedule: League</SubHeading>
          <p>
            Each cell shows the two pairs on that court. Players who aren&apos;t listed in a slot sit out.
            Times are estimates.
          </p>
          <Table head={["#", "Estimated time", "Court 1", "Court 2", "Court 3", "Court 4"]} rows={LEAGUE_ROWS} />

          <SubHeading>Court-by-court schedule: Playoffs</SubHeading>
          <p>
            Playoff teams are not known until the league ends, so rows use seed labels: S4 = the Seed 4 team and
            S4.1 = that team&apos;s player 1 (players keep their numbers 1–5). W1 = winner of Semifinal 1 (Seed 1 v
            4) and W2 = winner of Semifinal 2 (Seed 2 v 3).
          </p>
          <Table head={["#", "Estimated time", "Stage", "Court 1", "Court 2", "Court 3", "Court 4"]} rows={PLAYOFF_ROWS} />

          <SubHeading>Refereeing</SubHeading>
          <BulletList>
            <li>Neutral referees are provided for most games.</li>
            <li>Players may be asked to help referee games they are not playing in.</li>
            <li>If a referee is unsure of a call, the point is replayed.</li>
          </BulletList>

          <SubHeading>Roster changes for playoffs</SubHeading>
          <BulletList>
            <li>
              Each team may make up to <Strong>2 changes</Strong> to its lineup (designated players P1–P5).
            </li>
            <li>
              Option A: make both changes before the start of the playoffs (before the first semifinal game, slot{" "}
              {FIRST_SEMIFINAL_SLOT}).
            </li>
            <li>
              Option B: make one change before the start of the playoffs (before slot {FIRST_SEMIFINAL_SLOT}) and one
              change before the start of the final (before slot {FIRST_FINAL_SLOT}).
            </li>
          </BulletList>
          <ToConfirm>Which position number (P1–P5) a replacement player takes in the rotation.</ToConfirm>
        </TournamentSectionCard>
      </section>

      <section id="game-rules" className="scroll-mt-6">
        <TournamentSectionCard eyebrow="Section 2" title="Game rules and points system">
          <SubHeading>General rules</SubHeading>
          <BulletList>
            <li>
              <Strong>Coin toss:</Strong> every game begins with a coin toss. The winner chooses to serve, receive,
              or pick a side.
            </li>
            <li>
              <Strong>Side switch:</Strong> teams switch sides when one team reaches 11 points.
            </li>
            <li>
              <Strong>Timeouts:</Strong> 1 timeout (60 seconds) per team per game.
            </li>
            <li>
              <Strong>Foot faults</Strong> will be called.
            </li>
            <li>
              <Strong>Wrong server or receiver:</Strong> if the wrong person serves or returns a serve and the error
              is caught before the next point is played, the point is replayed with no penalty. This matters most
              when teams are stacking. Players and the umpire must make sure it does not happen again.
            </li>
          </BulletList>

          <SubHeading>Injuries and replacements</SubHeading>
          <BulletList>
            <li>
              Each team has exactly 5 players (P1–P5). An injured player is replaced by the next lowest-ranked
              player on their team (ranking is the P-number).
            </li>
            <li>
              <Strong>Special pairing rule:</Strong> if the #5 ranked player (P5) is unavailable for a game, the
              opposing team&apos;s captain chooses the replacement.
            </li>
          </BulletList>

          <SubHeading>Scoring</SubHeading>
          <BulletList>
            <li>
              <Strong>Rally scoring</Strong> to 20: a point is scored on every rally, regardless of who served.
            </li>
            <li>
              <Strong>Freeze at 20:</Strong> once a team reaches 20, the game freezes. Only the serving team can
              score. A game is won on serve at 21.
            </li>
            <li>
              <Strong>20-20:</Strong> rally scoring resumes and the game is won by 2 points. Scoring stops at 23
              (the first team to 23 wins).
            </li>
            <li>
              <Strong>Playoff tiebreaks:</Strong> played to 15, freeze at 14 (win on serve at 14).
            </li>
          </BulletList>
          <Table
            head={["Situation", "Rule"]}
            rows={[
              { key: "standard", cells: ["Standard game", "Rally to 20, freeze, win on serve at 21"] },
              { key: "tied", cells: ["Tied 20-20", "Rally scoring, win by 2, capped at 23"] },
              { key: "tiebreak", cells: ["Tiebreak game", "To 15, freeze at 14, win on serve at 14"] },
              { key: "unsure", cells: ["Unsure referee call", "Point is replayed"] },
            ]}
          />

          <SubHeading>Points awarded (league standing)</SubHeading>
          <Table
            head={["Result", "Points to winner"]}
            rows={[
              { key: "win", cells: ["Win", "2"] },
              { key: "bonus", cells: ["Win by 21-14 or a wider margin (bonus applies only here)", "2 + 1 bonus = 3"] },
              { key: "loss", cells: ["Loss", "0"] },
            ]}
          />

          <SubHeading>Team rankings</SubHeading>
          <BulletList ordered>
            <li>
              Teams are ranked by <Strong>total win-points</Strong> (the points earned from games won, per the
              table above).
            </li>
            <li>
              If teams are tied, <Strong>point differential (PD)</Strong> decides. PD = points scored minus points
              conceded, across all games in that phase.
            </li>
            <li>
              If PD is also the same, a <Strong>dreambreaker</Strong> decides (below).
            </li>
          </BulletList>

          <SubHeading>Dreambreaker (tiebreak game)</SubHeading>
          <BulletList ordered>
            <li>Played only when the two teams are still level after PD.</li>
            <li>
              Organizers use a random number generator to pick 2 numbers between 1 and 5, representing player
              positions P1–P5. Example: numbers 3 and 5 mean P3 and P5 from the respective teams play the
              tiebreak.
            </li>
            <li>Format: a one-doubles tiebreak to 15, freeze at 14, win on serve at 14.</li>
          </BulletList>
          <ToConfirm>
            Where the replacement comes from if P5 is injured (there is no lower-ranked player), and the serving,
            fault, kitchen and conduct rules.
          </ToConfirm>
        </TournamentSectionCard>
      </section>

      <section id="league" className="scroll-mt-6">
        <TournamentSectionCard eyebrow="Section 3" title="League matchups">
          <SubHeading>One pool</SubHeading>
          <p>
            All six teams play in a single league. Each team plays every other team 4 times, so every team plays{" "}
            {(LEAGUE_GAMES * 2) / 6} league games. Matchups in the same row use the same four partnerships,
            and both teams always field the same numbered pair.
          </p>
          <Table head={["Matchups", "Partner pairs (same on both teams)"]} rows={MATCHUP_ROWS} />

          <SubHeading>Playoffs</SubHeading>
          <BulletList>
            <li>Semifinal 1: Seed 1 v Seed 4 on Courts 1–2 (5 games).</li>
            <li>Semifinal 2: Seed 2 v Seed 3 on Courts 3–4 (5 games).</li>
            <li>Final: semifinal winners on Courts 1–2 (5 games).</li>
          </BulletList>
          <p>
            Both semifinals use the same pairs, slot by slot. The final uses the other five partnerships, so a
            finalist uses every partnership exactly once across the playoffs.
          </p>
          <Table head={["Stage", "Pairs by slot"]} rows={PLAYOFF_PAIR_ROWS} />

          <SubHeading>League standings</SubHeading>
          <p>
            Teams are ranked across the whole league using the rules under &ldquo;Team rankings&rdquo;: total
            win-points, then PD across all league games, then a dreambreaker. The top four become Seeds 1–4.
          </p>

          <SubHeading>Playoff series result</SubHeading>
          <p>
            The same order applies to each playoff series (semifinal, final): the team with more win-points over
            the 5 games advances; if level, PD across the series decides; if still level, a dreambreaker decides.
          </p>
          <ToConfirm>
            <Strong>Ranking.</Strong> The co-organizer&apos;s planner ranks teams by league games won and avoids
            tiebreak games outside the schedule. The win-points system and dreambreaker above stay until the
            organizers confirm.
          </ToConfirm>
        </TournamentSectionCard>
      </section>

      <section id="venue" className="scroll-mt-6">
        <TournamentSectionCard eyebrow="Section 4" title="Venue, check-in and supplies">
          <Table
            head={["Item", "Details"]}
            rows={[
              { key: "venue", cells: ["Venue", "Ace Pickleball Club, 5502 Monterey Rd Ste 20, San Jose, CA 95138"] },
              { key: "checkin", cells: ["Check-in time", "10:30 AM"] },
              { key: "first", cells: ["First game", "11:00 AM"] },
            ]}
          />
          <SubHeading>Supplies</SubHeading>
          <Table
            head={["Provided by organizers", "Bring your own"]}
            rows={[{ key: "supplies", cells: ["Bananas, electrolytes, Franklin X-40 balls", "Water bottles, towels"] }]}
          />
        </TournamentSectionCard>
      </section>
    </div>
  );
}
