import { clerkClient } from "@clerk/nextjs/server";

import { ANONYMOUS_AUTHOR_NAME, RATE_LIMITS } from "@/lib/constants";
import { db } from "@/lib/db";
import type {
  ActivityItem,
  Category,
  CommentRecord,
  PostDetail,
  PostSummary,
  SortOption,
} from "@/lib/types";
import { getDisplayName } from "@/lib/utils";

type PostRow = {
  id: string;
  title: string;
  body: string;
  category: Category;
  clerk_id: string | null;
  created_at: Date | string;
  updated_at: Date | string;
  upvote_count: number;
  comment_count: number;
  viewer_has_upvoted: boolean;
};

type CommentRow = {
  id: string;
  post_id: string;
  body: string;
  clerk_id: string | null;
  created_at: Date | string;
};

type ActivityRow = {
  id: string;
  kind: "post" | "comment";
  post_id: string;
  post_title: string;
  body: string;
  clerk_id: string | null;
  created_at: Date | string;
};

export class RateLimitError extends Error {
  status = 429;
}

function toIsoString(value: string | Date) {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

async function getAuthorNameMap(clerkIds: string[]) {
  const uniqueIds = [...new Set(clerkIds.filter(Boolean))];
  const nameMap = new Map<string, string>();

  if (uniqueIds.length === 0) {
    return nameMap;
  }

  const client = await clerkClient();

  for (let index = 0; index < uniqueIds.length; index += 100) {
    const chunk = uniqueIds.slice(index, index + 100);
    const response = await client.users.getUserList({
      userId: chunk,
      limit: chunk.length,
    });

    for (const user of response.data) {
      nameMap.set(user.id, getDisplayName(user));
    }
  }

  return nameMap;
}

async function hydratePostRows(rows: PostRow[]): Promise<PostSummary[]> {
  const nameMap = await getAuthorNameMap(
    rows.map((row) => row.clerk_id).filter((value): value is string => Boolean(value)),
  );

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    body: row.body,
    category: row.category,
    clerkId: row.clerk_id,
    authorName: row.clerk_id
      ? nameMap.get(row.clerk_id) ?? "Former Player"
      : ANONYMOUS_AUTHOR_NAME,
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at),
    upvoteCount: Number(row.upvote_count),
    commentCount: Number(row.comment_count),
    viewerHasUpvoted: Boolean(row.viewer_has_upvoted),
  }));
}

async function hydrateCommentRows(rows: CommentRow[]): Promise<CommentRecord[]> {
  const nameMap = await getAuthorNameMap(
    rows.map((row) => row.clerk_id).filter((value): value is string => Boolean(value)),
  );

  return rows.map((row) => ({
    id: row.id,
    postId: row.post_id,
    body: row.body,
    clerkId: row.clerk_id,
    authorName: row.clerk_id
      ? nameMap.get(row.clerk_id) ?? "Former Player"
      : ANONYMOUS_AUTHOR_NAME,
    createdAt: toIsoString(row.created_at),
  }));
}

async function hydrateActivityRows(rows: ActivityRow[]): Promise<ActivityItem[]> {
  const nameMap = await getAuthorNameMap(
    rows.map((row) => row.clerk_id).filter((value): value is string => Boolean(value)),
  );

  return rows.map((row) => ({
    id: row.id,
    kind: row.kind,
    postId: row.post_id,
    postTitle: row.post_title,
    body: row.body,
    clerkId: row.clerk_id,
    authorName: row.clerk_id
      ? nameMap.get(row.clerk_id) ?? "Former Player"
      : ANONYMOUS_AUTHOR_NAME,
    createdAt: toIsoString(row.created_at),
  }));
}

function getOrderClause(sort: SortOption) {
  switch (sort) {
    case "upvoted":
      return "upvote_count DESC, comment_count DESC, p.created_at DESC";
    case "commented":
      return "comment_count DESC, upvote_count DESC, p.created_at DESC";
    case "newest":
    default:
      return "p.created_at DESC";
  }
}

export async function enforceCreateRateLimit(actorKey: string, kind: keyof typeof RATE_LIMITS) {
  const sql = db();
  const rule = RATE_LIMITS[kind];

  await sql.begin(async (transaction) => {
    const tx = transaction as unknown as ReturnType<typeof db>;
    const [record] = await tx<{ count: number }[]>`
      SELECT COUNT(*)::int AS count
      FROM rate_limit_events
      WHERE actor_key = ${actorKey}
        AND scope = ${rule.scope}
        AND created_at >= NOW() - (${rule.windowHours} * INTERVAL '1 hour')
    `;

    if ((record?.count ?? 0) >= rule.limit) {
      throw new RateLimitError(
        `Too many ${kind === "post" ? "posts" : "comments"} from this source. Please wait a bit and try again.`,
      );
    }

    await tx`
      INSERT INTO rate_limit_events (actor_key, scope)
      VALUES (${actorKey}, ${rule.scope})
    `;
  });
}

