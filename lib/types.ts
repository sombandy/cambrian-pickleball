import { CATEGORIES, SORT_OPTIONS } from "@/lib/constants";

export type Category = (typeof CATEGORIES)[number];
export type SortOption = (typeof SORT_OPTIONS)[number];

export type PostSummary = {
  id: string;
  title: string;
  body: string;
  category: Category;
  clerkId: string | null;
  authorName: string;
  createdAt: string;
  updatedAt: string;
  upvoteCount: number;
  commentCount: number;
  viewerHasUpvoted: boolean;
};

export type CommentRecord = {
  id: string;
  postId: string;
  body: string;
  clerkId: string | null;
  authorName: string;
  createdAt: string;
};

export type PostDetail = PostSummary & {
  comments: CommentRecord[];
};

export type ActivityItem = {
  id: string;
  kind: "post" | "comment";
  postId: string;
  postTitle: string;
  clerkId: string | null;
  authorName: string;
  body: string;
  createdAt: string;
};

export type AdminUserRecord = {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
};
