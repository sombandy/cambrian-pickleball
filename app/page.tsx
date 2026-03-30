const focusAreas = ["Community play", "Tournament updates", "More details soon"];

export default function HomePage() {
  return (
    <main className="flex flex-1 items-start pb-8 pt-1 sm:items-center sm:pb-12 sm:pt-3">
      <section className="surface-card relative isolate w-full overflow-hidden rounded-[32px] px-5 py-8 sm:rounded-[36px] sm:px-10 sm:py-14">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-[radial-gradient(circle_at_top_left,rgba(140,169,43,0.12),transparent_68%),radial-gradient(circle_at_top_right,rgba(184,198,93,0.12),transparent_72%)] md:hidden" />
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 bg-[radial-gradient(circle_at_top_right,rgba(140,169,43,0.18),transparent_52%),radial-gradient(circle_at_bottom_right,rgba(184,198,93,0.14),transparent_44%)] md:block" />

        <div className="relative max-w-3xl">
          <span className="inline-flex rounded-full border border-court/15 bg-court-soft px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-court sm:text-xs">
            Welcome
          </span>
          <h1 className="mt-4 max-w-[11.5ch] font-display text-[2.55rem] leading-[0.95] font-semibold tracking-tight text-ink sm:mt-5 sm:max-w-none sm:text-5xl sm:leading-[0.96] md:text-6xl">
            Cambrian Community Pickleball is getting its new home.
          </h1>
          <p className="mt-4 max-w-[30ch] text-[1.02rem] leading-7 text-muted sm:mt-5 sm:max-w-2xl sm:text-[1.2rem] sm:leading-8">
            We&apos;re building a simple place for local play, tournament updates, and
            community news. Full details will be here soon.
          </p>

          <div className="mt-6 flex flex-col items-start gap-2.5 sm:mt-8 sm:flex-row sm:flex-wrap sm:gap-3">
            {focusAreas.map((item) => (
              <span
                key={item}
                className="px-0 py-1 text-[0.9rem] font-medium leading-5 text-ink/88 sm:text-sm"
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
