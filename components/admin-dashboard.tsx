"use client";

import { LoaderCircle, Trash2, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { CategoryPill } from "@/components/category-pill";
import type { ActivityItem, AdminUserRecord, PostSummary } from "@/lib/types";
import {
  excerpt,
  formatCommentCount,
  formatRelativeTime,
  formatVoteCount,
  stripHtml,
} from "@/lib/utils";

type AdminComment = {
  id: string;
  postId: string;
  postTitle: string;
  body: string;
  authorName: string;
  createdAt: string;
};

type AdminDashboardProps = {
  admins: AdminUserRecord[];
  posts: PostSummary[];
  comments: AdminComment[];
  activity: ActivityItem[];
};

export function AdminDashboard({
  admins,
  posts,
  comments,
  activity,
}: AdminDashboardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function runAction(action: () => Promise<void>) {
    setError(null);
    setMessage(null);

    startTransition(async () => {
      try {
        await action();
        router.refresh();
      } catch (actionError) {
        const text =
          actionError instanceof Error ? actionError.message : "The admin action could not be completed.";
        setError(text);
      }
    });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <section className="grid gap-6">
        <div className="surface-card rounded-[2rem] p-5 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-court">Admin management</p>
              <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-ink">
                Control who can moderate the board.
              </h2>
            </div>
            <div className="rounded-full bg-court-soft px-4 py-2 text-sm font-medium text-court">
              {admins.length} admin{admins.length === 1 ? "" : "s"}
            </div>
          </div>

          <form
            className="mt-5 flex flex-col gap-3 md:flex-row"
            onSubmit={(event) => {
              event.preventDefault();

              runAction(async () => {
                const response = await fetch("/api/admin/users", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ email }),
                });

                const payload = (await response.json().catch(() => null)) as { error?: string } | null;

                if (!response.ok) {
                  throw new Error(payload?.error ?? "Could not add admin.");
                }

                setEmail("");
                setMessage("Admin access updated.");
              });
            }}
          >
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              required
              placeholder="player@example.com"
              className="min-w-0 flex-1 rounded-[1.2rem] border border-outline bg-white/80 px-4 py-3 text-base text-ink outline-none transition focus:border-court"
            />
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-court px-5 py-3 text-sm font-semibold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
              Grant admin
            </button>
          </form>

          {error ? (
            <div className="mt-4 rounded-[1.2rem] border border-clay/24 bg-clay/8 px-4 py-3 text-sm text-clay">
              {error}
            </div>
          ) : null}

          {message ? (
            <div className="mt-4 rounded-[1.2rem] border border-court/18 bg-court/8 px-4 py-3 text-sm text-court">
              {message}
            </div>
          ) : null}

          <div className="mt-5 grid gap-3">
            {admins.map((admin) => (
              <div
                key={admin.id}
                className="flex flex-col gap-3 rounded-[1.5rem] border border-outline bg-white/75 px-4 py-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="font-semibold text-ink">{admin.name}</p>
                  <p className="text-sm text-muted">{admin.email}</p>
                </div>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() =>
                    runAction(async () => {
                      const response = await fetch(`/api/admin/users/${admin.id}`, {
                        method: "DELETE",
                      });

                      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
                      if (!response.ok) {
                        throw new Error(payload?.error ?? "Could not revoke admin.");
                      }

                      setMessage("Admin access updated.");
                    })
                  }
                  className="rounded-full border border-outline px-4 py-2 text-sm font-semibold text-ink transition hover:border-outline-strong hover:bg-white"
                >
                  Remove admin
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="surface-card rounded-[2rem] p-5 md:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-court">Posts</p>
              <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-ink">
                Edit or remove anything on the board.
              </h2>
            </div>
          </div>

          <div className="mt-5 grid gap-4">
            {posts.map((post) => (
              <article
                key={post.id}
                className="rounded-[1.5rem] border border-outline bg-white/75 px-4 py-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-xl font-semibold tracking-tight text-ink">
                      {post.title}
                    </h3>
                    <p className="mt-2 text-sm text-muted">
                      {post.authorName} • {formatRelativeTime(post.createdAt)}
                    </p>
                  </div>
                  <CategoryPill category={post.category} />
                </div>

                <p className="mt-3 text-sm leading-7 text-muted">{excerpt(stripHtml(post.body), 180)}</p>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-outline pt-4">
                  <p className="text-sm text-muted">
                    {formatVoteCount(post.upvoteCount)} • {formatCommentCount(post.commentCount)}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/posts/${post.id}`}
                      className="rounded-full border border-outline px-4 py-2 text-sm font-semibold text-ink transition hover:border-outline-strong hover:bg-white"
                    >
                      View
                    </Link>
                    <Link
                      href={`/posts/${post.id}/edit`}
                      className="rounded-full border border-outline px-4 py-2 text-sm font-semibold text-ink transition hover:border-outline-strong hover:bg-white"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() =>
                        runAction(async () => {
                          const response = await fetch(`/api/posts/${post.id}`, {
                            method: "DELETE",
                          });
                          const payload = (await response.json().catch(() => null)) as { error?: string } | null;
                          if (!response.ok) {
                            throw new Error(payload?.error ?? "Could not delete post.");
                          }
                          setMessage("Post deleted.");
                        })
                      }
                      className="inline-flex items-center gap-2 rounded-full bg-clay px-4 py-2 text-sm font-semibold text-white transition hover:brightness-105"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6">
        <div className="surface-card rounded-[2rem] p-5 md:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-court">Comments</p>
          <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-ink">
            Moderate the latest replies.
          </h2>

          <div className="mt-5 grid gap-4">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="rounded-[1.5rem] border border-outline bg-white/75 px-4 py-4"
              >
                <p className="text-sm font-semibold text-ink">{comment.authorName}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted">{comment.postTitle}</p>
                <p className="mt-3 text-sm leading-7 text-muted">{excerpt(comment.body, 180)}</p>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-outline pt-4">
                  <span className="text-sm text-muted">{formatRelativeTime(comment.createdAt)}</span>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/posts/${comment.postId}`}
                      className="rounded-full border border-outline px-4 py-2 text-sm font-semibold text-ink transition hover:border-outline-strong hover:bg-white"
                    >
                      Open post
                    </Link>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() =>
                        runAction(async () => {
                          const response = await fetch(`/api/comments/${comment.id}`, {
                            method: "DELETE",
                          });
                          const payload = (await response.json().catch(() => null)) as { error?: string } | null;
                          if (!response.ok) {
                            throw new Error(payload?.error ?? "Could not delete comment.");
                          }
                          setMessage("Comment deleted.");
                        })
                      }
                      className="inline-flex items-center gap-2 rounded-full bg-clay px-4 py-2 text-sm font-semibold text-white transition hover:brightness-105"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="surface-card rounded-[2rem] p-5 md:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-court">Activity feed</p>
          <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-ink">
            Watch the board in reverse time.
          </h2>

          <div className="mt-5 grid gap-3">
            {activity.map((item) => (
              <div
                key={`${item.kind}-${item.id}`}
                className="rounded-[1.35rem] border border-outline bg-white/75 px-4 py-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-court">
                    {item.kind === "post" ? "New post" : "New comment"}
                  </p>
                  <p className="text-xs text-muted">{formatRelativeTime(item.createdAt)}</p>
                </div>
                <p className="mt-2 font-semibold text-ink">{item.authorName}</p>
                <p className="mt-1 text-sm text-muted">{item.postTitle}</p>
                <p className="mt-3 text-sm leading-7 text-muted">
                  {excerpt(stripHtml(item.body), 180)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
