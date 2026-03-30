export const CATEGORIES = ["issue", "idea", "general_feedback"] as const;

export const CATEGORY_LABELS: Record<(typeof CATEGORIES)[number], string> = {
  issue: "Issue",
  idea: "Idea",
  general_feedback: "General Feedback",
};

export const SORT_OPTIONS = ["newest", "upvoted", "commented"] as const;

export const SORT_LABELS: Record<(typeof SORT_OPTIONS)[number], string> = {
  newest: "Newest",
  upvoted: "Most Upvoted",
  commented: "Most Commented",
};

export const PAGE_SIZE = 12;
export const ANONYMOUS_AUTHOR_NAME = "Anonymous";

export const RATE_LIMITS = {
  post: { scope: "post:create", limit: 5, windowHours: 1 },
  comment: { scope: "comment:create", limit: 12, windowHours: 1 },
} as const;
