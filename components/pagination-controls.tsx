import Link from "next/link";

import type { SortOption } from "@/lib/types";

function buildQuery(basePath: string, sort: SortOption, page: number, limit: number) {
  const params = new URLSearchParams();
  params.set("sort", sort);
  params.set("page", page.toString());
  params.set("limit", limit.toString());
  return `${basePath}?${params.toString()}`;
}

export function PaginationControls({
  page,
  totalCount,
  limit,
  sort,
  basePath = "/",
}: {
  page: number;
  totalCount: number;
  limit: number;
  sort: SortOption;
  basePath?: string;
}) {
  const totalPages = Math.max(1, Math.ceil(totalCount / limit));

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-muted">
        Page {page} of {totalPages}
      </p>
      <div className="flex items-center gap-2">
        <Link
          href={buildQuery(basePath, sort, Math.max(1, page - 1), limit)}
          aria-disabled={page <= 1}
          className={`rounded-2xl px-3.5 py-2.5 text-sm font-medium transition ${
            page <= 1
              ? "pointer-events-none border border-outline bg-white/60 text-muted/70"
              : "soft-button"
          }`}
        >
          Previous
        </Link>
        <Link
          href={buildQuery(basePath, sort, Math.min(totalPages, page + 1), limit)}
          aria-disabled={page >= totalPages}
          className={`rounded-2xl px-3.5 py-2.5 text-sm font-medium transition ${
            page >= totalPages
              ? "pointer-events-none border border-outline bg-white/60 text-muted/70"
              : "soft-button"
          }`}
        >
          Next
        </Link>
      </div>
    </div>
  );
}
