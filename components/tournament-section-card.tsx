import { cn } from "@/lib/utils";

export function TournamentSectionCard({
  title,
  eyebrow,
  className,
  children,
}: {
  title: string;
  eyebrow?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn("surface-card rounded-[30px] px-5 py-7 sm:px-8 sm:py-8", className)}>
      {eyebrow ? (
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-court">
          {eyebrow}
        </p>
      ) : null}
      <h2
        className={cn(
          "font-display text-2xl leading-tight font-semibold tracking-tight text-ink sm:text-[1.7rem]",
          eyebrow && "mt-2",
        )}
      >
        {title}
      </h2>
      <div className="mt-4 space-y-4 text-[0.98rem] leading-7 text-muted">{children}</div>
    </section>
  );
}
