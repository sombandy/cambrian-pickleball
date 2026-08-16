"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

const SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTrs0XwNUq7Iy9MqOs48egECDl14IyXFhiYNa5cBqHSkxUbirRO2udwNrQ3juMubRiifEQM6FnNOkQF/pub?gid=1790095873&single=true&output=csv";

const TABS = [
  { id: "rules", label: "Tournament Info & Rules" },
  { id: "players", label: "Who's Playing" },
] as const;

type TabId = (typeof TABS)[number]["id"];

type RegistrationPair = {
  name: string;
  partner: string;
};

type Registrations = {
  advanced: RegistrationPair[];
  intermediate: RegistrationPair[];
  individuals: string[];
};

type RegistrationState =
  | { status: "loading" }
  | { status: "error" }
  | ({ status: "ready" } & Registrations);

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"' && quoted && next === '"') {
      cell += '"';
      i++;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(cell.trim());
      cell = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") {
        i++;
      }
      row.push(cell.trim());
      if (row.some((value) => value !== "")) {
        rows.push(row);
      }
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }

  if (cell !== "" || row.length > 0) {
    row.push(cell.trim());
    if (row.some((value) => value !== "")) {
      rows.push(row);
    }
  }

  return rows;
}

function parseRegistrations(csvText: string): Registrations {
  const rows = parseCsv(csvText);

  if (rows.length < 2) {
    throw new Error("No registrations found");
  }

  const headers = rows[0].map((header) => header.toLowerCase().trim());
  const columnIndex = (name: string) => headers.indexOf(name.toLowerCase());

  const categoryColumn = columnIndex("Tournament Category?");
  const nameColumn = columnIndex("Your Name?");
  const partnerColumn = columnIndex(
    "If registering as a Pair, Who is your partner?",
  );

  if (categoryColumn < 0 || nameColumn < 0 || partnerColumn < 0) {
    throw new Error("Sheet column names do not match");
  }

  const registrations = rows
    .slice(1)
    .map((row) => ({
      category: (row[categoryColumn] ?? "").trim().toLowerCase(),
      name: (row[nameColumn] ?? "").trim(),
      partner: (row[partnerColumn] ?? "").trim(),
    }))
    .filter((registration) => registration.name !== "");

  const pairs = registrations.filter((registration) => registration.partner !== "");

  return {
    advanced: pairs.filter((pair) => pair.category.includes("advanced")),
    intermediate: pairs.filter((pair) => pair.category.includes("intermediate")),
    individuals: registrations
      .filter((registration) => registration.partner === "")
      .map((registration) => registration.name),
  };
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

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex rounded-full border border-court/15 bg-court-soft px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-court">
      {children}
    </span>
  );
}

