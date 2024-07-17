CREATE TABLE IF NOT EXISTS "jobs" (
	"id" integer NOT NULL,
	"name" text NOT NULL,
	"images" text NOT NULL,
	"weights" text,
	"last_update" text,
	"updates" jsonb,
	CONSTRAINT "jobs_id_name_pk" PRIMARY KEY("id","name")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "jobs" ADD CONSTRAINT "jobs_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
