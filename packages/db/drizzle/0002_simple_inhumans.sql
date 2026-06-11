CREATE TABLE "applications" (
	"application_id" serial PRIMARY KEY NOT NULL,
	"job_id" integer NOT NULL,
	"applicant_id" integer NOT NULL,
	"applicant_email" varchar(255) NOT NULL,
	"status" "application_status" DEFAULT 'submitted' NOT NULL,
	"resume" varchar(255) NOT NULL,
	"applied_at" timestamp with time zone DEFAULT now() NOT NULL,
	"subscribed" boolean,
	CONSTRAINT "applications_job_id_applicant_id_unique" UNIQUE("job_id","applicant_id")
);
--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_job_id_jobs_job_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("job_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_applicant_id_users_user_id_fk" FOREIGN KEY ("applicant_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;