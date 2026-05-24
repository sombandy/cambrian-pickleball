import type { Metadata } from "next";
import { Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "The Cambrian Pickleball Rankings",
  description:
    "How the Cambrian Pickleball rankings are calculated — two years, seven tournaments, forty players, one honest leaderboard.",
};

type Tournament = { name: string; date: string };

const tournaments: Tournament[] = [
  { name: "4th Cambrian Tournament", date: "May 7, 2024" },
  { name: "5th Cambrian Tournament", date: "September 10, 2024" },
  { name: "6th Cambrian Tournament", date: "March 10, 2025" },
  { name: "7th Cambrian Tournament", date: "May 10, 2025" },
  { name: "8th Cambrian Tournament", date: "August 17, 2025" },
  { name: "9th Cambrian Tournament", date: "November 8, 2025" },
  { name: "10th Cambrian Tournament", date: "March 23, 2026" },
];

type ReliabilityTier = {
  emoji: string;
  label: string;
  range: string;
  meaning: string;
};

const reliabilityTiers: ReliabilityTier[] = [
  {
    emoji: "🟢",
    label: "Established",
    range: "≥ 70%",
    meaning: "Strong data backing — trust this rating.",
  },
  {
    emoji: "🟡",
    label: "Developing",
    range: "40 – 69%",
    meaning: "Rating is still settling and will sharpen with more tournaments.",
  },
  {
    emoji: "🔴",
    label: "Provisional",
    range: "< 40%",
    meaning: "Too little data — this is a starting estimate.",
  },
];

type FairnessPrinciple = { title: string; body: string };

const fairnessPrinciples: FairnessPrinciple[] = [
  {
    title: "No bias.",
    body: "Every player goes through the exact same math. There are no manual adjustments, no overrides, no exceptions. The algorithm doesn’t know who anyone is.",
  },
  {
    title: "No baseline ratings.",
    body: "Nobody starts higher or lower than anyone else. Everyone begins from the same starting point and earns their position from match results.",
  },
  {
    title: "All data, all the time.",
    body: "Every match from every tournament counts. We didn’t drop “bad data” or “outlier matches.” Real tournaments include weird results — and that’s part of the signal.",
  },
  {
    title: "Open and verifiable.",
    body: "The cleaned match data and source code will be shared with the organizers. If anyone wants to validate the calculations, they can. We’re not hiding anything — and there are absolutely other reasonable ways to run a ranking algorithm. We picked this one because Glicko-2 has strong academic backing, is used by World Pickleball Rankings, and handles small-league situations gracefully. But this isn’t the only valid approach, and we’re open to feedback as the system evolves.",
  },
  {
    title: "Chronological processing.",
    body: "Tournaments are processed in the order they happened, not in tournament-number order.",
  },
];

type Faq = { question: string; answer: string };

