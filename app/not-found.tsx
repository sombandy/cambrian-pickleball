import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex flex-1 items-center justify-center py-10">
      <section className="surface-card soft-grid max-w-2xl rounded-[2.3rem] p-8 text-center md:p-12">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-court">Not found</p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-ink">
          That thread is not on the board anymore.
        </h1>
        <p className="mt-4 text-base leading-7 text-muted">
          The post may have been removed, or the link may be stale. Head back to the community feed to keep browsing.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-full bg-court px-5 py-3 text-sm font-semibold text-white transition hover:brightness-105"
        >
          Back to the feed
        </Link>
      </section>
    </main>
  );
}
