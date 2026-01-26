-- Create panel_configs table for storing reusable persona configurations
CREATE TABLE IF NOT EXISTS `panel_configs` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`config` text NOT NULL,
	`is_template` integer DEFAULT false,
	`industry` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade
);
