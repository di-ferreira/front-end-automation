-- Asset Studio: channels, workflow_configs, asset_generations, workflow_executions

CREATE TABLE `channels` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `description` varchar(500),
  `color` varchar(7),
  `icon` varchar(50),
  `enabled` int NOT NULL DEFAULT 1,
  `metadata` json,
  `created_at` datetime(3) NOT NULL,
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `channels_slug_unique` (`slug`)
);

CREATE TABLE `workflow_configs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `channel_id` int NOT NULL,
  `asset_type` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(150) NOT NULL,
  `webhook_url` varchar(2048) NOT NULL,
  `method` varchar(10) NOT NULL DEFAULT 'POST',
  `headers` json,
  `enabled` int NOT NULL DEFAULT 1,
  `priority` int NOT NULL DEFAULT 0,
  `timeout_ms` int NOT NULL DEFAULT 10000,
  `metadata` json,
  `created_at` datetime(3) NOT NULL,
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `workflow_configs_slug_unique` (`slug`),
  INDEX `workflow_configs_channel_id_idx` (`channel_id`),
  CONSTRAINT `workflow_configs_channel_id_channels_id_fk` FOREIGN KEY (`channel_id`) REFERENCES `channels` (`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `asset_generations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `channel_id` int NOT NULL,
  `asset_type` varchar(50) NOT NULL,
  `prompt_text` text,
  `file_path` varchar(2048),
  `mime_type` varchar(100),
  `size_bytes` int,
  `status` varchar(20) NOT NULL DEFAULT 'pending',
  `error` text,
  `workflow_config_id` int,
  `metadata` json,
  `approved_by_id` int,
  `approved_at` datetime(3),
  `created_at` datetime(3) NOT NULL,
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `asset_generations_channel_id_idx` (`channel_id`),
  INDEX `asset_generations_status_idx` (`status`),
  CONSTRAINT `asset_generations_channel_id_channels_id_fk` FOREIGN KEY (`channel_id`) REFERENCES `channels` (`id`) ON UPDATE no action ON DELETE cascade,
  CONSTRAINT `asset_generations_workflow_config_id_workflow_configs_id_fk` FOREIGN KEY (`workflow_config_id`) REFERENCES `workflow_configs` (`id`) ON UPDATE no action ON DELETE no action,
  CONSTRAINT `asset_generations_approved_by_id_users_id_fk` FOREIGN KEY (`approved_by_id`) REFERENCES `users` (`id`) ON UPDATE no action ON DELETE no action
);

CREATE TABLE `workflow_executions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `workflow_config_id` int NOT NULL,
  `asset_generation_id` int,
  `status` varchar(20) NOT NULL DEFAULT 'pending',
  `request_payload` json,
  `response_payload` json,
  `error` text,
  `started_at` datetime(3),
  `completed_at` datetime(3),
  `duration_ms` int,
  `created_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `workflow_executions_config_id_idx` (`workflow_config_id`),
  CONSTRAINT `workflow_executions_workflow_config_id_workflow_configs_id_fk` FOREIGN KEY (`workflow_config_id`) REFERENCES `workflow_configs` (`id`) ON UPDATE no action ON DELETE cascade,
  CONSTRAINT `workflow_executions_asset_generation_id_asset_generations_id_fk` FOREIGN KEY (`asset_generation_id`) REFERENCES `asset_generations` (`id`) ON UPDATE no action ON DELETE set null
);
