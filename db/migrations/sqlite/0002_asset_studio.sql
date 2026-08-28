-- Asset Studio: channels, workflow_configs, asset_generations, workflow_executions

CREATE TABLE `channels` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `name` text NOT NULL,
  `slug` text NOT NULL,
  `description` text,
  `color` text,
  `icon` text,
  `enabled` integer NOT NULL DEFAULT 1,
  `metadata` text,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `channels_slug_unique` ON `channels` (`slug`);
--> statement-breakpoint
CREATE TABLE `workflow_configs` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `channel_id` integer NOT NULL,
  `asset_type` text NOT NULL,
  `name` text NOT NULL,
  `slug` text NOT NULL,
  `webhook_url` text NOT NULL,
  `method` text NOT NULL DEFAULT 'POST',
  `headers` text,
  `enabled` integer NOT NULL DEFAULT 1,
  `priority` integer NOT NULL DEFAULT 0,
  `timeout_ms` integer NOT NULL DEFAULT 10000,
  `metadata` text,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL,
  FOREIGN KEY (`channel_id`) REFERENCES `channels`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `workflow_configs_slug_unique` ON `workflow_configs` (`slug`);
--> statement-breakpoint
CREATE INDEX `workflow_configs_channel_id_idx` ON `workflow_configs` (`channel_id`);
--> statement-breakpoint
CREATE TABLE `asset_generations` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `channel_id` integer NOT NULL,
  `asset_type` text NOT NULL,
  `prompt_text` text,
  `file_path` text,
  `mime_type` text,
  `size_bytes` integer,
  `status` text NOT NULL DEFAULT 'pending',
  `error` text,
  `workflow_config_id` integer,
  `metadata` text,
  `approved_by_id` integer,
  `approved_at` integer,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL,
  FOREIGN KEY (`channel_id`) REFERENCES `channels`(`id`) ON UPDATE no action ON DELETE cascade,
  FOREIGN KEY (`workflow_config_id`) REFERENCES `workflow_configs`(`id`) ON UPDATE no action ON DELETE no action,
  FOREIGN KEY (`approved_by_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `asset_generations_channel_id_idx` ON `asset_generations` (`channel_id`);
--> statement-breakpoint
CREATE INDEX `asset_generations_status_idx` ON `asset_generations` (`status`);
--> statement-breakpoint
CREATE TABLE `workflow_executions` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `workflow_config_id` integer NOT NULL,
  `asset_generation_id` integer,
  `status` text NOT NULL DEFAULT 'pending',
  `request_payload` text,
  `response_payload` text,
  `error` text,
  `started_at` integer,
  `completed_at` integer,
  `duration_ms` integer,
  `created_at` integer NOT NULL,
  FOREIGN KEY (`workflow_config_id`) REFERENCES `workflow_configs`(`id`) ON UPDATE no action ON DELETE cascade,
  FOREIGN KEY (`asset_generation_id`) REFERENCES `asset_generations`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `workflow_executions_config_id_idx` ON `workflow_executions` (`workflow_config_id`);
