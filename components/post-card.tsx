import { MessageSquareText, MoreHorizontal } from "lucide-react";
import Link from "next/link";

import { UpvoteToggle } from "@/components/upvote-toggle";
import type { PostSummary } from "@/lib/types";
import {
  excerpt,
  formatCommentCount,
  formatRelativeTime,
  getCategoryLabel,
  getInitials,
  stripHtml,
} from "@/lib/utils";

export function PostCard({ post, className }: { post: PostSummary; className?: string }) {
  return (
    <article
      className={`surface-card group rounded-[28px] p-5 transition duration-200 hover:-translate-y-0.5 hover:border-outline-strong hover:shadow-[0_28px_42px_-34px_rgba(30,41,59,0.26)] md:p-6 ${className ?? ""}`}
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#f4f8e3_0%,#e8f0cb_100%)] text-sm font-semibold text-court shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">
            {getInitials(post.authorName)}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-court-soft px-2.5 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-court">
                {getCategoryLabel(post.category)}
              </span>
              <span className="text-sm text-muted">{formatRelativeTime(post.createdAt)}</span>
            </div>
            <p className="mt-1 text-sm text-muted">{post.authorName}</p>
          </div>
        </div>
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-outline/80 bg-white/80 text-muted">
          <MoreHorizontal className="h-4 w-4" />
        </span>
      </div>

      <div className="mb-5">
        <Link href={`/posts/${post.id}`} className="block">
          <h2 className="text-[1.4rem] font-semibold leading-tight tracking-tight text-ink transition group-hover:text-court md:text-[1.55rem]">
            {post.title}
          </h2>
          <p className="mt-3 text-[1rem] leading-7 text-ink/95">
            {excerpt(stripHtml(post.body), 210)}
          </p>
        </Link>
      </div>

      <div className="mt-auto flex items-center gap-3 border-t border-outline/90 pt-4">
        <UpvoteToggle
          postId={post.id}
          initialCount={post.upvoteCount}
          initialActive={post.viewerHasUpvoted}
          compact
        />
        <Link
          href={`/posts/${post.id}`}
          className="soft-button inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm"
        >
          <MessageSquareText className="h-4 w-4" />
          <span>{post.commentCount}</span>
        </Link>
        <span className="sr-only">{formatCommentCount(post.commentCount)}</span>
      </div>
    </article>
  );
}