const faqs: Faq[] = [
  {
    question: "Will the ranking decide tournament seeding from now on?",
    answer:
      "That’s up to the organizers, but the goal is yes. Having objective seeding should lead to more balanced brackets and more competitive matches across the board.",
  },
  {
    question: "What if I think a score is wrong?",
    answer:
      "Reach out to the organizers. They have the original scoresheets and can verify or correct any match. The system is happy to recompute with corrected data.",
  },
  {
    question: "What about the missing playoff matches?",
    answer:
      "If anyone remembers those scores, please share them with the organizers. We’ll re-run the rankings with the additional data included. Until then, the rankings reflect what we have. (And honestly, by the time AVAC was closing, even the players probably weren’t sure of the exact scores 😄.)",
  },
  {
    question: "Why does Player X rank higher than Player Y when Y has a better win-loss record?",
    answer:
      "The algorithm cares about who you played, not just how many you beat. A 60% win rate against strong opponents is more impressive than 75% against weaker ones. Also, recency matters — recent results carry more weight than older ones.",
  },
  {
    question: "I only played one tournament. Why is my rating so volatile?",
    answer:
      "Because the system genuinely doesn’t know your level yet. Your Reliability score will be low (“Provisional”) until you play more tournaments. As you accumulate matches, the system gets more confident and your rating stabilizes.",
  },
  {
    question: "Can I be removed from the rankings?",
    answer:
      "If you’ve played in Cambrian tournaments, you’re in the rankings. If you’d prefer your name not appear on the public leaderboard, talk to the organizers — there are options.",
  },
  {
    question: "How often does my rating update?",
    answer: "After each tournament. The full computation re-runs every time new data is added.",
  },
  {
    question: "Will singles matches count?",
    answer:
      "Not currently. Cambrian tournaments are doubles, so the rating is doubles-only. If singles tournaments become a regular thing, we’d build a separate singles rating.",
  },
  {
    question: "What if there’s a tie in Confidence Rating?",
    answer: "Ties are broken by Reliability percentage (more data wins), then by raw DUPR.",
  },
  {
    question: "Why did the algorithm rank a casual-looking player above someone who hits the ball harder?",
    answer:
      "The algorithm only sees scores. Style, athleticism, court coverage, and shot quality don’t register if they don’t show up on the scoreboard. Sometimes a steady player who minimizes errors wins more than a flashy player who takes risks.",
  },
  {
    question: "How can I improve my ranking?",
    answer:
      "Win matches. Beat stronger players. Win by larger margins. Play in more tournaments. Stay consistent. That’s it — there’s no other formula.",
  },
  {
    question: "Is this system perfect?",
    answer:
      "No. It’s the best honest attempt we could make with the data we have. Every algorithm has trade-offs. If the system has a clear flaw that affects rankings unfairly, we want to hear about it — that’s how it gets better.",
  },
];

