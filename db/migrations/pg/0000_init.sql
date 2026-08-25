CREATE TABLE "assets" (
	"id" serial PRIMARY KEY NOT NULL,
	"execution_id" text NOT NULL,
	"type" text NOT NULL,
	"file_path" text NOT NULL,
	"mime_type" text,
	"size_bytes" integer,
	"approval_status" text DEFAULT 'pending' NOT NULL,
	"approved_by_id" integer,
	"approved_at" timestamp with time zone,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "executions" (
	"id" text PRIMARY KEY NOT NULL,
	"status" text DEFAULT 'queued' NOT NULL,
	"title" text,
	"prompt_id" integer,
	"prompt_text" text,
	"n8n_payload" text,
	"error" text,
	"started_at" timestamp with time zone,
	"finished_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prompts" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"content" text NOT NULL,
	"tags" text,
	"use_count" integer DEFAULT 0 NOT NULL,
	"last_used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" text DEFAULT 'admin' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "assets" ADD CONSTRAINT "assets_execution_id_executions_id_fk" FOREIGN KEY ("execution_id") REFERENCES "public"."executions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assets" ADD CONSTRAINT "assets_approved_by_id_users_id_fk" FOREIGN KEY ("approved_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "executions" ADD CONSTRAINT "executions_prompt_id_prompts_id_fk" FOREIGN KEY ("prompt_id") REFERENCES "public"."prompts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "assets_execution_id_idx" ON "assets" USING btree ("execution_id");--> statement-breakpoint
CREATE INDEX "assets_type_idx" ON "assets" USING btree ("type");--> statement-breakpoint
CREATE INDEX "executions_status_idx" ON "executions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "executions_created_at_idx" ON "executions" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "prompts_name_unique" ON "prompts" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique" ON "users" USING btree ("email");