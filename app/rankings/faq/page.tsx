import type { Metadata } from "next";
import Link from "next/link";
import { faqItems } from "@/lib/faq";

export const metadata: Metadata = {
  title: "FAQ - Cambrian Pickleball Rankings",
  description: "Frequently asked questions about how the Cambrian rankings work",
};

export default function FaqPage() {
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
          Frequently Asked Questions
        </h1>
        <p className="mt-2 text-[0.95rem] leading-snug text-muted">
          Everything you need to know about how the Cambrian rankings work.
        </p>
      </header>

      <div className="surface-card rounded-[30px] overflow-hidden divide-y divide-outline/60">
        {faqItems.map((item, idx) => (
          <details key={idx} className="group">
            <summary className="flex items-center justify-between gap-4 px-6 py-5 cursor-pointer list-none [&::-webkit-details-marker]:hidden select-none hover:bg-court-soft/20 transition-colors">
              <h2 className="font-display text-[0.95rem] font-semibold tracking-tight text-ink leading-snug pr-2">
                {item.question}
              </h2>
              <svg
                className="h-5 w-5 shrink-0 text-muted transition-transform duration-200 group-open:rotate-180"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                />
              </svg>
            </summary>
            <div className="px-6 pb-5 -mt-1">
              <div className="text-sm leading-relaxed text-muted whitespace-pre-line">
                {item.answer}
              </div>
            </div>
          </details>
        ))}
      </div>
    </main>
  );
}
