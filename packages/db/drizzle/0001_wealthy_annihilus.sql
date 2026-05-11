CREATE TYPE "public"."application_status" AS ENUM('submitted', 'rejected', 'hired');--> statement-breakpoint
CREATE TYPE "public"."job_type" AS ENUM('full_time', 'part_time', 'internship', 'contract');--> statement-breakpoint
CREATE TYPE "public"."work_location" AS ENUM('remote', 'on_site', 'hybrid');--> statement-breakpoint
CREATE TABLE "companies" (
	"company_id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" varchar(255) NOT NULL,
	"website" varchar(255) NOT NULL,
	"logo" varchar(255) NOT NULL,
	"logo_public_id" varchar(255) NOT NULL,
	"recruiter_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "companies_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "jobs" (
	"job_id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"salary" numeric(10, 2) NOT NULL,
	"location" varchar(255),
	"job_type" "job_type" NOT NULL,
	"openings" integer NOT NULL,
	"role" varchar(255) NOT NULL,
	"work_location" "work_location" NOT NULL,
	"company_id" integer NOT NULL,
	"posted_by_recruiter" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_company_id_companies_company_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("company_id") ON DELETE cascade ON UPDATE no action;