export async function listPosts(options: {
  sort: SortOption;
  page: number;
  limit: number;
  viewerUserId: string | null;
}) {
  const sql = db();
  const offset = (options.page - 1) * options.limit;
  const viewerId = options.viewerUserId ?? "__visitor__";
  const orderClause = getOrderClause(options.sort);

  const rows = await sql<PostRow[]>`
    SELECT
      p.id,
      p.title,
      p.body,
      p.category,
      p.clerk_id,
      p.created_at,
      p.updated_at,
      COALESCE(upvote_totals.upvote_count, 0)::int AS upvote_count,
      COALESCE(comment_totals.comment_count, 0)::int AS comment_count,
      COALESCE(viewer_vote.post_id IS NOT NULL, false) AS viewer_has_upvoted
    FROM posts p
    LEFT JOIN (
      SELECT post_id, COUNT(*)::int AS upvote_count
      FROM upvotes
      GROUP BY post_id
    ) AS upvote_totals ON upvote_totals.post_id = p.id
    LEFT JOIN (
      SELECT post_id, COUNT(*)::int AS comment_count
      FROM comments
      GROUP BY post_id
    ) AS comment_totals ON comment_totals.post_id = p.id
    LEFT JOIN upvotes AS viewer_vote
      ON viewer_vote.post_id = p.id
      AND viewer_vote.clerk_id = ${viewerId}
    ORDER BY ${sql.unsafe(orderClause)}
    LIMIT ${options.limit}
    OFFSET ${offset}
  `;

  const [countRecord] = await sql<{ count: number }[]>`
    SELECT COUNT(*)::int AS count
    FROM posts
  `;

  return {
    posts: await hydratePostRows(rows),
    totalCount: countRecord?.count ?? 0,
  };
}

export async function getPostDetail(postId: string, viewerUserId: string | null) {
  const sql = db();
  const viewerId = viewerUserId ?? "__visitor__";

  const postRows = await sql<PostRow[]>`
    SELECT
      p.id,
      p.title,
      p.body,
      p.category,
      p.clerk_id,
      p.created_at,
      p.updated_at,
      COALESCE(upvote_totals.upvote_count, 0)::int AS upvote_count,
      COALESCE(comment_totals.comment_count, 0)::int AS comment_count,
      COALESCE(viewer_vote.post_id IS NOT NULL, false) AS viewer_has_upvoted
    FROM posts p
    LEFT JOIN (
      SELECT post_id, COUNT(*)::int AS upvote_count
      FROM upvotes
      GROUP BY post_id
    ) AS upvote_totals ON upvote_totals.post_id = p.id
    LEFT JOIN (
      SELECT post_id, COUNT(*)::int AS comment_count
      FROM comments
      GROUP BY post_id
    ) AS comment_totals ON comment_totals.post_id = p.id
    LEFT JOIN upvotes AS viewer_vote
      ON viewer_vote.post_id = p.id
      AND viewer_vote.clerk_id = ${viewerId}
    WHERE p.id = ${postId}
    LIMIT 1
  `;

  const post = postRows[0];

  if (!post) {
    return null;
  }

  const commentRows = await sql<CommentRow[]>`
    SELECT
      id,
      post_id,
      body,
      clerk_id,
      created_at
    FROM comments
    WHERE post_id = ${postId}
    ORDER BY created_at ASC
  `;

  const [hydratedPost] = await hydratePostRows([post]);
  const comments = await hydrateCommentRows(commentRows);

  return {
    ...hydratedPost,
    comments,
  } satisfies PostDetail;
}

export async function getEditablePost(postId: string) {
  const sql = db();

  const [post] = await sql<{
    id: string;
    title: string;
    body: string;
    category: Category;
    clerk_id: string | null;
  }[]>`
    SELECT id, title, body, category, clerk_id
    FROM posts
    WHERE id = ${postId}
    LIMIT 1
  `;

  return post ?? null;
}

export async function createPost(input: {
  title: string;
  body: string;
  category: Category;
  userId: string | null;
}) {
  const sql = db();

  const [post] = await sql<{ id: string }[]>`
    INSERT INTO posts (title, body, category, clerk_id)
    VALUES (
      ${input.title},
      ${input.body},
      ${input.category},
      ${input.userId}
    )
    RETURNING id
  `;

  return post;
}

export async function updatePost(postId: string, input: { title: string; body: string; category: Category }) {
  const sql = db();

  const [post] = await sql<{ id: string }[]>`
    UPDATE posts
    SET
      title = ${input.title},
      body = ${input.body},
      category = ${input.category},
      updated_at = NOW()
    WHERE id = ${postId}
    RETURNING id
  `;

  return post ?? null;
}

export async function deletePost(postId: string) {
  const sql = db();

  const [post] = await sql<{ id: string }[]>`
    DELETE FROM posts
    WHERE id = ${postId}
    RETURNING id
  `;

  return post ?? null;
}

