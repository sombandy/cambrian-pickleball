"use client";

import type { Category } from "@/lib/types";

const POST_DRAFT_KEY = "cp_post_draft_handoff";
const COMMENT_DRAFT_KEY = "cp_comment_draft_handoff";
const DRAFT_TTL_MS = 30 * 60 * 1000;

type StoredDraft<T> = T & {
  updatedAt: number;
};

export type PostDraftHandoff = {
  path: string;
  title: string;
  body: string;
  category: Category;
  submitAfterSignIn: boolean;
};

export type CommentDraftHandoff = {
  path: string;
  postId: string;
  body: string;
  submitAfterSignIn: boolean;
};

function readStoredDraft<T>(key: string) {
  if (typeof window === "undefined") {
    return null;
  }

  const rawValue = window.sessionStorage.getItem(key);
  if (!rawValue) {
    return null;
  }

  try {
    const draft = JSON.parse(rawValue) as StoredDraft<T>;

    if (
      typeof draft !== "object" ||
      draft === null ||
      typeof draft.updatedAt !== "number" ||
      Date.now() - draft.updatedAt > DRAFT_TTL_MS
    ) {
      window.sessionStorage.removeItem(key);
      return null;
    }

    return draft;
  } catch {
    window.sessionStorage.removeItem(key);
    return null;
  }
}

function writeStoredDraft<T extends Record<string, unknown>>(key: string, draft: T) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(
    key,
    JSON.stringify({
      ...draft,
      updatedAt: Date.now(),
    }),
  );
}

function clearStoredDraft(key: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(key);
}

export function readPostDraft(path: string) {
  const draft = readStoredDraft<PostDraftHandoff>(POST_DRAFT_KEY);

  if (!draft || draft.path !== path) {
    return null;
  }

  return draft;
}

export function savePostDraft(draft: PostDraftHandoff) {
  writeStoredDraft(POST_DRAFT_KEY, draft);
}

export function clearPostDraft() {
  clearStoredDraft(POST_DRAFT_KEY);
}

export function readCommentDraft(path: string, postId: string) {
  const draft = readStoredDraft<CommentDraftHandoff>(COMMENT_DRAFT_KEY);

  if (!draft || draft.path !== path || draft.postId !== postId) {
    return null;
  }

  return draft;
}

export function saveCommentDraft(draft: CommentDraftHandoff) {
  writeStoredDraft(COMMENT_DRAFT_KEY, draft);
}

export function clearCommentDraft() {
  clearStoredDraft(COMMENT_DRAFT_KEY);
}
