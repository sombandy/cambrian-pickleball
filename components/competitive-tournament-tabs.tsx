"use client";

import { useEffect, useState } from "react";

const SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTrs0XwNUq7Iy9MqOs48egECDl14IyXFhiYNa5cBqHSkxUbirRO2udwNrQ3juMubRiifEQM6FnNOkQF/pub?gid=2054120497&single=true&output=csv";

type RegistrationPair = {
  name: string;
  partner: string;
};

type Registrations = {
  pairs: RegistrationPair[];
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

  const nameColumn = columnIndex("Your Name?");
  const partnerColumn = columnIndex(
    "If registering as a Pair, Who is your partner?",
  );

  if (nameColumn < 0 || partnerColumn < 0) {
    throw new Error("Sheet column names do not match");
  }

  const registrations = rows
    .slice(1)
    .map((row) => ({
      name: (row[nameColumn] ?? "").trim(),
      partner: (row[partnerColumn] ?? "").trim(),
    }))
    .filter((registration) => registration.name !== "");

  const normalize = (name: string) => name.toLowerCase().replace(/\s+/g, " ").trim();

  // Both partners may submit the form; keep one row per unordered pair.
  const seenPairs = new Set<string>();
  const pairs = registrations
    .filter((registration) => registration.partner !== "")
    .filter((registration) => {
      const key = [registration.name, registration.partner]
        .map(normalize)
        .sort()
        .join("|");
      if (seenPairs.has(key)) {
        return false;
      }
      seenPairs.add(key);
      return true;
    });

  // A player whose stag row predates finding a partner shouldn't stay listed.
  const pairedNames = new Set(
    pairs.flatMap((pair) => [normalize(pair.name), normalize(pair.partner)]),
  );
  const seenIndividuals = new Set<string>();
  const individuals = registrations
    .filter((registration) => registration.partner === "")
    .map((registration) => registration.name)
    .filter((name) => {
      const key = normalize(name);
      if (pairedNames.has(key) || seenIndividuals.has(key)) {
        return false;
      }
      seenIndividuals.add(key);
      return true;
    });

  return { pairs, individuals };
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

export function CompetitiveTournamentTabs() {
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
          <InfoTile badge="Date" title="September 19, 2026">
            The tournament will be held on Saturday, September 19, 2026.
          </InfoTile>
        </div>
      </SectionCard>

      <PlayersSection />

      <SectionCard title="Rules & Guidance">
        <p>
          Unlike our previous community tournaments, this event does not involve
          organizers creating teams or assigning partners. Since this is a
          doubles tournament, participants are free to choose their own partner
          and register together as a doubles pair.
        </p>

        <SubHeading>Choose Your Own Partner</SubHeading>
        <p>Players choose their own partner and register as a doubles pair.</p>

        <Highlight>
          <strong className="font-semibold">Looking for a Partner?</strong>
          <br />
          Players who have not yet found a partner are welcome to register as
          individuals. A list of players registered individually will be
          published to help facilitate partner matching.
        </Highlight>

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

        <Highlight>
          <strong className="font-semibold">Cambrian DUPR Ratings</strong>
          <br />
          All matches played in this tournament will contribute to the
          players&apos; Cambrian DUPR ratings.
        </Highlight>
      </SectionCard>

      <SectionCard title="Registration Fees">
        <p>
          The registration fee is{" "}
          <strong className="font-semibold text-ink">$40 per player</strong>.
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
          key={`${pair.name}-${pair.partner}-${index}`}
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
  badge = "Doubles Open",
}: {
  title: string;
  pairs: RegistrationPair[] | null;
  loading: boolean;
  badge?: string;
}) {
  return (
    <div className="rounded-[24px] border border-outline/80 bg-white/80 p-5 sm:p-6">
      <Badge>{badge}</Badge>
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

function PlayersSection() {
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

  return (
    <section className="surface-card rounded-[30px] px-5 py-7 sm:px-8 sm:py-8">
      <h2 className="font-display text-2xl leading-tight font-semibold tracking-tight text-ink sm:text-[1.7rem]">
        Who&apos;s Playing
      </h2>

      <div className="mt-5">
        <DivisionCard
          title="Registered Pairs"
          pairs={ready ? state.pairs : null}
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
              {state.individuals.map((name, index) => (
                <li
                  key={`${name}-${index}`}
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
