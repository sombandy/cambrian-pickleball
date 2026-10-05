"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

export type TournamentSection = {
  label: string;
  href: string;
};

function isActive(pathname: string | null, section: TournamentSection) {
  if (!pathname) return false;
  return pathname === section.href || pathname.startsWith(`${section.href}/`);
}

export function TournamentSubnav({ sections }: { sections: TournamentSection[] }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Tournament sections" className="-mx-1 overflow-x-auto px-1 pb-1">
      <div className="inline-flex min-w-max rounded-[22px] border border-white/80 bg-white/82 p-1.5 shadow-[0_20px_34px_-30px_rgba(30,41,59,0.32)] backdrop-blur-xl">
        {sections.map((section) => {
          const active = isActive(pathname, section);

          return (
            <Link
              key={section.href}
              href={section.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "rounded-2xl px-4 py-2 text-sm font-semibold whitespace-nowrap transition",
                active
                  ? "primary-button shadow-[0_14px_24px_-18px_rgba(140,169,43,0.52)]"
                  : "soft-button border-transparent bg-transparent text-muted shadow-none hover:border-white/80 hover:bg-white/88 hover:text-ink",
              )}
            >
              {section.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