export async function createComment(input: {
  postId: string;
  body: string;
  userId: string | null;
}) {
  const sql = db();

  const [comment] = await sql<{ id: string }[]>`
    INSERT INTO comments (post_id, body, clerk_id)
    VALUES (
      ${input.postId},
      ${input.body},
      ${input.userId}
    )
    RETURNING id
  `;

  return comment ?? null;
}

export async function getEditableComment(commentId: string) {
  const sql = db();

  const [comment] = await sql<{
    id: string;
    post_id: string;
    body: string;
    clerk_id: string | null;
  }[]>`
    SELECT id, post_id, body, clerk_id
    FROM comments
    WHERE id = ${commentId}
    LIMIT 1
  `;

  return comment ?? null;
}

export async function updateComment(commentId: string, input: { body: string }) {
  const sql = db();

  const [comment] = await sql<{ id: string }[]>`
    UPDATE comments
    SET body = ${input.body}
    WHERE id = ${commentId}
    RETURNING id
  `;

  return comment ?? null;
}

export async function deleteComment(commentId: string) {
  const sql = db();

  const [comment] = await sql<{ id: string }[]>`
    DELETE FROM comments
    WHERE id = ${commentId}
    RETURNING id
  `;

  return comment ?? null;
}

export async function toggleUpvote(postId: string, userId: string) {
  const sql = db();

  return sql.begin(async (transaction) => {
    const tx = transaction as unknown as ReturnType<typeof db>;
    const existing = await tx<{ clerk_id: string }[]>`
      SELECT clerk_id
      FROM upvotes
      WHERE post_id = ${postId}
        AND clerk_id = ${userId}
      LIMIT 1
    `;

    if (existing.length > 0) {
      await tx`
        DELETE FROM upvotes
        WHERE post_id = ${postId}
          AND clerk_id = ${userId}
      `;
    } else {
      await tx`
        INSERT INTO upvotes (clerk_id, post_id)
        VALUES (${userId}, ${postId})
      `;
    }

    const [counts] = await tx<{ upvote_count: number }[]>`
      SELECT COUNT(*)::int AS upvote_count
      FROM upvotes
      WHERE post_id = ${postId}
    `;

    return {
      active: existing.length === 0,
      upvoteCount: counts?.upvote_count ?? 0,
    };
  });
}

export async function listRecentPostsForAdmin(limit = 18) {
  const sql = db();
  const rows = await sql<PostRow[]>`
    SELECT
      p.id,
      p.title,
      p.body,
      p.category,
      p.clerk_id,
      p.created_at,
      p.updated_at,
      COALESCE(upvote_totals.upvote_count, 0)::int AS upvote_count,
      COALESCE(comment_totals.comment_count, 0)::int AS comment_count,
      false AS viewer_has_upvoted
    FROM posts p
    LEFT JOIN (
      SELECT post_id, COUNT(*)::int AS upvote_count
      FROM upvotes
      GROUP BY post_id
    ) AS upvote_totals ON upvote_totals.post_id = p.id
    LEFT JOIN (
      SELECT post_id, COUNT(*)::int AS comment_count
      FROM comments
      GROUP BY post_id
    ) AS comment_totals ON comment_totals.post_id = p.id
    ORDER BY p.created_at DESC
    LIMIT ${limit}
  `;

  return hydratePostRows(rows);
}

export async function listRecentCommentsForAdmin(limit = 20) {
  const sql = db();
  const rows = await sql<(CommentRow & { post_title: string })[]>`
    SELECT
      c.id,
      c.post_id,
      c.body,
      c.clerk_id,
      c.created_at,
      p.title AS post_title
    FROM comments c
    INNER JOIN posts p ON p.id = c.post_id
    ORDER BY c.created_at DESC
    LIMIT ${limit}
  `;

  const comments = await hydrateCommentRows(rows);

  return comments.map((comment, index) => ({
    ...comment,
    postTitle: rows[index]?.post_title ?? "Untitled post",
  }));
}

export async function listRecentActivity(limit = 16) {
  const sql = db();
  const rows = await sql<ActivityRow[]>`
    SELECT
      combined.id,
      combined.kind,
      combined.post_id,
      combined.post_title,
      combined.body,
      combined.clerk_id,
      combined.created_at
    FROM (
      SELECT
        p.id,
        'post'::text AS kind,
        p.id AS post_id,
        p.title AS post_title,
        p.body,
        p.clerk_id,
        p.created_at
      FROM posts p

      UNION ALL

      SELECT
        c.id,
        'comment'::text AS kind,
        c.post_id,
        p.title AS post_title,
        c.body,
        c.clerk_id,
        c.created_at
      FROM comments c
      INNER JOIN posts p ON p.id = c.post_id
    ) AS combined
    ORDER BY combined.created_at DESC
    LIMIT ${limit}
  `;

  return hydrateActivityRows(
    rows.map((row) => ({
      ...row,
      kind: row.kind === "comment" ? "comment" : "post",
    })),
  );
}
