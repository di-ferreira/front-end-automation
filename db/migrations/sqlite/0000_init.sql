CREATE TABLE `assets` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`execution_id` text NOT NULL,
	`type` text NOT NULL,
	`file_path` text NOT NULL,
	`mime_type` text,
	`size_bytes` integer,
	`approval_status` text DEFAULT 'pending' NOT NULL,
	`approved_by_id` integer,
	`approved_at` integer,
	`metadata` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`execution_id`) REFERENCES `executions`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`approved_by_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `assets_execution_id_idx` ON `assets` (`execution_id`);--> statement-breakpoint
CREATE INDEX `assets_type_idx` ON `assets` (`type`);--> statement-breakpoint
CREATE TABLE `executions` (
	`id` text PRIMARY KEY NOT NULL,
	`status` text DEFAULT 'queued' NOT NULL,
	`title` text,
	`prompt_id` integer,
	`prompt_text` text,
	`n8n_payload` text,
	`error` text,
	`started_at` integer,
	`finished_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`prompt_id`) REFERENCES `prompts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `executions_status_idx` ON `executions` (`status`);--> statement-breakpoint
CREATE INDEX `executions_created_at_idx` ON `executions` (`created_at`);--> statement-breakpoint
CREATE TABLE `prompts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`content` text NOT NULL,
	`tags` text,
	`use_count` integer DEFAULT 0 NOT NULL,
	`last_used_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `prompts_name_unique` ON `prompts` (`name`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`role` text DEFAULT 'admin' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);