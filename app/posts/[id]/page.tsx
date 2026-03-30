import type { Metadata } from "next";
import { MessageSquareText, PencilLine } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CommentForm } from "@/components/comment-form";
import { UpvoteToggle } from "@/components/upvote-toggle";
import { getViewerAuth } from "@/lib/auth";
import { getPostDetail } from "@/lib/data";
import {
  excerpt,
  formatRelativeTime,
  getCategoryLabel,
  getInitials,
  stripHtml,
} from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const post = await getPostDetail(id, null);

  if (!post) {
    return {
      title: "Post not found",
    };
  }

  return {
    title: post.title,
    description: excerpt(stripHtml(post.body), 160),
  };
}

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const viewer = await getViewerAuth();
  const post = await getPostDetail(id, viewer.userId);

  if (!post) {
    notFound();
  }

  const canEdit = Boolean(viewer.userId && (viewer.isAdmin || post.clerkId === viewer.userId));

  return (
    <main className="grid gap-5 pb-12">
      <section className="grid gap-5">
        <article className="surface-card rounded-[30px] p-5 md:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#edf3ff_0%,#dfeaff_100%)] text-sm font-semibold text-court shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">
                {getInitials(post.authorName)}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-court-soft px-2.5 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-court">
                    {getCategoryLabel(post.category)}
                  </span>
                  <span className="text-sm text-muted">{formatRelativeTime(post.createdAt)}</span>
                </div>
                <p className="mt-1 text-sm text-muted">{post.authorName}</p>
              </div>
            </div>
            {canEdit ? (
              <Link
                href={`/posts/${post.id}/edit`}
                className="soft-button inline-flex items-center gap-2 rounded-2xl px-3.5 py-2.5 text-sm font-medium"
              >
                <PencilLine className="h-4 w-4" />
                Edit
              </Link>
            ) : null}
          </div>

          <h1 className="mt-5 text-3xl font-semibold leading-tight tracking-tight text-ink md:text-[2.55rem]">
            {post.title}
          </h1>

          <div
            className="prose-board mt-5 text-[1.02rem]"
            dangerouslySetInnerHTML={{ __html: post.body }}
          />

          <div className="mt-7 flex flex-wrap items-center gap-3 border-t border-outline/90 pt-4">
            <UpvoteToggle
              postId={post.id}
              initialCount={post.upvoteCount}
              initialActive={post.viewerHasUpvoted}
            />
            <div className="soft-button inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm text-muted">
              <MessageSquareText className="h-4 w-4" />
              <span>{post.commentCount}</span>
            </div>
          </div>
        </article>

        <section className="grid gap-4">
          <h2 className="text-sm font-medium tracking-wide text-muted">
            {post.commentCount} comment{post.commentCount === 1 ? "" : "s"}
          </h2>

          {post.comments.length === 0 ? (
            <div className="surface-card rounded-[24px] p-5 text-sm text-muted">
              No replies yet.
            </div>
          ) : (
            post.comments.map((comment) => (
              <article key={comment.id} className="surface-card rounded-[24px] p-4 md:p-5">
                <div className="flex items-start gap-3">
                  <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#f4f7ff_0%,#e6eeff_100%)] text-sm font-semibold text-court">
                    {getInitials(comment.authorName)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-muted">
                      {comment.authorName} · {formatRelativeTime(comment.createdAt)}
                    </p>
                    <p className="mt-3 text-[1.02rem] leading-7 text-ink">{comment.body}</p>
                  </div>
                </div>
              </article>
            ))
          )}
        </section>

        <CommentForm postId={post.id} />
      </section>
    </main>
  );
}
