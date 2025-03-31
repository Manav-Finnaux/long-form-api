CREATE TABLE "otp" (
	"target" text PRIMARY KEY NOT NULL,
	"otp" varchar(255) NOT NULL,
	"otp_expire_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "short_form" DROP COLUMN "otp";--> statement-breakpoint
ALTER TABLE "short_form" DROP COLUMN "otp_expire_at";--> statement-breakpoint
ALTER TABLE "short_form" DROP COLUMN "has_requested_callback";