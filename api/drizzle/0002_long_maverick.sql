CREATE TABLE IF NOT EXISTS "imageJobs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user" integer NOT NULL,
	"name" text NOT NULL,
	"images" jsonb,
	"status" text NOT NULL,
	"options" jsonb NOT NULL
);
--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "type" text DEFAULT 'dog' NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "imageJobs" ADD CONSTRAINT "imageJobs_user_users_id_fk" FOREIGN KEY ("user") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
