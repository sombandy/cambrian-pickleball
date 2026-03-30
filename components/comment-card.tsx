"use client";

import { LoaderCircle, PencilLine, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import type { CommentRecord } from "@/lib/types";
import { formatRelativeTime, getInitials } from "@/lib/utils";

type CommentCardProps = {
  comment: CommentRecord;
  canEdit: boolean;
  canDelete: boolean;
};

export function CommentCard({ comment, canEdit, canDelete }: CommentCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(false);
  const [body, setBody] = useState(comment.body);
  const [displayBody, setDisplayBody] = useState(comment.body);
  const [error, setError] = useState<string | null>(null);

  function handleCancelEdit() {
    setError(null);
    setBody(displayBody);
    setIsEditing(false);
  }

  function handleSave() {
    if (isPending) {
      return;
    }

    const trimmedBody = body.trim();
    if (trimmedBody.length === 0) {
      setError("Comment cannot be empty.");
      return;
    }

    setError(null);

    startTransition(async () => {
      const response = await fetch(`/api/comments/${comment.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          body: trimmedBody,
        }),
      });

      const payload = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        setError(payload?.error ?? "Could not update comment.");
        return;
      }

      setDisplayBody(trimmedBody);
      setBody(trimmedBody);
      setIsEditing(false);
      router.refresh();
    });
  }

  function handleDelete() {
    if (isPending) {
      return;
    }

    const confirmed = window.confirm("Delete this comment? This cannot be undone.");
    if (!confirmed) {
      return;
    }

    setError(null);

    startTransition(async () => {
      const response = await fetch(`/api/comments/${comment.id}`, {
        method: "DELETE",
      });

      const payload = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        setError(payload?.error ?? "Could not delete comment.");
        return;
      }

      router.refresh();
    });
  }

  return (
    <article className="surface-card rounded-[24px] p-4 md:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#f8faea_0%,#edf4d6_100%)] text-sm font-semibold text-court">
            {getInitials(comment.authorName)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-muted">
              {comment.authorName} · {formatRelativeTime(comment.createdAt)}
            </p>

            {isEditing ? (
              <label className="mt-3 block">
                <textarea
                  value={body}
                  onChange={(event) => setBody(event.target.value)}
                  maxLength={1000}
                  rows={4}
                  className="modern-input min-h-24 w-full resize-y rounded-2xl px-4 py-3.5 text-base leading-7 text-ink"
                />
              </label>
            ) : (
              <p className="mt-3 whitespace-pre-wrap text-[1.02rem] leading-7 text-ink">{displayBody}</p>
            )}

            {error ? (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
                {error}
              </div>
            ) : null}
          </div>
        </div>

        {canEdit || canDelete ? (
          isEditing ? (
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={isPending}
                onClick={handleCancelEdit}
                className="soft-button inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-70"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={handleSave}
                className="primary-button inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <PencilLine className="h-4 w-4" />}
                Save
              </button>
            </div>
          ) : (
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              {canEdit ? (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => {
                    setError(null);
                    setIsEditing(true);
                  }}
                  className="soft-button inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <PencilLine className="h-4 w-4" />
                  Edit
                </button>
              ) : null}
              {canDelete ? (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={handleDelete}
                  className="inline-flex items-center gap-2 rounded-2xl bg-clay px-3 py-2 text-sm font-medium text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  Delete
                </button>
              ) : null}
            </div>
          )
        ) : null}
      </div>
    </article>
  );
}
