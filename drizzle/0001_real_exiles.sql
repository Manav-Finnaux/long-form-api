CREATE TABLE "sms_config" (
	"key" text NOT NULL,
	"route" text NOT NULL,
	"sender_id" text NOT NULL,
	"sms" text NOT NULL,
	"template_id" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
ALTER TABLE "short_form" ADD COLUMN "employee_id" text;