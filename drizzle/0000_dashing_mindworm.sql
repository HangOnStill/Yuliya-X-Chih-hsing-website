CREATE TABLE `journey` (
	`user_id` text PRIMARY KEY NOT NULL,
	`unlocked` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `photos` (
	`id` text PRIMARY KEY NOT NULL,
	`kind` text NOT NULL,
	`filename` text NOT NULL,
	`mime` text NOT NULL,
	`size` integer NOT NULL,
	`object_key` text NOT NULL,
	`digest` text NOT NULL,
	`title` text NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`tags` text DEFAULT '' NOT NULL,
	`taken_at` text DEFAULT '' NOT NULL,
	`favorite` integer DEFAULT 0 NOT NULL,
	`slot` integer,
	`created_at` text NOT NULL,
	`revision` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `photos_digest_unique` ON `photos` (`digest`);--> statement-breakpoint
CREATE UNIQUE INDEX `photos_slot_unique` ON `photos` (`slot`);--> statement-breakpoint
CREATE TABLE `wishes` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`notes` text NOT NULL,
	`category` text NOT NULL,
	`status` text NOT NULL,
	`priority` text NOT NULL,
	`url` text NOT NULL,
	`budget` real,
	`currency` text NOT NULL,
	`due_date` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`revision` integer DEFAULT 0 NOT NULL
);
