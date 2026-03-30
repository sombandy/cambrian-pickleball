"use client";

import { useUser } from "@clerk/nextjs";
import { AlertTriangle, LoaderCircle, SendHorizonal } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import {
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  useTransition,
} from "react";

import {
  clearCommentDraft,
  readCommentDraft,
  saveCommentDraft,
} from "@/lib/draft-handoff";
import { getDisplayName } from "@/lib/utils";

export function CommentForm({ postId }: { postId: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isSignedIn, user } = useUser();
  const [isPending, startTransition] = useTransition();
  const [body, setBody] = useState("");
  const [guestStep, setGuestStep] = useState<"idle" | "choice" | "anonymous">("idle");
  const [error, setError] = useState<string | null>(null);
  const hasHandledDraftRef = useRef(false);

  function validateComment(value: string) {
    if (value.trim().length === 0) {
      setError("Comment cannot be empty.");
      return false;
    }

    return true;
  }

  function openGuestChoice() {
    setError(null);

    if (!validateComment(body)) {
      return;
    }

    setGuestStep("choice");
  }

  function continueWithSignIn() {
    setError(null);

    if (!validateComment(body)) {
      return;
    }

    saveCommentDraft({
      path: pathname,
      postId,
      body,
      submitAfterSignIn: true,
    });

    router.push(`/sign-in?redirect_url=${encodeURIComponent(`${pathname}#comment-form`)}`);
  }

  function submitComment(value = body) {
    setError(null);

    if (!validateComment(value)) {
      return;
    }

    startTransition(async () => {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          body: value,
        }),
      });

      const payload = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        setError(payload?.error ?? "Could not add your comment.");
        return;
      }

      clearCommentDraft();
      setBody("");
      setGuestStep("idle");
      router.refresh();
    });
  }

  const hydrateDraft = useEffectEvent(
    (draft: { body: string; submitAfterSignIn: boolean }) => {
      setBody(draft.body);

      if (isSignedIn && draft.submitAfterSignIn) {
        clearCommentDraft();
        submitComment(draft.body);
      }
    },
  );

  useEffect(() => {
    if (hasHandledDraftRef.current) {
      return;
    }

    const draft = readCommentDraft(pathname, postId);
    if (!draft) {
      return;
    }

    hasHandledDraftRef.current = true;
    const frameId = window.requestAnimationFrame(() => {
      hydrateDraft(draft);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [pathname, postId]);

  return (
    <form
      id="comment-form"
      onSubmit={(event) => {
        event.preventDefault();
        submitComment();
      }}
      className="surface-card rounded-[28px] p-5 md:p-6"
    >
      {isSignedIn ? (
        <div className="mb-3 text-sm text-muted">Commenting as {getDisplayName(user)}</div>
      ) : null}

      <label className="block">
        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          required
          maxLength={1000}
          rows={4}
          className="modern-input w-full min-h-24 resize-y rounded-2xl px-4 py-3.5 text-base leading-7 text-ink"
          placeholder="Add a comment..."
        />
      </label>

      {error ? (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="mt-4 flex items-center justify-between gap-3">
        {isSignedIn ? (
          <button
            type="submit"
            disabled={isPending}
            className="primary-button inline-flex items-center gap-2 rounded-2xl px-4.5 py-3 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
            {!isPending ? <SendHorizonal className="h-4 w-4" /> : null}
            Add comment
          </button>
        ) : guestStep === "idle" ? (
          <button
            type="button"
            onClick={openGuestChoice}
            className="primary-button inline-flex items-center gap-2 rounded-2xl px-4.5 py-3 text-sm font-medium"
          >
            <SendHorizonal className="h-4 w-4" />
            Add comment
          </button>
        ) : guestStep === "choice" ? (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={continueWithSignIn}
              className="secondary-button rounded-2xl px-3.5 py-2.5 text-sm font-medium"
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => {
                setError(null);
                setGuestStep("anonymous");
              }}
              className="primary-button rounded-2xl px-3.5 py-2.5 text-sm font-medium"
            >
              Comment anonymously
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={continueWithSignIn}
              className="secondary-button rounded-2xl px-3.5 py-2.5 text-sm font-medium"
            >
              Sign in
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => submitComment()}
              className="primary-button inline-flex items-center gap-2 rounded-2xl px-4.5 py-3 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
              {!isPending ? <SendHorizonal className="h-4 w-4" /> : null}
              Post anonymous comment
            </button>
          </div>
        )}
      </div>

      {!isSignedIn && guestStep === "anonymous" ? (
        <div className="mt-4 rounded-[24px] border border-outline/85 bg-sun/65 p-4">
          <div className="rounded-2xl border border-orange-200 bg-orange-50/90 px-3 py-3 text-sm text-orange-700">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p>This comment will be published as Anonymous and cannot be edited or deleted later.</p>
                <p className="mt-1 text-orange-700/80">
                  Sign in so you can edit or delete it later.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </form>
  );
}
