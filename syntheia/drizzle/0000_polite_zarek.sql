CREATE TABLE `accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`access_token_expires_at` text,
	`refresh_token_expires_at` text,
	`scope` text,
	`id_token` text,
	`password` text,
	`created_at` text DEFAULT '2026-01-26T00:57:37.708Z' NOT NULL,
	`updated_at` text DEFAULT '2026-01-26T00:57:37.708Z' NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `api_keys` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`name` text NOT NULL,
	`key_hash` text NOT NULL,
	`key_prefix` text NOT NULL,
	`scopes` text DEFAULT 'read,write' NOT NULL,
	`last_used_at` text,
	`expires_at` text,
	`created_at` text DEFAULT '2026-01-26T00:57:37.709Z' NOT NULL,
	`revoked_at` text,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `api_usage_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`study_id` text,
	`api_key_id` text,
	`endpoint` text NOT NULL,
	`credits_used` integer NOT NULL,
	`metadata` text,
	`created_at` text DEFAULT '2026-01-26T00:57:37.709Z' NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`study_id`) REFERENCES `studies`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`api_key_id`) REFERENCES `api_keys`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `organization_members` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`user_id` text NOT NULL,
	`role` text DEFAULT 'member' NOT NULL,
	`created_at` text DEFAULT '2026-01-26T00:57:37.708Z' NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `organizations` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`plan` text DEFAULT 'starter' NOT NULL,
	`credits_remaining` integer DEFAULT 1000 NOT NULL,
	`credits_monthly` integer DEFAULT 1000 NOT NULL,
	`stripe_customer_id` text,
	`stripe_subscription_id` text,
	`created_at` text DEFAULT '2026-01-26T00:57:37.708Z' NOT NULL,
	`updated_at` text DEFAULT '2026-01-26T00:57:37.708Z' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `organizations_slug_unique` ON `organizations` (`slug`);--> statement-breakpoint
CREATE TABLE `responses` (
	`id` text PRIMARY KEY NOT NULL,
	`study_id` text NOT NULL,
	`respondent_id` text NOT NULL,
	`question_id` text NOT NULL,
	`rating` integer,
	`text_response` text,
	`explanation` text,
	`confidence` real,
	`distribution` text,
	`created_at` text DEFAULT '2026-01-26T00:57:37.708Z' NOT NULL,
	FOREIGN KEY (`study_id`) REFERENCES `studies`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`respondent_id`) REFERENCES `synthetic_respondents`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` text NOT NULL,
	`token` text NOT NULL,
	`created_at` text DEFAULT '2026-01-26T00:57:37.707Z' NOT NULL,
	`updated_at` text DEFAULT '2026-01-26T00:57:37.707Z' NOT NULL,
	`ip_address` text,
	`user_agent` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sessions_token_unique` ON `sessions` (`token`);--> statement-breakpoint
CREATE TABLE `studies` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`created_by_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`questions` text NOT NULL,
	`panel_config` text,
	`sample_size` integer DEFAULT 100 NOT NULL,
	`credits_used` integer DEFAULT 0,
	`product_name` text,
	`product_description` text,
	`brand_name` text,
	`industry` text,
	`product_category` text,
	`custom_context_instructions` text,
	`created_at` text DEFAULT '2026-01-26T00:57:37.708Z' NOT NULL,
	`updated_at` text DEFAULT '2026-01-26T00:57:37.708Z' NOT NULL,
	`completed_at` text,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`created_by_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `synthetic_respondents` (
	`id` text PRIMARY KEY NOT NULL,
	`study_id` text NOT NULL,
	`persona_data` text NOT NULL,
	`created_at` text DEFAULT '2026-01-26T00:57:37.708Z' NOT NULL,
	FOREIGN KEY (`study_id`) REFERENCES `studies`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`name` text,
	`image` text,
	`email_verified` integer DEFAULT false,
	`created_at` text DEFAULT '2026-01-26T00:57:37.706Z' NOT NULL,
	`updated_at` text DEFAULT '2026-01-26T00:57:37.707Z' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `verifications` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` text NOT NULL,
	`created_at` text DEFAULT '2026-01-26T00:57:37.708Z' NOT NULL,
	`updated_at` text DEFAULT '2026-01-26T00:57:37.708Z' NOT NULL
);
