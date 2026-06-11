ALTER TABLE "companies" RENAME TO "company";--> statement-breakpoint
ALTER TABLE "company" DROP CONSTRAINT "companies_name_unique";--> statement-breakpoint
ALTER TABLE "jobs" DROP CONSTRAINT "jobs_company_id_companies_company_id_fk";
--> statement-breakpoint
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_company_id_company_company_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."company"("company_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company" ADD CONSTRAINT "company_name_unique" UNIQUE("name");