export default function RankingsPage() {
  return (
    <main className="pb-16">
      <article className="max-w-3xl">
        {/* Title block */}
        <header>
          <h1 className="font-display text-[2.4rem] leading-[1.02] font-semibold tracking-tight text-ink sm:text-[3rem] md:text-[3.4rem]">
            The Cambrian Pickleball Rankings
          </h1>
          <p className="mt-3 font-display text-xl leading-snug font-medium text-berry sm:text-2xl">
            How the Numbers Tell the Story
          </p>
          <p className="mt-5 text-[1.05rem] leading-7 text-muted sm:text-[1.15rem] sm:leading-8">
            Two years. Seven tournaments. Forty players. One honest leaderboard.
          </p>

          <div className="mt-6 flex items-center gap-3">
            <div
              aria-hidden
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#f4f8e3_0%,#e8f0cb_100%)] text-[0.78rem] font-semibold text-court shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]"
            >
              MS
            </div>
            <div className="leading-tight">
              <p className="text-[0.95rem] font-medium text-ink">Muthu Sada</p>
              <p className="text-[0.78rem] uppercase tracking-[0.16em] text-muted">Author</p>
            </div>
          </div>
        </header>

        {/* Coming-soon inline notice */}
        <aside className="mt-8 flex gap-4 rounded-2xl border-l-4 border-court bg-court-soft/55 px-5 py-4">
          <Sparkles className="mt-1 h-5 w-5 flex-none text-court" />
          <div>
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-court">
              Live leaderboard — coming soon
            </p>
            <p className="mt-1.5 text-[0.98rem] leading-7 text-ink/90 sm:text-[1rem]">
              The full interactive leaderboard is on its way. You&apos;ll soon be able to view
              every player&apos;s DUPR, Confidence Rating, match history, and rating
              progression here — updated automatically after every tournament.
            </p>
          </div>
        </aside>

        {/* Body */}
        <div className="prose-blog mt-10">
          <p>
            What started as a group of friends getting together to play pickleball has grown
            into something genuinely special. Over the last two years, around 40 players have
            come together across seven tournaments, organized by a small group of volunteers
            who keep showing up — booking courts, building brackets, recording scores,
            settling disputes, and somehow still finding time to play.
          </p>
          <p>
            If you&apos;ve ever organized one of these, you know how much invisible work it
            takes. Cambrian&apos;s organizers have done it again and again, without
            compensation, without sponsorship, purely because they love the game and the
            community around it.
          </p>
          <p className="lead">That&apos;s the foundation everything else here is built on.</p>

          <h2>Why we built a ranking system</h2>
          <p>
            For most of these two years, we&apos;ve been doing what every casual league does:
            showing up, playing, having fun, going home. Brackets were seeded by intuition.
            Teams were balanced by feel. Everyone has an opinion about who the strongest
            player is, and everyone is at least partly right.
          </p>
          <p>
            But as the league grew, a question kept coming up:{" "}
            <em>could we seed tournaments more objectively?</em>
          </p>
          <p>That&apos;s where this project began.</p>

          <aside className="callout">
            <p className="callout-eyebrow">★ Special mention</p>
            <p>
              A special mention is owed to{" "}
              <strong className="font-semibold">Abhinay</strong>, who pushed hard to make this
              happen. He recognized that even though Cambrian is a community-run league,
              introducing a real ranking system would bring some welcome objectivity to future
              tournaments — more competitive matchups, more balanced brackets, more meaningful
              results. He kept asking the right questions, kept gathering data, and kept the
              project moving forward. Without his persistence, you wouldn&apos;t be reading
              this.
            </p>
          </aside>

          <h2>The tournaments</h2>
          <p>
            The ranking is built from match data across the following Cambrian tournaments, in
            chronological order:
          </p>

          <div className="not-prose my-6 overflow-hidden rounded-xl border border-outline/80 bg-white/70">
            <table className="w-full border-collapse text-left text-sm sm:text-[0.98rem]">
              <thead>
                <tr className="bg-court-soft/55 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-court">
                  <th className="px-4 py-3 sm:px-5">Tournament</th>
                  <th className="px-4 py-3 text-right sm:px-5">Date</th>
                </tr>
              </thead>
              <tbody>
                {tournaments.map((t, idx) => (
                  <tr
                    key={t.name}
                    className={
                      idx < tournaments.length - 1
                        ? "border-b border-outline/60 text-ink"
                        : "text-ink"
                    }
                  >
                    <td className="px-4 py-3 font-medium sm:px-5">{t.name}</td>
                    <td className="px-4 py-3 text-right text-muted sm:px-5">{t.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p>
            <em>A small note on completeness:</em> some playoff matches may be missing from a
            few tournaments — for example, one playoff match in the 8th tournament wasn&apos;t
            recorded. The organizers were busy trying to wrap up the remaining matches at AVAC
            before closing time 😄. If you remember the scores for any missing playoff
            matches, share them with the organizers — the rankings will update once that data
            is added.
          </p>

          <h2>How the data was collected</h2>
          <p>We won&apos;t pretend this was elegant.</p>
          <p>
            Two of the tournaments were recorded in Swish (a pickleball scoring app), and the
            rest were tracked in Google Sheets — sometimes in different formats, sometimes
            mid-tournament on a phone. Player names were inconsistent. Match orders were
            ambiguous. Tournament numbering didn&apos;t always match chronological order.
          </p>
          <p>
            We cleaned all of it up. Every match was reviewed, players were reconciled to
            canonical names, dates were verified, and the entire dataset was normalized into a
            single consistent format. The cleaned data is being made available to the
            organizers for cross-validation. If you played in any of these tournaments and
            want to verify your matches, the organizers have access to the source scoresheets
            — original and cleaned.
          </p>

          <blockquote>
            This is important: every score in this ranking can be traced back to an actual
            match that was actually played. There are no guesses, no estimates, no assumed
            values.
          </blockquote>

          <h2>How the rankings are calculated</h2>
          <p>
            The algorithm is <strong className="font-semibold">Glicko-2</strong> with a hybrid
            scoring approach.
          </p>
          <p>
            Glicko-2 is a well-established rating algorithm developed by Mark Glickman, a
            Harvard statistics professor. It&apos;s used widely in competitive games and
            sports — including World Pickleball Rankings, which uses the same Glicko-2
            foundation for their global pickleball ratings. The fact that the world&apos;s
            leading pickleball ranking system relies on Glicko-2 was a strong signal that we
            were on the right track.
          </p>
          <p>Let me explain how it works without the math.</p>

          <h3>The basic idea</h3>
          <p>
            Every player starts at the same rating with the same level of uncertainty. As they
            play matches, their rating moves based on three things:
          </p>
          <ul>
            <li>Whether they won or lost.</li>
            <li>The score margin — a 21-9 win counts more than a 21-19 win.</li>
            <li>The strength of their opponents.</li>
          </ul>
          <p>
            This third one matters more than people realize. Beating a top player gains you
            significantly more than beating a weaker player — the algorithm expects you to
            beat weaker opponents, so when you do, it doesn&apos;t tell us much. But when you
            beat someone strong, the algorithm takes notice.
          </p>

          <h3>The hybrid scoring formula</h3>
          <p>
            We use a <strong className="font-semibold">65/35 split</strong>: 65% of the match
            outcome is determined by who won, and 35% by the score margin. This means winning
            still matters most (a win is a win), but blowouts and close games are weighted
            differently. A close 21-19 win counts as a real win without being treated as a
            near-tie, and a 21-5 demolition reflects the dominance it represents.
          </p>

          <h3>How recency factors in</h3>
          <p>
            Tournaments are processed in chronological order. Recent matches naturally carry
            more weight in the math — your last tournament impacts your rating more than your
            tournament from two years ago. Skip tournaments and the system becomes less
            certain about you. Show up consistently, and your rating sharpens.
          </p>

          <h3>How rankings are sorted</h3>
          <p>
            This is the part that occasionally surprises people:{" "}
            <strong className="font-semibold">we don&apos;t sort by raw DUPR rating</strong>.
            We sort by <strong className="font-semibold">Confidence Rating</strong>.
          </p>
          <p>
            The Confidence Rating is your DUPR adjusted for how much data we have about you.
            A player who has played one tournament and won 8 of 9 matches might have a
            sky-high DUPR — but we don&apos;t actually know if that&apos;s their real level.
            Their Confidence Rating gets a larger penalty until they prove it across more
            tournaments.
          </p>
          <p>
            This prevents a one-tournament wonder from topping the rankings, while still
            giving them credit for what they&apos;ve done. As they keep playing, their
            Confidence Rating catches up to their DUPR.
          </p>

          <h3>Reliability tiers</h3>
          <p>
            Each player has a Reliability score reflecting how confident the system is in
            their rating:
          </p>
          <div className="not-prose my-5 grid gap-2">
            {reliabilityTiers.map((tier) => (
              <div
                key={tier.label}
                className="flex items-baseline gap-3 border-l-2 border-outline pl-4"
              >
                <span className="text-lg leading-none" aria-hidden>
                  {tier.emoji}
                </span>
                <p className="text-[0.98rem] leading-7 text-ink sm:text-[1rem]">
                  <strong className="font-semibold">{tier.label}</strong>{" "}
                  <span className="text-muted">({tier.range})</span> — {tier.meaning}
                </p>
              </div>
            ))}
          </div>
          <p>
            The first time a new player appears, they&apos;re Provisional. Three or four
            tournaments in, they&apos;re Established. The system is honest about what it knows
            and what it doesn&apos;t.
          </p>

          <h2>How this compares to DUPR and UTR</h2>
          <p>A few people have asked: is this DUPR?</p>
          <p>
            <strong className="font-semibold">No.</strong> DUPR is a global rating system
            calibrated on millions of matches across regions, with their own proprietary
            formula and adjustments. Players in our league might have a “real” DUPR rating
            that&apos;s calibrated against players worldwide.
          </p>
          <p>
            What we have is a <em>DUPR-style ranking system</em>, similar in spirit to DUPR
            (and to UTR in tennis), but calibrated only on Cambrian matches. We use the same
            kind of mathematical framework that World Pickleball Rankings and many other
            serious rating systems use, but we anchored our display ratings to feel right for
            our league — the top established player sits around 4.10 DUPR, with the rest of
            the pack flowing down from there.
          </p>
          <p>
            Think of it as a{" "}
            <strong className="font-semibold">Cambrian-internal ranking</strong>. It
            accurately reflects how you stack up against the players you actually play with.
            It doesn&apos;t claim to predict how you&apos;d do against players outside this
            group.
          </p>
          <p>
            If you want a globally-comparable rating, real DUPR is the gold standard. If you
            want to know who&apos;s been the most dominant player in Cambrian over the last
            two years, this is your answer.
          </p>

          <h2>An important disclaimer</h2>
          <p className="lead">This ranking is based purely on tournament performance.</p>
          <p>
            If your ranking feels lower than where you think you should be, please read this
            part carefully: <em>your true skill level may absolutely be higher</em> than what
            the data shows. You might be:
          </p>
          <ul>
            <li>
              A player who plays great in casual sessions but hasn&apos;t had a breakthrough
              tournament yet.
            </li>
            <li>
              Someone who&apos;s been paired with weaker partners and has been carrying them.
            </li>
            <li>A player going through a slump after years of dominance.</li>
            <li>
              Someone who plays a strategic, close-game style that doesn&apos;t show up as
              blowout wins.
            </li>
            <li>A player who just had bad luck with matchups.</li>
          </ul>
          <p>The algorithm doesn&apos;t see any of that. It only sees scores.</p>
          <p>
            Take this positively. The rankings are not a verdict on your ability —
            they&apos;re a snapshot of your tournament results to date. Show up, bring your
            best, and the system will reward you tournament after tournament. Several players
            in the current rankings climbed significantly between their first and most recent
            tournament. The rankings are designed to recognize that improvement.
          </p>
          <p className="lead">
            A bad tournament won&apos;t define you. A good tournament will move you up.
            Sustained good play will move you up a lot.
          </p>

          <h2>How we kept it fair</h2>
          <p>A few principles we held to:</p>
          <ul>
            {fairnessPrinciples.map((p) => (
              <li key={p.title}>
                <strong className="font-semibold">{p.title}</strong> {p.body}
              </li>
            ))}
          </ul>

          <h2>FAQ</h2>
          <div className="not-prose my-6 divide-y divide-outline/70 border-y border-outline/70">
            {faqs.map((faq) => (
              <details key={faq.question} className="group py-3.5">
                <summary className="flex cursor-pointer items-start justify-between gap-3 text-[1rem] font-medium text-ink marker:hidden sm:text-[1.04rem]">
                  <span>{faq.question}</span>
                  <span
                    aria-hidden
                    className="mt-1 inline-flex h-5 w-5 flex-none items-center justify-center rounded-full border border-court/30 text-court transition group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-2.5 text-[0.98rem] leading-7 text-ink/85 sm:text-[1.02rem]">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>

          <h2>A final thank-you</h2>
          <p>
            To the organizers who&apos;ve kept this going for two years — thank you. To
            Abhinay for pushing the ranking system into existence. To every player who&apos;s
            shown up, played their heart out, and shared scores with us. To the volunteers who
            track every match.
          </p>
          <p>
            This ranking belongs to all of you. It&apos;s a small piece of recognition for
            everything that&apos;s been built.
          </p>
          <p className="lead font-display text-berry">
            Now let&apos;s play some more pickleball.
          </p>
        </div>

        <hr className="my-10 border-outline/70" />

        <p className="text-[0.9rem] leading-6 text-muted">
          The Cambrian Pickleball Rankings update after every tournament. Source code and
          cleaned match data are available to organizers. Questions, corrections, and feedback
          are welcome.
        </p>
      </article>
    </main>
  );
}
