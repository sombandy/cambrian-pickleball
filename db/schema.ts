import {
  bigserial,
  index,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const posts = pgTable(
  "posts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: text("title").notNull(),
    body: text("body").notNull(),
    category: text("category").notNull(),
    clerkId: text("clerk_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("posts_created_at_idx").on(table.createdAt),
    index("posts_category_idx").on(table.category),
  ],
);

export const comments = pgTable(
  "comments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    postId: uuid("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    clerkId: text("clerk_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("comments_post_id_idx").on(table.postId, table.createdAt)],
);

export const upvotes = pgTable(
  "upvotes",
  {
    clerkId: text("clerk_id").notNull(),
    postId: uuid("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.clerkId, table.postId] }),
    index("upvotes_post_id_idx").on(table.postId, table.createdAt),
  ],
);

export const rateLimitEvents = pgTable(
  "rate_limit_events",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    actorKey: text("actor_key").notNull(),
    scope: text("scope").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("rate_limit_events_actor_scope_idx").on(
      table.actorKey,
      table.scope,
      table.createdAt,
    ),
  ],
);