function InfoTile({
  badge,
  title,
  children,
}: {
  badge: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[24px] border border-outline/80 bg-white/80 p-5">
      <Badge>{badge}</Badge>
      <h3 className="mt-3 font-display text-lg font-semibold tracking-tight text-ink">
        {title}
      </h3>
      <p className="mt-1 text-sm leading-6 text-muted">{children}</p>
    </div>
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

function RulesTab() {
  return (
    <div className="grid gap-5">
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
        <div className="grid gap-4 sm:grid-cols-2">
          <InfoTile badge="Location" title="AVAC">
            The tournament will be held at AVAC.
          </InfoTile>
          <InfoTile badge="Date" title="September 2026">
            The final date will be based on the availability of the majority of
            registered players.
          </InfoTile>
        </div>
        <p>
          Once registration is complete and player availability is collected, we
          will announce the final tournament date.
        </p>
      </SectionCard>

      <SectionCard title="Rules & Guidance">
        <p>
          Unlike our previous community tournaments, this event does not involve
          organizers creating teams or assigning partners. Since this is a
          doubles tournament, participants are free to choose their own partner
          and register together as a doubles pair.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <InfoTile badge="Division 1" title="Advanced">
            Open to all players.
          </InfoTile>
          <InfoTile badge="Division 2" title="Intermediate">
            Open to all players.
          </InfoTile>
        </div>

        <SubHeading>Choose Your Own Partner</SubHeading>
        <p>
          Players register as a doubles pair and are free to register in either
          division based on where they feel they can compete most appropriately.
        </p>

        <Highlight>
          <strong className="font-semibold">Looking for a Partner?</strong>
          <br />
          Players who have not yet found a partner are welcome to register as
          individuals. A list of players registered individually will be
          published to help facilitate partner matching.
        </Highlight>

        <SubHeading>No Sandbagging</SubHeading>
        <p>
          To ensure fair and competitive matchups,{" "}
          <strong className="font-semibold text-ink">
            sandbagging will not be permitted
          </strong>
          . Organizers may review registrations and pairings across categories.
          If two players who are clearly playing at an Advanced level register
          together in the Intermediate category, they may be asked to compete in
          the Advanced category instead.
        </p>
        <p>
          The goal is to maintain a competitive and enjoyable experience for
          everyone while keeping category selection as open and flexible as
          possible.
        </p>

        <SubHeading>Choose Your Competitive Level</SubHeading>
        <p>
          Players are encouraged to select the category where they believe they
          can have the{" "}
          <strong className="font-semibold text-ink">
            most competitive and enjoyable matches
          </strong>
          . Choosing the right level gives each pair the best opportunity to
          compete strongly, advance through the tournament, and ultimately
          contend for the trophy.
        </p>

        <SubHeading>Competitive Group Play</SubHeading>
        <p>
          Depending on the number of registrations, pairs may be divided into
          groups with round-robin play within each group. Not every pair will
          necessarily play every other pair in the category. Based on
          group-stage results, the top-performing pairs will advance to the
          playoffs and compete for the championship.
        </p>

        <SubHeading>Finalizing Categories</SubHeading>
        <p>
          Once registration closes, we will publish the registered pairs in each
          category and open a brief window for participants to finalize their
          preferred category. This will allow everyone to{" "}
          <strong className="font-semibold text-ink">
            review the matchups
          </strong>{" "}
          and choose the level of competition in which they would most like to
          participate.
        </p>

        <Highlight>
          <strong className="font-semibold">Important:</strong> The final
          tournament format — including pools, brackets, round-robin structure,
          and playoff qualification — will be determined after registration
          closes and will depend on the number of entries in each category.
        </Highlight>
      </SectionCard>

      <SectionCard title="Registration Fees">
        <p>
          Registration fees for each category will be finalized after
          registration closes and will depend on the total number of
          participants registered.
        </p>
        <p>
          This approach ensures that tournament expenses, including{" "}
          <strong className="font-semibold text-ink">
            court reservations, balls, prizes, and other event costs
          </strong>
          , are shared fairly among participants.
        </p>
      </SectionCard>
    </div>
  );
}

function PairList({ pairs }: { pairs: RegistrationPair[] }) {
  if (pairs.length === 0) {
    return (
      <p className="mt-4 rounded-2xl bg-court-soft/40 px-4 py-3 text-sm text-muted">
        No pairs registered yet.
      </p>
    );
  }

  return (
    <ul className="mt-4 divide-y divide-outline/70">
      {pairs.map((pair, index) => (
        <li
          key={`${pair.name}-${pair.partner}`}
          className="py-2.5 text-[0.95rem] font-medium text-ink"
        >
          {index + 1}. {pair.name} &amp; {pair.partner}
        </li>
      ))}
    </ul>
  );
}

function DivisionCard({
  title,
  pairs,
  loading,
}: {
  title: string;
  pairs: RegistrationPair[] | null;
  loading: boolean;
}) {
  return (
    <div className="rounded-[24px] border border-outline/80 bg-white/80 p-5 sm:p-6">
      <Badge>Doubles Open</Badge>
      <h3 className="mt-3 font-display text-xl font-semibold tracking-tight text-ink">
        {title}
      </h3>
      <p className="mt-1 text-sm text-muted">
        {loading
          ? "Loading…"
          : pairs
            ? `${pairs.length} pair${pairs.length === 1 ? "" : "s"} registered`
            : "Unable to load registrations."}
      </p>
      {pairs ? <PairList pairs={pairs} /> : null}
    </div>
  );
}

function PlayersTab() {
  const [state, setState] = useState<RegistrationState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    async function loadRegistrations() {
      try {
        const response = await fetch(SHEET_CSV_URL, { cache: "no-store" });
        if (!response.ok) {
          throw new Error("Unable to load registration sheet");
        }
        const registrations = parseRegistrations(await response.text());
        if (!cancelled) {
          setState({ status: "ready", ...registrations });
        }
      } catch (error) {
        console.error(error);
        if (!cancelled) {
          setState({ status: "error" });
        }
      }
    }

    loadRegistrations();

    return () => {
      cancelled = true;
    };
  }, []);

  const loading = state.status === "loading";
  const ready = state.status === "ready";
  const totalPairs = ready ? state.advanced.length + state.intermediate.length : 0;

  return (
    <section className="surface-card rounded-[30px] px-5 py-7 sm:px-8 sm:py-8">
      <h2 className="font-display text-2xl leading-tight font-semibold tracking-tight text-ink sm:text-[1.7rem]">
        Who&apos;s Playing
      </h2>
      <p className="mt-4 text-[0.98rem] leading-7 text-muted">
        Registered pairs appear here automatically from the tournament
        registration sheet.
      </p>

      <Highlight>
        {loading
          ? "Loading registrations…"
          : ready
            ? `Showing ${totalPairs} registered pair${totalPairs === 1 ? "" : "s"} and ${state.individuals.length} individual registration${state.individuals.length === 1 ? "" : "s"}.`
            : "Registrations could not be loaded right now. Please check back soon."}
      </Highlight>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <DivisionCard
          title="Advanced"
          pairs={ready ? state.advanced : null}
          loading={loading}
        />
        <DivisionCard
          title="Intermediate"
          pairs={ready ? state.intermediate : null}
          loading={loading}
        />
      </div>

      <div className="mt-5 rounded-[24px] border border-outline/80 bg-court-soft/30 p-5 sm:p-6">
        <h3 className="font-display text-lg font-semibold tracking-tight text-ink">
          Looking for a Partner?
        </h3>
        <p className="mt-1 text-sm leading-6 text-muted">
          Players who registered individually and are still looking for a
          partner are listed here.
        </p>
        {loading ? (
          <p className="mt-4 text-sm text-muted">Loading registrations…</p>
        ) : ready ? (
          state.individuals.length === 0 ? (
            <p className="mt-4 text-sm text-muted">
              No individual players currently looking for a partner.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-outline/70">
              {state.individuals.map((name) => (
                <li
                  key={name}
                  className="py-2.5 text-[0.95rem] font-medium text-ink"
                >
                  {name}
                </li>
              ))}
            </ul>
          )
        ) : (
          <p className="mt-4 text-sm text-muted">Unable to load registrations.</p>
        )}
      </div>
    </section>
  );
}

export function CompetitiveTournamentTabs() {
  const [activeTab, setActiveTab] = useState<TabId>("rules");

  return (
    <div className="grid gap-5">
      <div className="inline-flex w-fit max-w-full overflow-x-auto rounded-[22px] border border-white/80 bg-white/82 p-1.5 shadow-[0_20px_34px_-30px_rgba(30,41,59,0.32)] backdrop-blur-xl">
        {TABS.map((tab) => {
          const active = tab.id === activeTab;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              aria-pressed={active}
              className={cn(
                "whitespace-nowrap rounded-2xl px-4 py-2 text-sm font-semibold transition",
                active
                  ? "primary-button shadow-[0_14px_24px_-18px_rgba(140,169,43,0.52)]"
                  : "soft-button cursor-pointer border-transparent bg-transparent text-muted shadow-none hover:border-white/80 hover:bg-white/88 hover:text-ink",
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "rules" ? <RulesTab /> : <PlayersTab />}
    </div>
  );
}
