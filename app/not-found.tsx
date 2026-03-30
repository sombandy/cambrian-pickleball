import Link from "next/link";

import { TOURNAMENT_FEEDBACK_PATH } from "@/lib/constants";

export default function NotFound() {
  return (
    <main className="flex flex-1 items-center justify-center py-10">
      <section className="surface-card max-w-2xl rounded-[2.3rem] p-8 text-center md:p-12">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-court">Not found</p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-ink">
          That page is not available.
        </h1>
        <p className="mt-4 text-base leading-7 text-muted">
          The page may have moved, or the link may be stale. Head home or open the
          feedback board to keep browsing.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/" className="primary-button rounded-full px-5 py-3 text-sm font-semibold">
            Back home
          </Link>
          <Link
            href={TOURNAMENT_FEEDBACK_PATH}
            className="soft-button rounded-full px-5 py-3 text-sm font-semibold"
          >
            Tournament feedback
          </Link>
        </div>
      </section>
    </main>
  );
}
