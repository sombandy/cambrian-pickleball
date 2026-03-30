const focusAreas = ["Community play", "Tournament updates", "More details soon"];

export default function HomePage() {
  return (
    <main className="flex flex-1 items-center pb-12 pt-3">
      <section className="surface-card relative isolate w-full overflow-hidden rounded-[36px] px-6 py-10 sm:px-10 sm:py-14">
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 bg-[radial-gradient(circle_at_top_right,rgba(53,109,255,0.2),transparent_52%),radial-gradient(circle_at_bottom_right,rgba(13,148,136,0.12),transparent_44%)] md:block" />

        <div className="relative max-w-3xl">
          <span className="inline-flex rounded-full border border-court/15 bg-court-soft px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-court">
            Welcome
          </span>
          <h1 className="mt-5 font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl md:text-6xl">
            Cambrian Community Pickleball is getting its new home.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-muted sm:text-[1.2rem]">
            We&apos;re building a simple place for local play, tournament updates, and
            community news. Full details will be here soon.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            {focusAreas.map((item) => (
              <span
                key={item}
                className="rounded-full border border-white/80 bg-white/82 px-4 py-2 text-sm font-medium text-ink shadow-[0_16px_24px_-22px_rgba(30,41,59,0.36)]"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
