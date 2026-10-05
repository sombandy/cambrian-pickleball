export interface FaqItem {
  question: string;
  answer: string;
}

export const faqItems: FaqItem[] = [
  {
    question: "How are the ratings calculated?",
    answer:
      "We use Glicko-2, a well-established rating system from the same family that powers chess ratings, online gaming ladders, and pickleball's own DUPR (which is Elo-based). Tournaments are processed in order, and after each one every player's rating is updated based on who they played, the result, and the point margin. Each player also carries an uncertainty value that shrinks as you play more — so the system knows the difference between \"rated 4.0 with lots of evidence\" and \"rated 4.0 from a handful of games.\"",
  },
  {
    question: "How is this different from real DUPR?",
    answer:
      "Real DUPR is computed by DUPR's own algorithm from matches logged on their platform. Our rating is an internal Glicko-2 rating computed only from Cambrian group matches, then mapped onto a DUPR-like 2.0–8.0 scale so the numbers feel familiar. The two won't necessarily agree: different data, different algorithm. Think of ours as \"your level within this group\" rather than an official rating.",
  },
  {
    question: "How are the rankings sorted?",
    answer:
      "This is the part that occasionally surprises people: we don't sort by raw DUPR rating. We sort by Confidence Rating.\n\nThe Confidence Rating is your DUPR adjusted for how much data we have about you. A player who has played one tournament and won 8 of 9 matches might have a sky-high DUPR — but we don't actually know if that's their real level. Their Confidence Rating gets a larger penalty until they prove it across more tournaments.\n\nThis prevents a one-tournament wonder from topping the rankings, while still giving them credit for what they've done. As they keep playing, their Confidence Rating catches up to their DUPR.",
  },
  {
    question: "How does recency factor in?",
    answer:
      "Tournaments are processed in chronological order. Recent matches naturally carry more weight in the math — your last tournament impacts your rating more than your tournament from two years ago. Skip tournaments and the system becomes less certain about you. Show up consistently, and your rating sharpens.",
  },
  {
    question: "Why did my rating change if I didn't play?",
    answer:
      "Three reasons. First, sitting out makes your rating slightly less certain — and since rankings use the Confidence Score, more uncertainty means a lower number. Second, the display scale is recalibrated after every tournament (it's anchored to the current top and bottom established players), so everyone's number shifts slightly. Third, ranks are relative — players around you moving up or down changes your position. Sitting out never changes your underlying skill estimate; it just makes the system less sure of it.",
  },
  {
    question: "What does the Reliability % mean?",
    answer:
      "How much evidence the system has about you. It grows with tournaments and matches played, and is capped at 30% with one tournament, 55% with two, and 75% with three — only at 4+ tournaments can it reach 100%.",
  },
  {
    question: "What do Provisional / Developing / Established mean?",
    answer:
      "Reliability tiers: Provisional below 40%, Developing 40–70%, Established above 70%.",
  },
  {
    question: "Does losing 19-21 hurt as much as losing 6-21?",
    answer:
      "No. Your match result counts 65% win/loss and 35% point share, so a 19-21 loss scores about 0.16 while a 6-21 blowout scores about 0.08. Keeping it close genuinely protects your rating.",
  },
  {
    question: "Do my opponents matter, or just whether I win?",
    answer:
      "Opponent strength matters a lot. The system computes an expected result from the rating gap — beating a stronger pair earns far more than beating a weaker one, and losing to a much stronger pair costs very little because the loss was expected.",
  },
  {
    question: "Does my partner's rating affect my rating change, or only the opponents'?",
    answer:
      "Only the opponents'. Your expected result is computed from your own rating vs. the average of the two opposing players — your partner's rating doesn't enter the formula. So a #1 player beating #3/#4 by the same score gets the same change whether partnered with #2 or #9. The partner matters indirectly (a weaker partner usually means a smaller margin, which the margin component picks up), but there's no extra credit for \"carrying\" — a known simplification of our doubles model.",
  },
  {
    question:
      "If a top team narrowly beats a much weaker team, are they penalized? Does point differential matter?",
    answer:
      "Yes, this is built in. Every match has a \"par\": the expected score computed from the rating gap. Your actual result (65% win + 35% margin) is compared against it — a 21-19 win counts ~0.83, a 21-10 win ~0.89. Heavy favorites winning narrowly perform barely above par and gain almost nothing; in extreme mismatches they can even lose points despite winning. The flip side: underdogs who keep it close beat their par and can gain rating from a loss.",
  },
  {
    question: "Why does one bad (or great) tournament only move me a few spots?",
    answer:
      "Established players have low uncertainty, so updates are damped — the system weighs your entire history, not one weekend. Close losses are softened by the margin component, and expected losses to strong teams cost little. A 2-5 weekend will drop you, but it won't erase a year of evidence.",
  },
  {
    question: "How do new players get ranked?",
    answer:
      "Everyone starts at the same baseline rating with maximum uncertainty. Early tournaments move new players quickly toward their true level, and they're flagged Provisional until they build reliability. A provisional player's displayed DUPR can even exceed the top anchor if their results justify it.",
  },
  {
    question: "I only played one tournament. Why is my rating so volatile?",
    answer:
      "Because the system genuinely doesn't know your level yet. Your Reliability score will be low (\"Provisional\") until you play more tournaments. As you accumulate matches, the system gets more confident and your rating stabilizes.",
  },
];
