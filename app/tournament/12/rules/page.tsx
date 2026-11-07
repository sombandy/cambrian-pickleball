import type { Metadata } from "next";

import { TournamentSectionCard } from "@/components/tournament-section-card";
import { cn } from "@/lib/utils";

import { GameFinder } from "./game-finder";

export const metadata: Metadata = {
  title: "Rules",
  description:
    "Games schedule and rules for the 12th Cambrian Pickleball Tournament.",
};

const UPA_RULES_URL = "https://upaa.unitedpickleball.com/official-rulebook/";
// Section 5.3 (The Serve) is on page 25 of the rulebook PDF.
const UPA_SERVE_RULES_URL =
  "https://upaa.unitedpickleball.com/wp-content/uploads/2026/08/V0.9-8.24.26-UPA-A-Rulebook-.pdf#page=25";

const WAIVER_URL = "https://sportscarnival.com/clubs/apc-san-jose-ca/forms/liability_waiver";

function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-semibold text-ink underline decoration-court/40 underline-offset-4 transition hover:decoration-court"
    >
      {children}
    </a>
  );
}

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
      <p className="px-1 text-[0.98rem] leading-7 text-muted">
        Six teams of five players play one league in which every team meets every other team four times, and every
        player plays 8 league games.
        The top four teams move on to the semifinals (Seed 1 v 4, Seed 2 v 3), followed by the final and a 3rd-place
        game. Each playoff round is a five-game series in which every player plays two games.
      </p>

      <section id="my-games" className="scroll-mt-6">
        <TournamentSectionCard eyebrow="Your schedule" title="Games schedule">
          <GameFinder />
        </TournamentSectionCard>
      </section>

      <section id="game-rules" className="scroll-mt-6">
        <TournamentSectionCard eyebrow="Rules" title="Game rules">
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

          <SubHeading>Game play rules</SubHeading>
          <p>
            We will follow <ExternalLink href={UPA_RULES_URL}>UPA rules</ExternalLink> for the actual play.
          </p>
          <BulletList>
            <li>
              <Strong>Serve:</Strong> we call special attention to the serve rules in{" "}
              <ExternalLink href={UPA_SERVE_RULES_URL}>section 5.3</ExternalLink>. If the opposing
              team calls out an invalid serve, the first time is a warning and the point is replayed; the second time,
              the point is forfeited. If the teams disagree on whether a serve is valid, they refer it to the
              organizers, who will appoint an independent referee for the rest of the game.
            </li>
            <li>
              <Strong>Paddles:</Strong> players can use their paddle of choice, within fair and reasonable limits. If
              opponents complain to the organizers about an unapproved or banned paddle (e.g. a Mod 15 or a
              core-crushed paddle), the organizers may ask the player to use a different one.
            </li>
            <li>
              <Strong>Balls:</Strong> all games use Franklin X-40 balls. League games reuse balls (1 new ball for
              every 2 games), and each playoff game gets a new ball.
            </li>
            <li>
              <Strong>Ceiling rule:</Strong> if the ball touches the ceiling, it is out and the point is lost.
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
              <Strong>Playoffs:</Strong>{" "}neutral referees will cover semifinal and final games. Resting players may
              help, but stay available if you&apos;re joining a ready group. The point will be replayed at the
              referee&apos;s discretion if the referee is unsure of a call.
            </li>
          </BulletList>

          <SubHeading>Injuries and replacements</SubHeading>
          <p>
            Each team has exactly 5 players (P1–P5). An injured player is replaced by a player of the opponent&apos;s
            choosing, pending organizer approval. If the teams disagree, the organizers may pick the replacement.
          </p>

          <SubHeading>Playoff roster changes</SubHeading>
          <p>
            Player numbers are fixed roster positions. Each team may make up to <Strong>2 lineup swaps</Strong> in
            total across the playoffs: either both before the semifinals (and none before the final), or one before
            the semifinals and one before the final. Teams send their swaps to the organizers at the same time ahead
            of the playoffs, and the organizers share them with all teams.
          </p>

          <SubHeading>Scoring</SubHeading>
          <BulletList>
            <li>
              <Strong>Rally scoring:</Strong> a point is scored on every rally, regardless of who served.
            </li>
            <li>
              <Strong>Freeze at 20:</Strong> the first team to 21 wins. The first team to reach 20 is frozen, and the
              game is won on serve at 21.
            </li>
            <li>
              <Strong>20-20:</Strong> when the trailing team reaches 20, rally scoring resumes. The first team to lead
              by 2 points or reach 23 wins (it does not have to be on serve).
            </li>
            <li>
              <Strong>Tiebreaks:</Strong> a tiebreaker is a rally-scoring game to 15, freeze at 14 (win on serve at
              14).
            </li>
          </BulletList>
          <Table
            head={["Situation", "Rule"]}
            rows={[
              { key: "standard", cells: ["Standard game", "Rally to 20, freeze, win on serve at 21"] },
              { key: "tied", cells: ["Tied 20-20", "Rally scoring, win by 2, capped at 23"] },
              { key: "tiebreak", cells: ["Tiebreak game", "To 15, freeze at 14, win on serve at 14"] },
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
              If PD is also the same, a <Strong>tiebreaker</Strong> decides (below).
            </li>
          </BulletList>

          <SubHeading>Tiebreaker</SubHeading>
          <BulletList ordered>
            <li>Played only when the two teams are still level after PD.</li>
            <li>
              Organizers use a random number generator to pick 2 numbers between 1 and 5, representing player
              positions P1–P5. Example: numbers 3 and 5 mean P3 and P5 from the respective teams play the
              tiebreak.
            </li>
            <li>Format: a one-doubles tiebreak to 15, freeze at 14, win on serve at 14.</li>
          </BulletList>
        </TournamentSectionCard>
      </section>

      <section id="venue" className="scroll-mt-6">
        <TournamentSectionCard eyebrow="On the day" title="Venue, check-in and club rules">
          <div className="rounded-2xl border border-clay/50 bg-sun px-5 py-4 text-[0.95rem] leading-7 text-ink">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-clay">Required for every player</p>
            <p className="mt-1">
              Sign the <ExternalLink href={WAIVER_URL}>club liability waiver</ExternalLink> at least a day before the
              tournament (by <Strong>Friday, November 13</Strong>). The club needs every player&apos;s waiver before the event.
            </p>
          </div>

          <Table
            head={["Item", "Details"]}
            rows={[
              { key: "venue", cells: ["Venue", "Ace Pickleball Club, 5502 Monterey Rd Ste 20, San Jose, CA 95138"] },
              { key: "checkin", cells: ["Check-in time", "10:30 AM (not earlier)"] },
              { key: "first", cells: ["First game", "11:00 AM"] },
            ]}
          />

          <SubHeading>Club rules</SubHeading>
          <BulletList>
            <li>
              <Strong>Arrival:</Strong> arrive no more than 30 minutes before the 11 AM start. After check-in, the
              club will take everyone to the event room for a quick orientation of the facility.
            </li>
            <li>
              <Strong>Sharing the space:</Strong> the club stays open to members during the tournament. Be mindful of
              others around space and noise, and help keep the club clean and safe for everyone.
            </li>
            <li>
              <Strong>Food:</Strong> fruit and light snacks only. No other food is allowed.
            </li>
            <li>
              <Strong>Event room:</Strong> the club is giving us the event room at no charge and with no cleaning
              fee, so please clean up after yourself before you leave.
            </li>
          </BulletList>

          <SubHeading>Supplies</SubHeading>
          <Table
            head={["Provided by organizers", "Bring your own"]}
            rows={[{ key: "supplies", cells: ["Electrolytes, bananas", "Water bottles, towels"] }]}
          />
        </TournamentSectionCard>
      </section>
    </div>
  );
}
