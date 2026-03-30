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

import { CATEGORIES, TOURNAMENT_FEEDBACK_PATH } from "@/lib/constants";
import {
  clearPostDraft,
  readPostDraft,
  savePostDraft,
} from "@/lib/draft-handoff";
import type { Category } from "@/lib/types";
import {
  cn,
  getCategoryLabel,
  getDisplayName,
  htmlToPlainText,
  plainTextToHtml,
} from "@/lib/utils";

type PostFormProps = {
  mode?: "create" | "edit";
  postId?: string;
  initialValues?: {
    title: string;
    body: string;
    category: Category;
  };
};

export function PostForm({
  mode = "create",
  postId,
  initialValues,
}: PostFormProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isSignedIn, user } = useUser();
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [category, setCategory] = useState<Category>(initialValues?.category ?? "idea");
  const [body, setBody] = useState(initialValues?.body ? htmlToPlainText(initialValues.body) : "");
  const [guestStep, setGuestStep] = useState<"idle" | "choice" | "anonymous">("idle");
  const [error, setError] = useState<string | null>(null);
  const hasHandledDraftRef = useRef(false);

  const submitLabel = mode === "create" ? "Submit feedback" : "Save changes";
  const signedInName = getDisplayName(user);
  const needsAnonymousFlow = mode === "create" && !isSignedIn;
  const isCreateMode = mode === "create";

  function validatePost(values: { title: string; body: string }) {
    if (values.title.trim().length < 10) {
      setError("Title must be at least 10 characters.");
      return false;
    }

    if (values.body.trim().length === 0) {
      setError("Description is required.");
      return false;
    }

    return true;
  }

  function openGuestChoice() {
    setError(null);

    if (!validatePost({ title, body })) {
      return;
    }

    setGuestStep("choice");
  }

  function continueWithSignIn() {
    setError(null);

    if (!validatePost({ title, body })) {
      return;
    }

    savePostDraft({
      path: pathname,
      title,
      body,
      category,
      submitAfterSignIn: true,
    });

    router.push(`/sign-in?redirect_url=${encodeURIComponent(`${pathname}#share-feedback`)}`);
  }

  function submitPost(values?: { title: string; body: string; category: Category }) {
    const nextValues = values ?? { title, body, category };

    setError(null);

    if (!validatePost(nextValues)) {
      return;
    }

    startTransition(async () => {
      const response = await fetch(mode === "create" ? "/api/posts" : `/api/posts/${postId}`, {
        method: mode === "create" ? "POST" : "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: nextValues.title,
          body: plainTextToHtml(nextValues.body),
          category: nextValues.category,
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | {
            error?: string;
            post?: {
              id: string;
            };
          }
        | null;

      if (!response.ok) {
        setError(payload?.error ?? "Could not save your post.");
        return;
      }

      if (mode === "create") {
        clearPostDraft();
      }

      const destination = payload?.post?.id
        ? `/posts/${payload.post.id}`
        : postId
          ? `/posts/${postId}`
          : TOURNAMENT_FEEDBACK_PATH;

      router.push(destination);
      router.refresh();
    });
  }

  const hydrateDraft = useEffectEvent(
    (draft: { title: string; body: string; category: Category; submitAfterSignIn: boolean }) => {
      setTitle(draft.title);
      setBody(draft.body);
      setCategory(draft.category);

      if (isSignedIn && draft.submitAfterSignIn) {
        clearPostDraft();
        submitPost({
          title: draft.title,
          body: draft.body,
          category: draft.category,
        });
      }
    },
  );

  useEffect(() => {
    if (mode !== "create" || hasHandledDraftRef.current) {
      return;
    }

    const draft = readPostDraft(pathname);
    if (!draft) {
      return;
    }

    hasHandledDraftRef.current = true;
    const frameId = window.requestAnimationFrame(() => {
      hydrateDraft(draft);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [mode, pathname]);

  return (
    <form
      id={mode === "create" ? "share-feedback" : undefined}
      onSubmit={(event) => {
        event.preventDefault();
        submitPost();
      }}
      className={cn(
        "surface-card rounded-[30px]",
        isCreateMode ? "p-4 md:p-5" : "p-5 md:p-6",
      )}
    >
      <div className="rounded-[24px] border border-outline/85 bg-white/84 px-4 py-3.5 shadow-[0_18px_34px_-34px_rgba(53,109,255,0.34),inset_0_1px_0_rgba(255,255,255,0.92)] md:px-4.5">
        <label className="block">
          <span
            className={cn(
              "text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-court/80",
              isCreateMode ? "sr-only" : "",
            )}
          >
            Title
          </span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
            minLength={10}
            maxLength={120}
            className={cn(
              "mt-2 w-full border-0 bg-transparent px-0 py-0 text-ink outline-none placeholder:text-muted",
              isCreateMode
                ? "text-[1.18rem] font-semibold tracking-tight md:text-[1.28rem]"
                : "text-[1.4rem] font-semibold tracking-tight md:text-[1.55rem]",
            )}
            placeholder={isCreateMode ? "Headline for your feedback" : "Title"}
          />
        </label>

        <label className="mt-3 block border-t border-outline/75 pt-3">
          <span
            className={cn(
              "text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-court/80",
              isCreateMode ? "sr-only" : "",
            )}
          >
            Details
          </span>
          <textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            required
            rows={isCreateMode ? 2 : 3}
            className={cn(
              "mt-2 w-full resize-y border-0 bg-transparent px-0 py-0 text-[1rem] leading-7 text-ink outline-none placeholder:text-muted",
              isCreateMode ? "min-h-20 md:min-h-22" : "min-h-24 md:min-h-28",
            )}
            placeholder={
              isCreateMode
                ? "Describe what happened, what needs to change, or the idea other players should see."
                : "Share an idea, report an issue, or give feedback..."
            }
          />
        </label>
      </div>

      <div
        className={cn(
          "flex flex-wrap items-center justify-between gap-3 border-t border-outline/90",
          isCreateMode ? "mt-4 pt-3" : "mt-5 pt-4",
        )}
      >
        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex items-center gap-2 text-sm text-muted">
            <span className={cn(isCreateMode ? "hidden sm:inline" : "")}>Category</span>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value as Category)}
              className={cn(
                "modern-input text-sm text-ink",
                isCreateMode ? "rounded-full px-3.5 py-2" : "rounded-2xl px-3.5 py-2.5",
              )}
            >
              {CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {getCategoryLabel(item)}
                </option>
              ))}
            </select>
          </label>
          {isSignedIn && !isCreateMode ? (
            <span className="text-sm text-muted">Posting as {signedInName}</span>
          ) : null}
        </div>

        {!needsAnonymousFlow ? (
          <button
            type="submit"
            disabled={isPending}
            className={cn(
              "primary-button inline-flex items-center gap-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-70",
              isCreateMode ? "rounded-full px-4 py-2.5" : "rounded-2xl px-4.5 py-3",
            )}
          >
            {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
            {!isPending ? <SendHorizonal className="h-4 w-4" /> : null}
            {submitLabel}
          </button>
        ) : guestStep === "idle" ? (
          <button
            type="button"
            onClick={openGuestChoice}
            className={cn(
              "primary-button inline-flex items-center gap-2 text-sm font-medium",
              isCreateMode ? "rounded-full px-4 py-2.5" : "rounded-2xl px-4.5 py-3",
            )}
          >
            <SendHorizonal className="h-4 w-4" />
            Submit feedback
          </button>
        ) : guestStep === "choice" ? (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={continueWithSignIn}
              className={cn(
                "secondary-button text-sm font-medium",
                isCreateMode ? "rounded-full px-3.5 py-2" : "rounded-2xl px-3.5 py-2.5",
              )}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => {
                setError(null);
                setGuestStep("anonymous");
              }}
              className={cn(
                "primary-button text-sm font-medium",
                isCreateMode ? "rounded-full px-3.5 py-2" : "rounded-2xl px-3.5 py-2.5",
              )}
            >
              Post anonymous
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={continueWithSignIn}
              className={cn(
                "secondary-button text-sm font-medium",
                isCreateMode ? "rounded-full px-3.5 py-2" : "rounded-2xl px-3.5 py-2.5",
              )}
            >
              Sign in
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => submitPost()}
              className={cn(
                "primary-button inline-flex items-center gap-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-70",
                isCreateMode ? "rounded-full px-4 py-2.5" : "rounded-2xl px-4.5 py-3",
              )}
            >
              {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
              {!isPending ? <SendHorizonal className="h-4 w-4" /> : null}
              Post anonymously
            </button>
          </div>
        )}
      </div>

      {guestStep === "anonymous" ? (
        <div className="mt-4 rounded-[24px] border border-outline/85 bg-sun/70 p-4">
          <div className="rounded-2xl border border-orange-200 bg-orange-50/90 px-3 py-3 text-sm text-orange-700">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p>Anonymous posts cannot be edited later.</p>
                <p className="mt-1 text-orange-700/80">
                  Sign in to publish under your account if you want to edit this post later.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {error ? (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
          {error}
        </div>
      ) : null}
    </form>
  );
}
