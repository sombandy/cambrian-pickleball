import type { Metadata } from "next";

import { TournamentSectionCard } from "@/components/tournament-section-card";
import { cn } from "@/lib/utils";

import { GAMES, LEAGUE_FIXTURES, SLOT_MINUTES } from "../schedule";
import { GameFinder } from "./game-finder";

export const metadata: Metadata = {
  title: "Rules",
  description:
    "Games schedule and rules for the 12th Cambrian Pickleball Tournament.",
};

const ON_THIS_PAGE = [
  { href: "#my-games", label: "Games schedule" },
  { href: "#game-rules", label: "Game rules & points" },
  { href: "#venue", label: "Venue & check-in" },
];

const LEAGUE_GAMES = LEAGUE_FIXTURES.length;
// The 3rd-place series mirrors the final and runs alongside it on Courts 3 & 4.
const THIRD_PLACE_GAMES = GAMES.filter((game) => game.home === "W1").length;
const TOTAL_GAMES = GAMES.length + THIRD_PLACE_GAMES;

const SUMMARY = [
  { label: "Teams", value: "6", detail: "5 players each" },
  { label: "Courts", value: "4", detail: "11 AM – 7 PM" },
  { label: "Game budget", value: `${SLOT_MINUTES} min`, detail: "estimate incl. changeover" },
  {
    label: "Games",
    value: `${TOTAL_GAMES}`,
    detail: `${LEAGUE_GAMES} league + ${TOTAL_GAMES - LEAGUE_GAMES} playoffs`,
  },
];

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

type Row = { key: string; cells: React.ReactNode[] };

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
            <tr key={row.key} className="border-t border-outline/60 text-ink">
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

export default function TournamentTwelveRulesPage() {
  return (
    <div className="grid min-w-0 grid-cols-1 gap-5">
      <TournamentSectionCard eyebrow="Rules guide" title="How the tournament works">
        <p>
          Six teams of five players in one pool. Every team plays every other team four times, with the same numbered
          pair on both sides (A1+A2 v B1+B2). The top four teams play semifinals (Seed 1 v 4, Seed 2 v 3), then a
          final and a 3rd-place game. League games are played on Open Courts.
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
        <TournamentSectionCard eyebrow="Your schedule" title="Games schedule">
          <GameFinder />
        </TournamentSectionCard>
      </section>

      <section id="game-rules" className="scroll-mt-6">
        <TournamentSectionCard eyebrow="Rules" title="Game rules and points system">
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

          <SubHeading>Refereeing</SubHeading>
          <BulletList ordered>
            <li>
              <Strong>League games:</Strong> we will NOT have referees for league games. We request players to
              follow the honor code and call reasonably and fairly. When there is disagreement between both teams,
              the point will be replayed.
            </li>
            <li>
              <Strong>Playoffs:</Strong>{" "}neutral referees will cover semifinal, final and 3rd-place games. Resting
              players may help, but stay available if you&apos;re joining a ready group. The point will be replayed
              at the referee&apos;s discretion if the referee is unsure of a call.
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

          <SubHeading>Playoff roster changes</SubHeading>
          <p>
            Player numbers are fixed roster positions. Each team may make up to <Strong>2 lineup changes</Strong>:
            both before the first semifinal game, or one before the semifinals and one before the final or 3rd-place game.
          </p>

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
              { key: "disputed", cells: ["Disputed call (league)", "Point is replayed"] },
              { key: "unsure", cells: ["Unsure referee call (playoffs)", "Replayed at the referee's discretion"] },
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
          <p>
            Apply this order across the league to seed the top four teams, and across each five-game playoff
            series to decide its winner.
          </p>
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
          <ToConfirm>
            The alternate planner uses games won without extra tiebreaks. Win-points and dreambreakers remain
            until organizers confirm.
          </ToConfirm>

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
            Replacement roster positions, who replaces an injured P5 (there is no lower-ranked player),
            and the serving, fault, kitchen and conduct rules.
          </ToConfirm>
        </TournamentSectionCard>
      </section>

      <section id="venue" className="scroll-mt-6">
        <TournamentSectionCard eyebrow="On the day" title="Venue, check-in and supplies">
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
            rows={[{ key: "supplies", cells: ["Electrolytes", "Water bottles, towels"] }]}
          />
        </TournamentSectionCard>
      </section>
    </div>
  );
}
