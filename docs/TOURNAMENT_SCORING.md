# Tournament 12 scoring — Railway handoff

The app is part of the existing Next.js site at `/tournament/12/scores`. No Supabase project or separate backend service is needed. The owner merges and deploys this PR to the existing Railway application and PostgreSQL database.

## Owner's deployment steps

1. Keep the existing `DATABASE_URL`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`. Use the same Clerk application as the rest of this website.
2. Set `TOURNAMENT_EDITOR_USER_IDS` to the shared editor account's Clerk **user ID** (`user_...`, available in Clerk Dashboard → Users → select the account). Multiple IDs can be separated by commas. Site admin access does not automatically grant scoring access. If this variable is blank, **all score writes are denied**.
3. Set `NEXT_PUBLIC_APP_URL` to the site's actual HTTPS origin. Ensure that domain is allowed in the existing Clerk application.
4. Install/build with Node 22 and the pinned pnpm 10: `pnpm install --frozen-lockfile`, then `pnpm build`. Railway should provide the `NEXT_PUBLIC_*` variables during the build, as with the existing site.
5. Set Railway's **pre-deploy command** to `pnpm db:migrate`. This applies the committed `0002` migration, adding `tournament12_state` and `tournament12_operations`. It does not change or reset feedback data. Keep the existing start command (`pnpm start`); Next.js reads Railway's `PORT` automatically. Do not generate a fresh migration on the server.
6. Open `/tournament/12/scores?practice=1` to rehearse. This mode uses only the current browser's practice data. A public `?practice=1` link never bypasses live API authentication.
7. Before tournament day, perform the live acceptance checks in [TOURNAMENT_TEST_PLAN.md](TOURNAMENT_TEST_PLAN.md). First test live saves on a separate Railway preview/staging database. The live tournament starts empty with the supplied official roster. There is deliberately no public reset button.

No new Railway project, database, plan, paid add-on or deployment was created for this change. Existing Railway usage/billing remains controlled by the owner.

## Optional Google Sheets button

Downloading `.xlsx`, CSV and a complete JSON backup needs no Google credentials. Import `.xlsx` into Google Sheets; the workbook contains all fixtures, formulas for league standings, round-specific rosters, swap and change history, and playoff guidance.

For the direct export button:

1. In Google Cloud, enable **Google Sheets API** and create an OAuth **Web application** client.
2. Set authorized JavaScript origins to the actual HTTPS website origin, and optionally `http://localhost:3000` for testing. Add testing users if the OAuth consent application is still in testing.
3. Set `NEXT_PUBLIC_GOOGLE_CLIENT_ID` to that public client ID and rebuild. No Google client secret is used by the app.
4. Test on an actual phone: tap Export → Export to Google Sheets, authorize, then verify all 11 tabs. It creates a new private spreadsheet for the signed-in Google user each time. It does not publish a Sheet or change sharing permissions.

The app requests only `drive.file`, allowing access to files created with this app. Tokens stay in browser memory. Sheets exports are snapshots, not two-way sync. If Google fails, the download remains available; a partially created file is reported instead of showing a false success.

## Local preview without any credentials

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open `http://localhost:3000/tournament/12/scores?practice=1`. Tap **Try score entry**, enter your name, and score games. Practice scenarios can jump to league completion, semifinal swaps or final swaps. No local PostgreSQL or Clerk keys are needed for this preview. The existing feedback/admin pages still require the existing services.

Without a database, the live scoreboard reports a connection problem and disables editing; it does not silently become practice data.

## Persistence and recovery

The browser sends an action, expected revision and unique operation ID to a same-origin Next.js API. The server verifies the Clerk session and explicit editor allowlist, validates the action, and computes the new state using the same tournament rules as the UI. Client-supplied state snapshots are rejected.

A PostgreSQL transaction locks the tournament row. The new state, revision and before/after audit are committed together. Each operation ID is unique, so a timeout can safely be checked again without duplicating a result. The audit records both the authenticated shared account ID and the operator's self-reported name. It is not proof of individual identity when people share an account.

If another editor saves first, the stale write is rejected and the app asks the user to review the latest state. An uncertain save is retained on the device and blocks further edits until **Check save** resolves it. Offline clients can inspect cached scores and retain form drafts; they cannot confirm or queue new live results while disconnected. Scores refresh every 15 seconds while visible, and on focus/reconnection.

Published fixture numbers correspond directly to the scorer's internal keys: published L01 = stored/exported L1, through L60. The scorer imports the site's published fixture array instead of maintaining a second schedule. Both the existing Players page and the scorer use the supplied official roster directory.

Score corrections are permitted only in the current active round. Advancing locks the earlier round. Position swaps preserve original league identities and have a maximum of two swaps per team across playoffs. Download a backup before advancing. Corrections to a locked round require organizer review and database restoration/recovery, not an automatic rewrite of a bracket already being played.

For emergency recovery, the owner can inspect `tournament12_operations` by revision; each row contains the full before/after state. Take a database backup before any manual repair. There is no browser JSON import that could accidentally overwrite the tournament.

## Verification status and limits

Automated tests run the actual SQL migrations and transaction service against PGlite (a PostgreSQL engine in-process), plus scoring, store and spreadsheet formula tests. They do not connect to the owner's Railway database. The production build can be checked with a synthetic publishable key solely to validate compilation/prerendering; that does not validate Clerk login. Real Railway networking, Clerk editor login/revocation, Google OAuth consent and physical iOS/Android behavior must be accepted with the owner's credentials before tournament use.
