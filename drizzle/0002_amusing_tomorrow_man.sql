CREATE TABLE "tournament12_operations" (
	"operation" uuid PRIMARY KEY NOT NULL,
	"actor_id" text NOT NULL,
	"command" jsonb NOT NULL,
	"revision" integer NOT NULL,
	"before_payload" jsonb NOT NULL,
	"after_payload" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tournament12_operations_revision_unique" UNIQUE("revision")
);
--> statement-breakpoint
CREATE TABLE "tournament12_state" (
	"id" text PRIMARY KEY NOT NULL,
	"payload" jsonb NOT NULL,
	"revision" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
