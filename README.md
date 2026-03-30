# Cambrian Pickleball Feedback Board

Community feedback board for Cambrian Park Pickleball tournaments.

Stack:

- Next.js 16 App Router
- PostgreSQL
- Clerk
- Tailwind CSS 4
- TipTap for lightweight rich text

## Features

- Public, server-rendered feed with sorting by newest, most upvoted, and most commented
- Anonymous posting and commenting without name capture
- Signed-in upvotes and signed-in post editing
- Per-post detail page with SEO metadata and full comment thread
- Admin dashboard for post/comment moderation and Clerk admin management
- Database-backed rate limiting for post and comment creation

## Local setup

1. Copy `.env.example` to `.env.local`.
2. Fill in Clerk keys and your PostgreSQL `DATABASE_URL`.
3. Generate and apply the Drizzle migration:

```bash
pnpm db:generate
pnpm db:migrate
```

4. Start the app:

```bash
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000).

## Required environment variables

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
DATABASE_URL=
ADMIN_BOOTSTRAP_EMAILS=
```

## Admins

Admin access is stored in Clerk `privateMetadata.is_admin`.

Initial admin bootstrap comes from `ADMIN_BOOTSTRAP_EMAILS`, a comma-separated list of email addresses. Any signed-in Clerk user whose email matches that list is treated as admin even before any Clerk metadata is set.

The app still supports Clerk-backed admin grants through `privateMetadata.is_admin`. Bootstrap admins are merged into the admin list, and they cannot be revoked from the UI while their email remains in `ADMIN_BOOTSTRAP_EMAILS`.

## Database

Drizzle Kit owns schema diffing and SQL migrations.

- Schema: `db/schema.ts`
- Config: `drizzle.config.ts`
- Generated migrations: `drizzle/`

## Scripts

```bash
pnpm dev
pnpm lint
pnpm typecheck
pnpm db:generate
pnpm db:migrate
pnpm db:studio
pnpm build
```
