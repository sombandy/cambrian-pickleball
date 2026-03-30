import Link from "next/link";

import type { SortOption } from "@/lib/types";
import { cn } from "@/lib/utils";

const SIMPLE_SORTS: Array<{ value: SortOption; label: string }> = [
  { value: "newest", label: "Newest" },
  { value: "upvoted", label: "Top" },
];

function buildQuery(basePath: string, sort: SortOption, limit: number) {
  const params = new URLSearchParams();
  params.set("sort", sort);
  params.set("page", "1");
  params.set("limit", limit.toString());
  return `${basePath}?${params.toString()}`;
}

export function SortTabs({
  sort,
  limit,
  basePath = "/",
}: {
  sort: SortOption;
  limit: number;
  basePath?: string;
}) {
  return (
    <div className="inline-flex rounded-[22px] border border-white/80 bg-white/82 p-1.5 shadow-[0_20px_34px_-30px_rgba(30,41,59,0.32)] backdrop-blur-xl">
      {SIMPLE_SORTS.map((option) => {
        const active = option.value === sort;

        return (
          <Link
            key={option.value}
            href={buildQuery(basePath, option.value, limit)}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-2xl px-4 py-2 text-sm font-semibold transition",
              active
                ? "primary-button shadow-[0_14px_24px_-18px_rgba(140,169,43,0.52)]"
                : "soft-button border-transparent bg-transparent text-muted shadow-none hover:border-white/80 hover:bg-white/88 hover:text-ink",
            )}
          >
            {option.label}
          </Link>
        );
      })}
    </div>
  );
}
