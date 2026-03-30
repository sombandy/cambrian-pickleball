"use client";

import { LoaderCircle, PencilLine, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { TOURNAMENT_FEEDBACK_PATH } from "@/lib/constants";

type PostOwnerActionsProps = {
  postId: string;
  editHref: string;
  canEdit: boolean;
  canDelete: boolean;
};

function getDeleteDestination() {
  const params = new URLSearchParams({
    sort: "newest",
    page: "1",
  });

  return `${TOURNAMENT_FEEDBACK_PATH}?${params.toString()}`;
}

export function PostOwnerActions({ postId, editHref, canEdit, canDelete }: PostOwnerActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleDelete() {
    if (isPending) {
      return;
    }

    const confirmed = window.confirm("Delete this post? This cannot be undone.");
    if (!confirmed) {
      return;
    }

    setError(null);

    startTransition(async () => {
      const response = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
      });

      const payload = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        setError(payload?.error ?? "Could not delete post.");
        return;
      }

      router.replace(getDeleteDestination());
      router.refresh();
    });
  }

  return (
    <div className="grid gap-3 md:justify-items-end">
      <div className="flex flex-wrap items-center gap-2">
        {canEdit ? (
          <Link
            href={editHref}
            className={`soft-button inline-flex items-center gap-2 rounded-2xl px-3.5 py-2.5 text-sm font-medium ${
              isPending ? "pointer-events-none opacity-70" : ""
            }`}
          >
            <PencilLine className="h-4 w-4" />
            Edit
          </Link>
        ) : null}
        {canDelete ? (
          <button
            type="button"
            disabled={isPending}
            onClick={handleDelete}
            className="inline-flex items-center gap-2 rounded-2xl bg-clay px-3.5 py-2.5 text-sm font-medium text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            Delete
          </button>
        ) : null}
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
          {error}
        </div>
      ) : null}
    </div>
  );
}
