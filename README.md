# Cambrian Community Pickleball

Website for Cambrian Community Pickleball: tournament pages (players, schedule, rules), a community feedback board, and player rankings.

Stack: Next.js 16 (App Router), PostgreSQL with Drizzle migrations, Clerk for sign-in, Tailwind CSS 4, pnpm.

## Quick start with a coding agent

Paste the prompt below into Claude Code, Codex, or any coding agent. It clones the repo, sets up Postgres, and starts the site. No API keys are needed.

```text
Set up the cambrian-pickleball project for local development on this machine and get it running.

1. Clone https://github.com/sombandy/cambrian-pickleball.git (skip if I am already inside the repo) and work from the repo root.
2. Make sure Node.js 20.9 or newer and pnpm 10 are installed. If pnpm is missing, install it with `corepack enable pnpm` or `npm install -g pnpm`.
3. Get PostgreSQL running locally on port 5432. Check first whether one is already running (`pg_isready`). If not, start one using whichever of these is available, in this order:
   - Docker: `docker run -d --name cambrian-pg -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres:17`
   - Homebrew (macOS): `brew install postgresql@17 && brew services start postgresql@17`
   - Otherwise the system package manager.
4. Create an empty database named `cambrian_pickleball` (for example `createdb cambrian_pickleball`). If it already exists, reuse it; do not drop or reset any existing database.
5. Copy `.env.example` to `.env.local` and set `DATABASE_URL` to the database from step 4. For a Homebrew or system Postgres that is usually `postgresql://localhost:5432/cambrian_pickleball`; for the Docker command above it is `postgresql://postgres:postgres@localhost:5432/cambrian_pickleball`. Leave every other key blank. If `.env.local` already exists, keep it and only fill in what is missing.
6. Run `pnpm install`, then `pnpm db:migrate` to create the tables. Do not run `pnpm db:generate`.
7. Start the dev server with `pnpm dev` in the background and wait until it is ready. If port 3000 is taken, use `pnpm dev -p 3001` and report the port.
8. Verify: http://localhost:3000/ and http://localhost:3000/tournament/12/players must both return HTTP 200. Verify the database by listing its tables; you should see posts, comments, upvotes, and rate_limit_events.

Expected without Clerk keys, do not try to fix: /tournament-feedback, /tournament/12/feedback, /admin, and /sign-in return a 500 error, and /rankings redirects to an unlock page. Do not sign up for Clerk or any other service, and do not change application code to work around this.

When done, tell me the URL to open, which Postgres you used, and anything that failed.
```

## Manual setup

Needs Node.js 20.9+, pnpm 10, and a local PostgreSQL.

```bash
git clone https://github.com/sombandy/cambrian-pickleball.git
cd cambrian-pickleball
createdb cambrian_pickleball
cp .env.example .env.local   # then check DATABASE_URL
pnpm install
pnpm db:migrate
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

Set these in `.env.local`. Only `DATABASE_URL` is required.

| Variable | Needed for | Without it |
| --- | --- | --- |
| `DATABASE_URL` | Everything that touches the database | Migrations and feedback pages fail |
| `NEXT_PUBLIC_APP_URL` | Page metadata | Defaults to `http://localhost:3000` |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` | Sign-in, feedback board, admin | See below |
| `ADMIN_BOOTSTRAP_EMAILS` | Initial admins (comma-separated emails) | No bootstrap admins |
| `RANKINGS_API_URL`, `RANKINGS_PASSWORD`, `LEADERBOARD_API_KEY` | `/rankings` pages | Rankings stay locked or empty |

### Running without Clerk

Locally, Clerk is switched off when `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is blank (see `lib/clerk-enabled.ts`). In production it is always on.

| Works without Clerk keys | Needs Clerk keys |
| --- | --- |
| `/` home | `/tournament-feedback`, `/tournament/12/feedback` |
| `/tournament`, `/tournament/competitive-1` | `/posts/...` |
| `/tournament/12/players`, `/tournament/12/rules` | `/admin` |
| | `/sign-in`, `/sign-up` |

Pages in the right column return a 500 error until the keys are set. Ask Somnath for the Clerk and rankings keys, add them to `.env.local`, and restart `pnpm dev`.

## Project layout

- `app/` - routes. Tournament 12 lives in `app/tournament/12/` (`schedule.ts` for teams and matches, `content.ts` for rules text).
- `components/` - shared UI.
- `lib/` - data access (`data.ts`, `db.ts`), auth (`auth.ts`, `admin.ts`), rankings.
- `db/schema.ts` - Drizzle schema. Generated SQL migrations are in `drizzle/`.
- `proxy.ts` - request middleware (Clerk and the rankings password gate).

## Database changes

Drizzle Kit owns schema diffing and SQL migrations.

1. Edit `db/schema.ts`.
2. `pnpm db:generate` to write a new migration into `drizzle/`.
3. `pnpm db:migrate` to apply it.
4. Commit the schema change and the generated migration together.

`pnpm db:studio` opens a browser UI for the database.

## Admins

Admin access is stored in Clerk `privateMetadata.is_admin`.

`ADMIN_BOOTSTRAP_EMAILS` is a comma-separated list of emails. Any signed-in Clerk user whose email is on the list is an admin, even before any Clerk metadata is set. Bootstrap admins cannot be revoked from the UI while their email remains on the list.

## Scripts

```bash
pnpm dev          # start the dev server
pnpm build        # production build
pnpm lint
pnpm typecheck
pnpm db:generate  # create a migration from schema changes
pnpm db:migrate   # apply migrations
pnpm db:studio
```

## Tournament 12 live scoring

Open `/tournament/12/scores` for public scores, standings and playoff lineups. Editors use the existing Clerk login and must be listed in `TOURNAMENT_EDITOR_USER_IDS`. The backend uses the existing PostgreSQL `DATABASE_URL`.

For a local demo with no credentials or database, run `pnpm dev` and open `/tournament/12/scores?practice=1`. Tap **Try score entry**. Practice changes stay on that browser.

[Railway deployment and Google Sheets setup](docs/TOURNAMENT_SCORING.md) · [Tournament acceptance test plan](docs/TOURNAMENT_TEST_PLAN.md). Run automated checks with `pnpm test`.
