-- Asset Studio: channels, workflow_configs, asset_generations, workflow_executions

CREATE TABLE "channels" (
  "id" serial PRIMARY KEY,
  "name" text NOT NULL,
  "slug" text NOT NULL,
  "description" text,
  "color" text,
  "icon" text,
  "enabled" boolean NOT NULL DEFAULT true,
  "metadata" jsonb,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX "channels_slug_unique" ON "channels" ("slug");

CREATE TABLE "workflow_configs" (
  "id" serial PRIMARY KEY,
  "channel_id" integer NOT NULL,
  "asset_type" text NOT NULL,
  "name" text NOT NULL,
  "slug" text NOT NULL,
  "webhook_url" text NOT NULL,
  "method" text NOT NULL DEFAULT 'POST',
  "headers" jsonb,
  "enabled" boolean NOT NULL DEFAULT true,
  "priority" integer NOT NULL DEFAULT 0,
  "timeout_ms" integer NOT NULL DEFAULT 10000,
  "metadata" jsonb,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "workflow_configs_channel_id_channels_id_fk" FOREIGN KEY ("channel_id") REFERENCES "channels"("id") ON UPDATE no action ON DELETE cascade
);
CREATE UNIQUE INDEX "workflow_configs_slug_unique" ON "workflow_configs" ("slug");
CREATE INDEX "workflow_configs_channel_id_idx" ON "workflow_configs" ("channel_id");

CREATE TABLE "asset_generations" (
  "id" serial PRIMARY KEY,
  "channel_id" integer NOT NULL,
  "asset_type" text NOT NULL,
  "prompt_text" text,
  "file_path" text,
  "mime_type" text,
  "size_bytes" integer,
  "status" text NOT NULL DEFAULT 'pending',
  "error" text,
  "workflow_config_id" integer,
  "metadata" jsonb,
  "approved_by_id" integer,
  "approved_at" timestamp with time zone,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "asset_generations_channel_id_channels_id_fk" FOREIGN KEY ("channel_id") REFERENCES "channels"("id") ON UPDATE no action ON DELETE cascade,
  CONSTRAINT "asset_generations_workflow_config_id_workflow_configs_id_fk" FOREIGN KEY ("workflow_config_id") REFERENCES "workflow_configs"("id") ON UPDATE no action ON DELETE no action,
  CONSTRAINT "asset_generations_approved_by_id_users_id_fk" FOREIGN KEY ("approved_by_id") REFERENCES "users"("id") ON UPDATE no action ON DELETE no action
);
CREATE INDEX "asset_generations_channel_id_idx" ON "asset_generations" ("channel_id");
CREATE INDEX "asset_generations_status_idx" ON "asset_generations" ("status");

CREATE TABLE "workflow_executions" (
  "id" serial PRIMARY KEY,
  "workflow_config_id" integer NOT NULL,
  "asset_generation_id" integer,
  "status" text NOT NULL DEFAULT 'pending',
  "request_payload" jsonb,
  "response_payload" jsonb,
  "error" text,
  "started_at" timestamp with time zone,
  "completed_at" timestamp with time zone,
  "duration_ms" integer,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "workflow_executions_workflow_config_id_workflow_configs_id_fk" FOREIGN KEY ("workflow_config_id") REFERENCES "workflow_configs"("id") ON UPDATE no action ON DELETE cascade,
  CONSTRAINT "workflow_executions_asset_generation_id_asset_generations_id_fk" FOREIGN KEY ("asset_generation_id") REFERENCES "asset_generations"("id") ON UPDATE no action ON DELETE set null
);
CREATE INDEX "workflow_executions_config_id_idx" ON "workflow_executions" ("workflow_config_id");
