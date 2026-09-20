import Image from "next/image";

function Strong({ children }: { children: React.ReactNode }) {
  return <strong className="font-semibold text-ink">{children}</strong>;
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="surface-card rounded-[30px] px-5 py-7 sm:px-8 sm:py-8">
      <h2 className="font-display text-2xl leading-tight font-semibold tracking-tight text-ink sm:text-[1.7rem]">
        {title}
      </h2>
      <div className="mt-4 space-y-4 text-[0.98rem] leading-7 text-muted">
        {children}
      </div>
    </section>
  );
}

function Highlight({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border-l-[3px] border-court bg-court-soft/60 px-5 py-4 text-[0.95rem] leading-7 text-ink">
      {children}
    </div>
  );
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="pt-2 font-display text-lg font-semibold tracking-tight text-ink">
      {children}
    </h3>
  );
}

function BulletList({ children }: { children: React.ReactNode }) {
  return <ul className="list-disc space-y-1.5 pl-5">{children}</ul>;
}

function InfoCard({
  badge,
  title,
  children,
}: {
  badge: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[24px] border border-outline/80 bg-white/80 p-5 sm:p-6">
      <span className="inline-flex rounded-full border border-court/15 bg-court-soft px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-court">
        {badge}
      </span>
      <h3 className="mt-3 font-display text-xl font-semibold tracking-tight text-ink">
        {title}
      </h3>
      {children}
    </div>
  );
}

const FINAL_RESULTS = [
  {
    category: "Advanced",
    image: {
      src: "/images/tournaments/competitive-1/advanced-champions.jpg",
      alt: "Abhinay and Nirav, Advanced champions, wearing their first-place medals on court.",
    },
    standings: [
      { pair: "Abhinay / Nirav", medal: "Gold" },
      { pair: "Rajesh / Aditya", medal: "Silver" },
      { pair: "Satish / Raja" },
      { pair: "Arun / Shivesh (Piyush)" },
      { pair: "Monish / Muth" },
      { pair: "Som / Naresh" },
    ],
  },
  {
    category: "Intermediate",
    image: {
      src: "/images/tournaments/competitive-1/intermediate-champions.jpg",
      alt: "Jaynesh and Basavraj, Intermediate champions, wearing their first-place medals on court.",
    },
    standings: [
      { pair: "Jaynesh / Basavraj", medal: "Gold" },
      { pair: "Ankit / Krishna", medal: "Silver" },
      { pair: "Vijay / Kaushik" },
      { pair: "Bhanu / Srini" },
      { pair: "Rajib / Venkata" },
    ],
  },
];

const GROUPS = [
  {
    name: "Group A",
    pairs: [
      "Abhinay / Nirav",
      "Ankit / Krishna",
      "Monish / Muth",
      "Satish / Raja",
      "Vijay / Kaushik",
    ],
  },
  {
    name: "Group B",
    pairs: [
      "Bhanu / Srini",
      "Rajesh / Aditya",
      "Jaynesh / Basavraj",
      "Arun / Shivesh (Piyush)",
      "Rajib / Venkata",
      "Som / Naresh",
    ],
  },
];

const TOURNAMENT_FLOW = [
  "11 Teams",
  "Group A: 5 Teams + Group B: 6 Teams",
  "Initial League Round",
  "Top 2 from Each Group → Advanced",
  "3rd Group A + 3rd & 4th Group B → Stack Ranked",
  "#1 Ranked → 5th Advanced Team",
  "Remaining 2 Teams",
  "Played Each Other → Higher-Ranked Team Advances / Did Not Play → Rally Game to 11 Determines Qualifier",
  "6 Advanced Teams | 5 Intermediate Teams",
  "Advanced Round Robin | Intermediate Round Robin",
  "Top 2 in Each Category",
  "Advanced Final | Intermediate Final",
];

