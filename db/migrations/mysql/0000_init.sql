CREATE TABLE `assets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`execution_id` varchar(36) NOT NULL,
	`type` varchar(20) NOT NULL,
	`file_path` text NOT NULL,
	`mime_type` varchar(100),
	`size_bytes` int,
	`approval_status` varchar(20) NOT NULL DEFAULT 'pending',
	`approved_by_id` int,
	`approved_at` datetime(3),
	`metadata` json,
	`created_at` datetime(3) NOT NULL,
	CONSTRAINT `assets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `executions` (
	`id` varchar(36) NOT NULL,
	`status` varchar(20) NOT NULL DEFAULT 'queued',
	`title` varchar(500),
	`prompt_id` int,
	`prompt_text` text,
	`n8n_payload` text,
	`error` text,
	`started_at` datetime(3),
	`finished_at` datetime(3),
	`created_at` datetime(3) NOT NULL,
	`updated_at` datetime(3) NOT NULL,
	CONSTRAINT `executions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `prompts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`type` varchar(20) NOT NULL,
	`content` text NOT NULL,
	`tags` varchar(500),
	`use_count` int NOT NULL DEFAULT 0,
	`last_used_at` datetime(3),
	`created_at` datetime(3) NOT NULL,
	`updated_at` datetime(3) NOT NULL,
	CONSTRAINT `prompts_id` PRIMARY KEY(`id`),
	CONSTRAINT `prompts_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`password_hash` varchar(255) NOT NULL,
	`role` varchar(20) NOT NULL DEFAULT 'admin',
	`created_at` datetime(3) NOT NULL,
	`updated_at` datetime(3) NOT NULL,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
ALTER TABLE `assets` ADD CONSTRAINT `assets_execution_id_executions_id_fk` FOREIGN KEY (`execution_id`) REFERENCES `executions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `assets` ADD CONSTRAINT `assets_approved_by_id_users_id_fk` FOREIGN KEY (`approved_by_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `executions` ADD CONSTRAINT `executions_prompt_id_prompts_id_fk` FOREIGN KEY (`prompt_id`) REFERENCES `prompts`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `assets_execution_id_idx` ON `assets` (`execution_id`);--> statement-breakpoint
CREATE INDEX `assets_type_idx` ON `assets` (`type`);--> statement-breakpoint
CREATE INDEX `executions_status_idx` ON `executions` (`status`);--> statement-breakpoint
CREATE INDEX `executions_created_at_idx` ON `executions` (`created_at`);