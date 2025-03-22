CREATE TYPE "public"."message_status" AS ENUM('success', 'error');--> statement-breakpoint
CREATE TABLE "api_keys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"client_name" text NOT NULL,
	"active" boolean DEFAULT true,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "api_keys_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "message_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"src_number" varchar(20) NOT NULL,
	"dest_number" varchar(20) NOT NULL,
	"status" "message_status" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "idx_message_log_dest_number" ON "message_log" USING btree ("dest_number");--> statement-breakpoint
CREATE INDEX "idx_message_log_status" ON "message_log" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_message_log_created_at" ON "message_log" USING btree ("created_at");