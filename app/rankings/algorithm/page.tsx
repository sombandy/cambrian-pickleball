import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Algorithm - Cambrian Pickleball Rankings",
  description:
    "Technical details about the Glicko-2 rating system used for Cambrian rankings",
};

/* ---------- reusable section ---------- */

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="surface-card rounded-[30px] p-6 sm:p-8">
      <h2 className="font-display text-lg font-semibold tracking-tight text-ink mb-4">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Mono({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded-lg bg-court-soft/60 border border-outline/60 px-2 py-0.5 text-[0.82rem] font-mono text-ink">
      {children}
    </code>
  );
}

export default function AlgorithmPage() {
  return (
    <main className="pb-16 space-y-6">
      {/* Back link */}
      <Link
        href="/rankings"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-court hover:text-berry transition-colors"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 19.5L8.25 12l7.5-7.5"
          />
        </svg>
        Back to Rankings
      </Link>

      <header>
        <h1 className="font-display text-[2rem] leading-[1.08] font-semibold tracking-tight text-ink sm:text-[2.6rem]">
          Algorithm Details
        </h1>
        <p className="mt-2 text-[0.95rem] leading-snug text-muted">
          Technical overview of the Glicko-2 system powering the Cambrian
          rankings.
        </p>
      </header>

      {/* Overview */}
      <Section title="Overview">
        <p className="text-sm leading-relaxed text-muted">
          The Cambrian ranking system is built on{" "}
          <strong className="text-ink">Glicko-2</strong>, a well-established
          Bayesian rating system created by Mark Glickman. Every player carries
          three internal values: a <em>rating</em> (skill estimate), a{" "}
          <em>rating deviation</em> (uncertainty), and a <em>volatility</em>{" "}
          (tendency to fluctuate). Tournaments are processed in chronological
          order. After each tournament the system updates every participant
          using the match results, then maps the internal Glicko-2 rating onto
          a DUPR-like 2.0&ndash;8.0 scale so the numbers feel familiar.
        </p>
      </Section>

      {/* System Constants */}
      <Section title="System Constants">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "TAU (τ)", value: "0.5", desc: "Volatility constraint" },
            { label: "Default Rating", value: "1500", desc: "Starting μ" },
            { label: "Default RD", value: "350", desc: "Starting φ" },
            { label: "Scale Factor", value: "173.7178", desc: "Glicko-2 → Glicko" },
          ].map((c) => (
            <div
              key={c.label}
              className="rounded-2xl border border-outline/70 bg-sun/40 px-4 py-3 text-center"
            >
              <p className="text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-muted mb-1">
                {c.label}
              </p>
              <p className="font-display text-xl font-bold text-ink">
                {c.value}
              </p>
              <p className="text-[0.6rem] text-muted mt-0.5">{c.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Hybrid Outcome Scoring */}
      <Section title="Hybrid Outcome Scoring">
        <p className="text-sm leading-relaxed text-muted mb-4">
          Each match produces a single outcome score between 0 and 1 that blends
          the binary win/loss result with how close the game was:
        </p>
        <div className="rounded-2xl bg-court-soft/40 border border-outline/60 px-5 py-4 font-mono text-sm text-ink leading-loose">
          <p>
            outcome = 0.65 &times; win + 0.35 &times; (scoreFor &divide;
            (scoreFor + scoreAgainst))
          </p>
        </div>
        <ul className="mt-4 space-y-2 text-sm text-muted">
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-court shrink-0" />
            <span>
              A <strong className="text-ink">21&ndash;10 win</strong> scores
              about <Mono>0.89</Mono> (0.65 + 0.35 &times; 0.677)
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-court shrink-0" />
            <span>
              A <strong className="text-ink">19&ndash;21 loss</strong> scores
              about <Mono>0.17</Mono> (0 + 0.35 &times; 0.475)
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-court shrink-0" />
            <span>
              A <strong className="text-ink">6&ndash;21 blowout loss</strong>{" "}
              scores about <Mono>0.08</Mono>
            </span>
          </li>
        </ul>
      </Section>

      {/* Doubles Handling */}
      <Section title="Doubles Averaging">
        <p className="text-sm leading-relaxed text-muted">
          In doubles, the opponent team is treated as a single entity whose
          rating is the <strong className="text-ink">average</strong> of the two
          opponents&rsquo; individual ratings. Your partner&rsquo;s rating does
          not enter the formula &mdash; the expected result is computed from your
          own rating versus the average opponent rating. This is a deliberate
          simplification: a weaker partner usually leads to a smaller margin,
          which the outcome score picks up, but there is no explicit &ldquo;carry
          bonus.&rdquo;
        </p>
      </Section>

      {/* Confidence Calibration */}
      <Section title="Confidence Calibration (DUPR Scale)">
        <p className="text-sm leading-relaxed text-muted mb-3">
          Internal Glicko-2 ratings are mapped onto a 2.0&ndash;8.0 DUPR-like
          display scale using <strong className="text-ink">linear
          interpolation</strong> anchored to two reference players:
        </p>
        <div className="rounded-2xl bg-court-soft/40 border border-outline/60 px-5 py-4 space-y-2 font-mono text-sm text-ink">
          <p>topAnchor = highest-rated Established player</p>
          <p>bottomAnchor = lowest-rated Established player</p>
          <p>
            displayDupr = bottomDupr + (glickoRating &minus; bottomGlicko)
            &times; (topDupr &minus; bottomDupr) &divide; (topGlicko &minus;
            bottomGlicko)
          </p>
        </div>
        <p className="text-sm leading-relaxed text-muted mt-3">
          The anchors are recalculated after every tournament, so everyone&rsquo;s
          displayed number shifts slightly even if their underlying Glicko-2
          rating is unchanged.
        </p>
      </Section>

      {/* Confidence & Reliability */}
      <Section title="Confidence & Reliability">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-ink mb-1">
              Confidence Score
            </h3>
            <p className="text-sm leading-relaxed text-muted">
              The primary ranking metric. It is the displayed DUPR adjusted
              downward by the player&rsquo;s remaining uncertainty:
            </p>
            <div className="mt-2 rounded-2xl bg-court-soft/40 border border-outline/60 px-5 py-3 font-mono text-sm text-ink">
              confidence = displayDupr &minus; (glickoRD &divide; scaleFactor)
              &times; penaltyFactor
            </div>
            <p className="text-sm text-muted mt-2">
              Players with few matches have a high RD, so their confidence is
              pulled further from their DUPR. As they play more, RD shrinks and
              confidence converges with DUPR.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-ink mb-1">
              Reliability %
            </h3>
            <p className="text-sm leading-relaxed text-muted">
              How much evidence the system has about a player, expressed as a
              percentage. It combines tournament count and match count with caps
              per tier:
            </p>
            <div className="mt-2 rounded-2xl bg-court-soft/40 border border-outline/60 px-5 py-3 font-mono text-sm text-ink leading-loose">
              <p>1 tournament &rarr; max 30%</p>
              <p>2 tournaments &rarr; max 55%</p>
              <p>3 tournaments &rarr; max 75%</p>
              <p>4+ tournaments &rarr; up to 100%</p>
            </div>
          </div>
        </div>
      </Section>

      {/* Status Tiers */}
      <Section title="Status Tiers">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-2xl border border-amber-200 bg-amber-50/60 px-4 py-3 text-center">
            <p className="font-display text-base font-bold text-amber-700">
              Provisional
            </p>
            <p className="text-xs text-muted mt-1">
              Reliability &lt; 40%
            </p>
            <p className="text-xs text-muted">
              Rating still volatile
            </p>
          </div>
          <div className="rounded-2xl border border-blue-200 bg-blue-50/60 px-4 py-3 text-center">
            <p className="font-display text-base font-bold text-blue-700">
              Developing
            </p>
            <p className="text-xs text-muted mt-1">
              Reliability 40%&ndash;70%
            </p>
            <p className="text-xs text-muted">
              Getting more stable
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 px-4 py-3 text-center">
            <p className="font-display text-base font-bold text-emerald-700">
              Established
            </p>
            <p className="text-xs text-muted mt-1">
              Reliability &gt; 70%
            </p>
            <p className="text-xs text-muted">
              Used as calibration anchors
            </p>
          </div>
        </div>
      </Section>

      {/* Inactive Player Handling */}
      <Section title="Inactive Player Handling">
        <p className="text-sm leading-relaxed text-muted">
          Players who sit out a tournament don&rsquo;t lose rating points, but
          their <strong className="text-ink">rating deviation (RD)</strong>{" "}
          increases slightly via the Glicko-2 volatility mechanism. This
          represents growing uncertainty &mdash; the system becomes less sure of
          a player&rsquo;s current level when they haven&rsquo;t played recently.
          Because rankings use the Confidence Score (which penalizes higher RD),
          inactive players drift downward in the rankings even though their
          underlying skill estimate hasn&rsquo;t changed. Playing again
          immediately reduces RD and restores confidence.
        </p>
      </Section>
    </main>
  );
}
