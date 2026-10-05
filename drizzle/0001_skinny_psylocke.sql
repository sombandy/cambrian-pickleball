ALTER TABLE "posts" ADD COLUMN "tournament_slug" text;--> statement-breakpoint
CREATE INDEX "posts_tournament_slug_idx" ON "posts" USING btree ("tournament_slug","created_at");