export function CompetitiveTournamentTabs() {
  return (
    <div className="grid gap-5">
      <FinalResultsSection />

      <SectionCard title="A New Kind of Tournament">
        <p>
          For the past several years, our neighborhood pickleball tournaments
          have been built around community, inclusiveness, and fun. We have
          intentionally created opportunities for players of all skill levels to
          enjoy meaningful games, meet new people, and strengthen the
          friendships that make our pickleball community special. That spirit
          remains at the heart of everything we do.
        </p>
        <p>
          This tournament introduces a new format for our community — a{" "}
          <strong className="font-semibold text-ink">
            purely competitive event
          </strong>
          . It is important to emphasize that this is{" "}
          <strong className="font-semibold text-ink">
            not replacing our regular community tournaments
          </strong>
          . Those tournaments will continue to be an integral part of our
          pickleball community, and the next organizing team has already been
          identified and is actively planning the next community tournament.
        </p>
        <p>
          The objective of this event is to provide a platform for players who
          are looking for a more competitive experience to challenge themselves
          and enjoy tournament-style play. While the focus shifts toward
          competition, the values that define our community do not. We expect
          every participant to compete with integrity, respect their opponents
          and officials, and demonstrate the sportsmanship that has always made
          our group welcoming and enjoyable.
        </p>
        <p>
          We hope this tournament adds another dimension to our community by
          offering both the excitement of competition and the camaraderie that
          brings us together on the court.
        </p>
      </SectionCard>

      <SectionCard title="When & Where">
        <p className="font-display text-lg font-semibold tracking-tight text-ink">
          Saturday, September 19, 2026
        </p>
        <p className="font-display text-lg font-semibold tracking-tight text-ink">
          <a
            href="https://www.avac.us/Club/Scripts/Home/home.asp"
            target="_blank"
            rel="noopener noreferrer"
            className="text-court underline decoration-court/40 underline-offset-4 transition hover:decoration-court"
          >
            Almaden Valley Athletic Club (AVAC)
          </a>
        </p>
      </SectionCard>

      <GroupingsSection />

      <SectionCard title="Tournament Format">
        <p>
          The tournament will begin with all 11 teams competing together,
          without an Advanced or Intermediate designation. Teams will be split
          into two groups for the initial league round, and their performance
          will determine which teams advance to the Advanced category.
        </p>

        <SubHeading>1. Initial Group Stage</SubHeading>
        <div className="grid gap-4 sm:grid-cols-2">
          <InfoCard badge="Group A" title="5 Teams">
            <p className="mt-2">
              Each team will play every other team in the group.
            </p>
            <p className="mt-2">
              <Strong>4 matches per team</Strong>
            </p>
          </InfoCard>
          <InfoCard badge="Group B" title="6 Teams">
            <p className="mt-2">
              Each team will play 4 of the other 5 teams in the group. Each team
              will have one team they do not play.
            </p>
            <p className="mt-2">
              <Strong>4 matches per team</Strong>
            </p>
          </InfoCard>
        </div>

        <SubHeading>2. Qualification for the Advanced Category</SubHeading>
        <p>After the initial group stage is completed:</p>
        <BulletList>
          <li>
            The <Strong>top 2 teams from Group A</Strong> will automatically
            qualify for the Advanced category.
          </li>
          <li>
            The <Strong>top 2 teams from Group B</Strong> will automatically
            qualify for the Advanced category.
          </li>
        </BulletList>
        <Highlight>
          <strong className="font-semibold">
            4 teams automatically qualify for Advanced
          </strong>
          <br />
          Top 2 from Group A + Top 2 from Group B
        </Highlight>

        <SubHeading>3. Determining the 5th Advanced Team</SubHeading>
        <p>
          The <Strong>3rd-place team from Group A</Strong> and the{" "}
          <Strong>3rd- and 4th-place teams from Group B</Strong> will be
          combined into a three-team pool.
        </p>
        <p>
          These three teams will be{" "}
          <Strong>
            stack ranked based on number of wins and point differential
          </Strong>{" "}
          from the initial league round.
        </p>
        <Highlight>
          <strong className="font-semibold">
            The #1 ranked team among these three teams will automatically
            qualify as the 5th Advanced team.
          </strong>
        </Highlight>

        <SubHeading>4. Determining the 6th Advanced Team</SubHeading>
        <p>
          The remaining two teams will compete for the final spot in the
          Advanced category.
        </p>
        <p>
          <Strong>
            If the two teams played each other during the initial league round:
          </Strong>
          <br />
          The team that is ahead in the overall ranking will qualify as the{" "}
          <Strong>6th Advanced team</Strong>.
        </p>
        <p>
          <Strong>
            If the two teams did not play each other during the initial league
            round:
          </Strong>
          <br />
          They will play a single{" "}
          <Strong>rally-scoring game to 11 points</Strong> to determine the
          final Advanced qualifier. See{" "}
          <Strong>Game &amp; Scoring → Rally scoring to 11</Strong> for the
          complete scoring format.
        </p>
        <p>
          The winner of this game will qualify as the{" "}
          <Strong>6th Advanced team</Strong>.
        </p>

        <SubHeading>5. Advanced Category</SubHeading>
        <p>
          The 6 teams qualifying for the Advanced category will form a new
          group. All 6 teams will play a round-robin, with each team playing
          every other team in the group.
        </p>
        <BulletList>
          <li>
            Each team will play <Strong>5 matches</Strong>.
          </li>
          <li>
            There will be <Strong>15 total matches</Strong>.
          </li>
          <li>
            The top 2 teams will advance to the <Strong>Advanced Final</Strong>.
          </li>
        </BulletList>
        <Highlight>
          <strong className="font-semibold">🏆 Advanced Final</strong>
          <br />
          The #1 and #2 ranked teams will compete for the Advanced Championship.
        </Highlight>

        <SubHeading>6. Intermediate Category</SubHeading>
        <p>
          The remaining 5 teams will form the Intermediate category. All 5 teams
          will play a round-robin, with each team playing every other team in
          the group.
        </p>
        <BulletList>
          <li>
            Each team will play <Strong>4 matches</Strong>.
          </li>
          <li>
            There will be <Strong>10 total matches</Strong>.
          </li>
          <li>
            The top 2 teams will advance to the{" "}
            <Strong>Intermediate Final</Strong>.
          </li>
        </BulletList>
        <Highlight>
          <strong className="font-semibold">🏆 Intermediate Final</strong>
          <br />
          The #1 and #2 ranked teams will compete for the Intermediate
          Championship.
        </Highlight>

        <SubHeading>Tournament Flow</SubHeading>
        <Highlight>
          <div className="text-center font-semibold">
            {TOURNAMENT_FLOW.map((step, index) => (
              <div key={step}>
                {index > 0 && <div className="font-normal text-muted">↓</div>}
                {step.split(" / ").map((line) => (
                  <div key={line}>{line}</div>
                ))}
              </div>
            ))}
          </div>
        </Highlight>

        <Highlight>
          <strong className="font-semibold">Note:</strong> This format rewards
          performance during the initial league round while giving teams that
          narrowly miss automatic qualification an opportunity to compete for
          the final Advanced spot.
        </Highlight>
      </SectionCard>

      <SectionCard title="Game & Scoring Rules">
        <SubHeading>Rally Scoring to 21</SubHeading>
        <p>
          All games will be played using <Strong>rally scoring</Strong>.
        </p>
        <BulletList>
          <li>
            Games will be played to <Strong>21 points</Strong>.
          </li>
          <li>
            Teams will{" "}
            <Strong>change sides when a team reaches 11 points</Strong>.
          </li>
          <li>
            The team leading at <Strong>20 points will freeze at 20</Strong>.
          </li>
          <li>
            From 20–20, play will continue until either:
            <ul className="mt-1.5 list-[circle] space-y-1.5 pl-5">
              <li>
                A team wins by <Strong>2 points</Strong>, or
              </li>
              <li>
                A team reaches <Strong>23 points</Strong>.
              </li>
            </ul>
          </li>
          <li>
            The first team to reach the applicable winning score will win the
            game.
          </li>
        </BulletList>

        <SubHeading>Group Standings &amp; Tie-Breakers</SubHeading>
        <p>Group rankings will be determined in the following order:</p>
        <ol className="list-decimal space-y-1.5 pl-5">
          <li>
            <Strong>Wins</Strong> — teams are ranked by number of games won.
          </li>
          <li>
            <Strong>Point Differential (PD)</Strong> — if teams are tied on
            wins, the next tie-breaker is point differential:{" "}
            <Strong>total points scored − total points conceded</Strong>.
          </li>
          <li>
            <Strong>Head-to-Head Game Result</Strong> — if the teams are still
            tied and have played each other, the head-to-head result is used.
          </li>
          <li>
            <Strong>11-Point Tie-Breaker Game</Strong> — if the tie is still
            unresolved and the result is consequential to advancement or
            placement, the tied teams play a single rally-scoring tie-breaker
            game using the <Strong>11-point format</Strong> below.
          </li>
        </ol>
        <Highlight>
          <strong className="font-semibold">
            When is a tie-breaker game required?
          </strong>
          <br />A tie-breaker game is used only when the tied positions are
          consequential — meaning the tie changes which category a team advances
          to, whether a team reaches a championship path, or another meaningful
          tournament placement.
        </Highlight>
        <p>
          For the initial group stage, this means a tie-breaker game is required
          when it affects the{" "}
          <Strong>2nd/3rd positions in Group A or Group B</Strong>, or the{" "}
          <Strong>
            3rd/4th positions in Group B and 4th/5th positions in Group B
          </Strong>
          . A tie between <Strong>1st and 2nd</Strong>, for example, does not
          require a tie-breaker game if both positions lead to the same outcome.
        </p>

        <SubHeading>Rally scoring to 11</SubHeading>
        <p>
          When an 11-point tie-breaker game is required, it will use the
          following format:
        </p>
        <BulletList>
          <li>
            The game will use <Strong>rally scoring</Strong>.
          </li>
          <li>
            The game is played to <Strong>11 points</Strong>.
          </li>
          <li>
            Teams will{" "}
            <Strong>change sides when a team reaches 6 points</Strong>.
          </li>
          <li>
            The team leading at <Strong>10 points will freeze at 10</Strong>.
          </li>
          <li>
            At <Strong>10–10</Strong>, play continues until a team either wins
            by <Strong>2 points</Strong> or reaches <Strong>13 points</Strong>.
          </li>
          <li>
            The first team to reach the applicable winning score wins the
            tie-breaker.
          </li>
        </BulletList>

        <SubHeading>Please Help Us Keep the Tournament Moving</SubHeading>
        <p>
          We have a <Strong>tight schedule</Strong> and need to complete a total
          of <Strong>47 games</Strong> to conclude the tournament. Keeping the
          tournament on schedule will require everyone&apos;s cooperation.
        </p>
        <p>Please help us minimize downtime between games:</p>
        <BulletList>
          <li>Be ready to play when your court is called.</li>
          <li>Move to your assigned court promptly.</li>
          <li>Keep warm-ups and between-game discussions brief.</li>
          <li>Avoid unnecessary delays between points and games.</li>
          <li>
            Have your team ready before the previous game on your court
            finishes.
          </li>
        </BulletList>
        <Highlight>
          <strong className="font-semibold">Every minute counts.</strong>
          <br />
          The faster we can get teams onto the court and ready to play, the more
          smoothly the tournament will run and the better experience we can
          provide for everyone.
        </Highlight>
        <p>
          We appreciate everyone&apos;s cooperation in helping us keep the games
          moving and finish the tournament on time.
        </p>
      </SectionCard>

      <SectionCard title="Rules & Guidance">
        <p>
          Unlike our previous community tournaments, this event does not involve
          organizers creating teams or assigning partners. Since this is a
          doubles tournament, participants are free to choose their own partner
          and register together as a doubles pair.
        </p>

        <SubHeading>Choose Your Own Partner</SubHeading>
        <p>
          Players register as a doubles pair. The initial group stage determines
          whether a pair advances to the Advanced or Intermediate category.
        </p>

        <Highlight>
          <strong className="font-semibold">Looking for a Partner?</strong>
          <br />
          Players who have not yet found a partner are welcome to register as
          individuals. A list of players registered individually will be
          published to help facilitate partner matching.
        </Highlight>

        <SubHeading>Competitive Group Play</SubHeading>
        <p>
          Pairs will compete in the initial group stage, and their results will
          determine their path to the Advanced or Intermediate category.
        </p>

        <SubHeading>Paddle Rules</SubHeading>
        <p>
          To keep things simple and fair, the following paddle guidelines will
          apply:
        </p>
        <BulletList>
          <li>
            If you are using the same paddle you used in the previous
            tournament, you may continue using it.
          </li>
          <li>
            A <Strong>USA Pickleball-approved paddle</Strong>, or a
            clone/equivalent version of an approved paddle, is allowed.
          </li>
          <li>
            <Strong>MOD paddles are not allowed</Strong>, as they have been
            categorically banned by <Strong>USPA</Strong>.
          </li>
          <li>
            <Strong>
              Core-crushed or intentionally altered paddles are not allowed.
            </Strong>
          </li>
        </BulletList>
        <Highlight>
          This is a friendly tournament and should be played in good spirits.
          Everyone is expected to adhere to these paddle rules. Organizers will
          not be checking or approving paddles before the tournament;{" "}
          <strong className="font-semibold">
            the paddle rules will be followed on an honor system.
          </strong>
        </Highlight>

        <Highlight>
          <strong className="font-semibold">Cambrian DUPR Ratings</strong>
          <br />
          All matches played in this tournament will contribute to the
          players&apos; Cambrian DUPR ratings.
        </Highlight>
      </SectionCard>

      <SectionCard title="Registration Fees">
        <p>
          Registration is <Strong>$40 per player</Strong>.
        </p>
        <p>
          The registration fee helps cover{" "}
          <Strong>
            court reservations, balls, prizes, and other event costs
          </Strong>
          .
        </p>
      </SectionCard>
    </div>
  );
}

