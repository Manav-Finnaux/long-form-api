CREATE TYPE "public"."application_status" AS ENUM('PENDING', 'IN_PROGRESS', 'REJECTED', 'COMPLETED', 'CLOSED');--> statement-breakpoint
CREATE TYPE "public"."enquiry_status" AS ENUM('PENDING', 'REJECTED', 'APPROVED');--> statement-breakpoint
CREATE TYPE "public"."gender" AS ENUM('MALE', 'FEMALE', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."marital_status" AS ENUM('MARRIED', 'SINGLE', 'DIVORCED', 'WIDOWED', 'SEPARATED');--> statement-breakpoint
CREATE TABLE "long_form" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "long_form_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"first_name" text NOT NULL,
	"last_name" text,
	"date_of_birth" date NOT NULL,
	"gender" text NOT NULL,
	"phone_number" varchar(10) NOT NULL,
	"email" text,
	"aadhar" text NOT NULL,
	"pan" text NOT NULL,
	"marital_status" "marital_status" NOT NULL,
	"relation" text NOT NULL,
	"relative_first_name" text NOT NULL,
	"relative_last_name" text,
	"address" text NOT NULL,
	"pincode" text NOT NULL,
	"area" text NOT NULL,
	"block" text NOT NULL,
	"district" text NOT NULL,
	"state" text NOT NULL,
	"purpose_of_loan" text NOT NULL,
	"loan_amount" numeric NOT NULL,
	"source_of_income" text NOT NULL,
	"monthly_income" numeric NOT NULL,
	"job_profile" text NOT NULL,
	"status" "application_status" DEFAULT 'PENDING' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"utm_medium" text,
	"utm_source" text,
	"utm_content" text,
	"utm_campaign" text
);
--> statement-breakpoint
CREATE TABLE "short_form" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "short_form_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"phone_number" varchar(10) NOT NULL,
	"email" text,
	"city" varchar(255) NOT NULL,
	"loan_amount" numeric,
	"otp" varchar(255),
	"is_otp_verified" boolean DEFAULT false NOT NULL,
	"otp_expire_at" timestamp with time zone,
	"has_requested_callback" boolean DEFAULT false NOT NULL,
	"want_whatsapp_updates" boolean DEFAULT false NOT NULL,
	"utm_medium" text,
	"utm_source" text,
	"utm_content" text,
	"utm_campaign" text,
	"status" "enquiry_status" DEFAULT 'PENDING' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
