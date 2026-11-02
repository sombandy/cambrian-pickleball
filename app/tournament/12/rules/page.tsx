import type { Metadata } from "next";

import { TournamentSectionCard } from "@/components/tournament-section-card";
import { cn } from "@/lib/utils";

import {
  FINAL_SLOTS,
  finalAppearance,
  GROUP_FIXTURES,
  GROUP_SLOTS,
  pairLabel,
  PLAYOFF_FIXTURES,
  PLAYOFF_SLOTS,
  playerLabel,
  rotationAt,
  ROTATION,
  TEAMS,
  type Fixture,
  type Slot,
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

const SUMMARY = [
  { label: "Teams", value: "6", detail: "5 players each" },
  { label: "Courts", value: "4", detail: "11 AM – 7 PM" },
  { label: "Slot", value: "25 min", detail: "20 game + 5 changeover" },
  { label: "Games", value: "66", detail: "36 groups + 30 playoffs" },
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

// Court cells and resting players for one slot, in court order.
function courtCells(fixtures: Fixture[]) {
  const cells: string[] = [];
  const resting: string[] = [];
  for (const { home, away } of [...fixtures].sort((a, b) => a.court - b.court)) {
    const homeRot = rotationAt(home.appearance);
    const awayRot = rotationAt(away.appearance);
    homeRot.pairs.forEach((pair, idx) => {
      cells.push(`${pairLabel(home.label, pair)} v ${pairLabel(away.label, awayRot.pairs[idx])}`);
    });
    resting.push(playerLabel(home.label, homeRot.rest), playerLabel(away.label, awayRot.rest));
  }
  return { cells, resting };
}

// A slot's row, followed by a full-width "Break" row if a break comes after it.
function withBreak(slot: Slot, row: Row): Row[] {
  if (!slot.breakAfter) return [row];
  const cells: React.ReactNode[] = ["", slot.breakAfter, "Break"];
  const padding = Array(row.cells.length - cells.length).fill("");
  return [row, { key: `${slot.number}-break`, muted: true, cells: [...cells, ...padding] }];
}

function scheduleRows(
  slots: Slot[],
  fixtures: Fixture[],
  lead: (slot: Slot) => React.ReactNode[],
  trail: (slotFixtures: Fixture[]) => React.ReactNode[] = () => [],
): Row[] {
  return slots.flatMap((slot) => {
    const slotFixtures = fixtures.filter((f) => f.slot === slot.number);
    const { cells, resting } = courtCells(slotFixtures);
    return withBreak(slot, {
      key: `${slot.number}`,
      cells: [...lead(slot), ...cells, resting.join(", "), ...trail(slotFixtures)],
    });
  });
}

function idleTeams(slotFixtures: Fixture[]) {
  const playing = new Set(slotFixtures.flatMap((f) => [f.home.label, f.away.label]));
  return [TEAMS.filter((team) => !playing.has(team)).join(", ")];
}

const GROUP_ROWS = scheduleRows(GROUP_SLOTS, GROUP_FIXTURES, (slot) => [slot.number, slot.time], idleTeams);

const PLAYOFF_ROWS = scheduleRows(PLAYOFF_SLOTS, PLAYOFF_FIXTURES, (slot) => [slot.number, slot.time, slot.stage]);

const FINAL_ROWS = FINAL_SLOTS.flatMap((slot, k) => {
  const rest = (seed: number) => {
    const { pairs, rest } = rotationAt(finalAppearance(seed, k));
    return `P${rest} (pairs ${pairs.map((pair) => pair.join("+")).join(", ")})`;
  };
  const court = k === 0 ? "Finalist X pair v Finalist Y pair" : "as above";
  return withBreak(slot, { key: `${slot.number}`, cells: [slot.number, slot.time, court, court, rest(1), rest(3)] });
});

const ROTATION_ROWS = ROTATION.map(({ pairs, rest }, idx) => ({
  key: `${idx}`,
  cells: [
    [idx + 1, idx + 6, idx + 11].join(", "),
    ...pairs.map(([a, b]) => `P${a}+P${b}`),
    `P${rest}`,
  ],
}));

export default function TournamentTwelveRulesPage() {
  return (
    <div className="grid min-w-0 grid-cols-1 gap-5">
      <TournamentSectionCard eyebrow="Rules guide" title="How the tournament works">
        <p>
          Six teams of five players, split into two groups of three. Each group plays a full league. Seeds 1–2
          get semifinal byes, seeds 3–6 play wild cards, then two semifinals and a final.
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

        <ToConfirm>
          With a 5-minute break after every 50 minutes of play, the schedule ends at <Strong>7:10 PM</Strong>{" "}
          (last game ends 7:05 PM), 10 minutes past the 7:00 PM reservation.
        </ToConfirm>

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
            partnered with, who you&apos;re playing, and when you rest.
          </p>
          <GameFinder />
        </TournamentSectionCard>
      </section>

      <section id="format" className="scroll-mt-6">
        <TournamentSectionCard eyebrow="Section 1" title="Format">
          <SubHeading>Format and timing</SubHeading>
          <BulletList>
            <li>Courts: 4. Teams: 6 (Group 1: A, B, C. Group 2: D, E, F).</li>
            <li>
              Teams are placed into Group 1 and Group 2 by <Strong>lucky draw</Strong>.
            </li>
            <li>
              Each team has 5 players, labelled by team letter and number (Team A: A1, A2, A3, A4, A5). 4 play in
              each slot (2 pairs, one per court) and 1 rests.
            </li>
            <li>Each game: 20 minutes, followed by a 5-minute changeover (25-minute slot).</li>
            <li>
              A 5-minute break is inserted whenever another slot would push continuous play past 60 minutes
              (after every second slot).
            </li>
            <li>A &ldquo;series&rdquo; is 6 games between two teams: 3 slots, 2 courts each.</li>
          </BulletList>

          <SubHeading>Stage summary</SubHeading>
          <Table
            head={["Stage", "Matchups", "Slots", "Games", "Courts"]}
            rows={[
              { key: "groups", cells: ["Groups", "A–B, A–C, B–C, D–E, D–F, E–F", 9, 36, 4] },
              { key: "wc", cells: ["Wild cards", "Seed 3 v 6, Seed 4 v 5", 3, 12, 4] },
              { key: "semis", cells: ["Semifinals", "Seed 1 v WC winner, Seed 2 v WC winner", 3, 12, 4] },
              { key: "final", cells: ["Final", "Semifinal winners", 3, 6, 2] },
              { key: "total", cells: [<Strong key="t">Total</Strong>, "", <Strong key="s">18</Strong>, <Strong key="g">66</Strong>, ""] },
            ]}
          />

          <SubHeading>Court-by-court schedule: Group stage</SubHeading>
          <p>
            Each cell shows the doubles pair on that court. Teams sharing a matchup split across two courts. The
            Resting column lists the benched player of each playing team.
          </p>
          <Table
            head={["#", "Time", "Court 1", "Court 2", "Court 3", "Court 4", "Resting players", "Teams idle"]}
            rows={GROUP_ROWS}
          />

          <SubHeading>Court-by-court schedule: Playoffs</SubHeading>
          <p>
            Playoff teams are not known until group play ends, so rows use seed labels: S3 = the Seed 3 team and
            S3.1 = that team&apos;s player 1 (its players keep the numbers 1–5 from their team letter). Each team
            continues its own 5-position rotation from where it left off. W = winner of Seed 4 v 5 and W&apos; =
            winner of Seed 3 v 6.
          </p>
          <Table
            head={["#", "Time", "Stage", "Court 1", "Court 2", "Court 3", "Court 4", "Resting players"]}
            rows={PLAYOFF_ROWS}
          />
          <ToConfirm>
            In the semifinals, W (winner of Seed 4 v 5) plays Seed 1 and W&apos; (winner of Seed 3 v 6) plays
            Seed 2. The exact pairing is still to be confirmed.
          </ToConfirm>

          <SubHeading>Court-by-court schedule: Final</SubHeading>
          <p>
            The final uses Courts 1–2 only (Courts 3–4 free). Both finalists continue their own rotation, so the
            resting player depends on how each team reached the final:
          </p>
          <Table
            head={["#", "Time", "Court 1", "Court 2", "Rest: seed 1/2 finalist", "Rest: wild-card finalist"]}
            rows={FINAL_ROWS}
          />
          <p>
            Each finalist&apos;s two pairs play one on Court 1 and one on Court 2; pairing against the opponent
            follows the listed order (first pair v first pair, second pair v second pair).
          </p>

          <SubHeading>5-position rotation (same for every team)</SubHeading>
          <Table head={["Team appearance", "Pair 1", "Pair 2", "Resting"]} rows={ROTATION_ROWS} />
          <p>
            Over any 5 appearances each player rests exactly once. After 15 appearances every player has played
            exactly 12 games. The group stage (6 appearances per team) gives 4–5 games per player.
          </p>

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
            <li>Option A: make both changes before the start of the playoffs (before the first wild-card game, slot 10).</li>
            <li>
              Option B: make one change before the start of the playoffs (before slot 10) and one change before
              the start of the final (before slot 16).
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
          <SubHeading>Groups</SubHeading>
          <BulletList>
            <li>Group 1: Teams A, B, C</li>
            <li>Group 2: Teams D, E, F</li>
          </BulletList>
          <p>
            Each team plays both group opponents in a 6-game series, 12 games per team. Fixtures are in the
            court-by-court schedule above.
          </p>

          <SubHeading>Playoffs</SubHeading>
          <BulletList>
            <li>Wild cards: Seed 3 v 6, Seed 4 v 5 (6 games each).</li>
            <li>Semifinals: Seed 1 and Seed 2 v wild-card winners (6 games each).</li>
            <li>Final: semifinal winners (6 games, 2 courts).</li>
          </BulletList>

          <SubHeading>Group standings</SubHeading>
          <p>
            Teams are ranked within each group using the rules under &ldquo;Team rankings&rdquo;: total
            win-points, then PD across all group games, then a dreambreaker.
          </p>

          <SubHeading>Playoff series result</SubHeading>
          <p>
            The same order applies to each playoff series (wild card, semifinal, final): the team with more
            win-points over the 6 games advances; if level, PD across the series decides; if still level, a
            dreambreaker decides.
          </p>
          <ToConfirm>
            <Strong>Seeding.</Strong> How the six teams are seeded 1–6 across the two groups (for example, both
            group winners as seeds 1–2, then second places as 3–4, then third places as 5–6). The wild-card and
            semifinal pairings above depend on it.
          </ToConfirm>
          <ToConfirm>
            <Strong>Playoff player rotation.</Strong> Whether playoff lineups continue each team&apos;s league
            rotation (as shown in the schedule above) or follow a new fixed rule.
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
