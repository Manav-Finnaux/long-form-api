CREATE TABLE "application_configs" (
	"id" boolean PRIMARY KEY DEFAULT true NOT NULL,
	"application_rejected_days" integer DEFAULT 60 NOT NULL,
	"allow_application_creation_on_completed" boolean DEFAULT false NOT NULL
);
