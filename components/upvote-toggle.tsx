"use client";

import { useAuth } from "@clerk/nextjs";
import { ArrowUp } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { cn } from "@/lib/utils";

type UpvoteToggleProps = {
  postId: string;
  initialCount: number;
  initialActive: boolean;
  compact?: boolean;
};

export function UpvoteToggle({
  postId,
  initialCount,
  initialActive,
  compact = false,
}: UpvoteToggleProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isSignedIn } = useAuth();
  const [isPending, startTransition] = useTransition();
  const [active, setActive] = useState(initialActive);
  const [count, setCount] = useState(initialCount);
  const [error, setError] = useState<string | null>(null);

  if (!isSignedIn) {
    return (
      <Link
        href={`/sign-in?redirect_url=${encodeURIComponent(pathname)}`}
        aria-label="Sign in to upvote"
        className={cn(
          "soft-button inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium",
          compact && "text-xs",
        )}
      >
        <ArrowUp className={cn("h-4 w-4", compact && "h-3.5 w-3.5")} />
        {count}
      </Link>
    );
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        aria-pressed={active}
        onClick={() => {
          setError(null);

          startTransition(async () => {
            const previous = { active, count };
            const nextActive = !active;

            setActive(nextActive);
            setCount((value) => value + (nextActive ? 1 : -1));

            const response = await fetch(`/api/posts/${postId}/upvote`, {
              method: "POST",
            });

            const payload = (await response.json().catch(() => null)) as
              | { active?: boolean; upvoteCount?: number; error?: string }
              | null;

            if (!response.ok) {
              setActive(previous.active);
              setCount(previous.count);
              setError(payload?.error ?? "Could not update your vote.");
              return;
            }

            setActive(Boolean(payload?.active));
            setCount(payload?.upvoteCount ?? previous.count);
            router.refresh();
          });
        }}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium",
          active
            ? "secondary-button"
            : "soft-button",
          compact && "px-3 py-1.5 text-xs",
          isPending && "opacity-70",
        )}
      >
        <ArrowUp className={cn("h-4 w-4", compact && "h-3.5 w-3.5")} />
        {count}
      </button>

      {error ? <p className="text-xs text-clay">{error}</p> : null}
    </div>
  );
}