function FinalResultsSection() {
  return (
    <section className="surface-card rounded-[30px] px-5 py-7 sm:px-8 sm:py-8">
      <h2 className="font-display text-2xl leading-tight font-semibold tracking-tight text-ink sm:text-[1.7rem]">
        Champions &amp; Final Standings
      </h2>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {FINAL_RESULTS.map((result) => (
          <div
            key={result.category}
            className="overflow-hidden rounded-[24px] border border-outline/80 bg-white/80"
          >
            <Image
              src={result.image.src}
              alt={result.image.alt}
              width={1200}
              height={1600}
              sizes="(min-width: 640px) 44vw, 100vw"
              className="aspect-[4/5] w-full object-cover object-top"
            />
            <div className="p-5 sm:p-6">
              <span className="inline-flex rounded-full border border-court/15 bg-court-soft px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-court">
                {result.category} Group
              </span>
              <h3 className="mt-3 font-display text-xl font-semibold tracking-tight text-ink">
                🏆 {result.standings[0].pair}
              </h3>
              <ol className="mt-4 divide-y divide-outline/70">
                {result.standings.map((standing, index) => (
                  <li
                    key={standing.pair}
                    className="flex items-center justify-between gap-3 py-2.5 text-[0.95rem] font-medium text-ink"
                  >
                    <span>
                      {index + 1}. {standing.pair}
                    </span>
                    {standing.medal ? (
                      <span className="text-sm font-semibold text-court">
                        {standing.medal === "Gold" ? "🥇" : "🥈"}{" "}
                        {standing.medal}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function GroupingsSection() {
  return (
    <section className="surface-card rounded-[30px] px-5 py-7 sm:px-8 sm:py-8">
      <h2 className="font-display text-2xl leading-tight font-semibold tracking-tight text-ink sm:text-[1.7rem]">
        Groupings
      </h2>
      <p className="mt-4 text-[0.98rem] leading-7 text-muted">
        <Strong>11 pairs</Strong> competed in the initial group stage. The groups
        below are the opening-round groupings.
      </p>
      <p className="mt-2 text-sm leading-6 text-muted">
        Substitutions: Aditya played in place of Kulwinder (with Rajesh), and
        Piyush got injured and was replaced by Shivesh (with Arun).
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {GROUPS.map((group) => (
          <div
            key={group.name}
            className="rounded-[24px] border border-outline/80 bg-white/80 p-5 sm:p-6"
          >
            <h3 className="font-display text-xl font-semibold tracking-tight text-ink">
              {group.name}
            </h3>
            <p className="mt-1 text-sm text-muted">
              {group.pairs.length} pairs · 4 matches per pair
            </p>
            <ul className="mt-4 divide-y divide-outline/70">
              {group.pairs.map((pair, index) => (
                <li
                  key={pair}
                  className="py-2.5 text-[0.95rem] font-medium text-ink"
                >
                  {index + 1}. {pair}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-[24px] border border-outline/80 bg-court-soft/30 p-5 sm:p-6">
        <h3 className="font-display text-lg font-semibold tracking-tight text-ink">
          Looking for a Partner?
        </h3>
        <p className="mt-1 text-sm leading-6 text-muted">
          Players who are still looking for a partner can contact the organizers
          for help finding a match.
        </p>
      </div>
    </section>
  );
}
