import { cn } from "@/lib/utils";
import type { Category } from "@/lib/types";
import { getCategoryLabel } from "@/lib/utils";

const categoryStyles: Record<Category, string> = {
  issue: "bg-clay/14 text-clay ring-clay/18",
  idea: "bg-court/12 text-court ring-court/16",
  general_feedback: "bg-berry/12 text-berry ring-berry/16",
};

export function CategoryPill({ category, className }: { category: Category; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ring-1 ring-inset",
        categoryStyles[category],
        className,
      )}
    >
      {getCategoryLabel(category)}
    </span>
  );
}
