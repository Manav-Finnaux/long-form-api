CREATE TABLE "location" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "location_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"pincode" text NOT NULL,
	"name" text NOT NULL,
	"block" text NOT NULL,
	"state" text NOT NULL,
	"district" text NOT NULL,
	"tehsil" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "location_pincode_unique" UNIQUE("pincode")
);
--> statement-breakpoint
CREATE INDEX "location_pincode_index" ON "location" USING btree ("pincode");