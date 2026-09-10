CREATE TABLE `assets` (
	`id` text PRIMARY KEY NOT NULL,
	`parent_type` text NOT NULL,
	`parent_id` text NOT NULL,
	`purpose` text NOT NULL,
	`person` text NOT NULL,
	`filename` text NOT NULL,
	`mime` text NOT NULL,
	`size` integer NOT NULL,
	`object_key` text NOT NULL,
	`digest` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `assets_parent_digest_unique` ON `assets` (`parent_type`,`parent_id`,`digest`);--> statement-breakpoint
CREATE TABLE `entries` (
	`id` text PRIMARY KEY NOT NULL,
	`kind` text NOT NULL,
	`data` text NOT NULL,
	`dedupe_key` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`revision` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `entries_dedupe_key_unique` ON `entries` (`dedupe_key`);--> statement-breakpoint
CREATE TABLE `export_tickets` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` text NOT NULL
);
