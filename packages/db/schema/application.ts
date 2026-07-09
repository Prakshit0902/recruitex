import { boolean, integer, pgTable, serial, timestamp, unique, varchar} from "drizzle-orm/pg-core";
import { applicationStatusEnum } from "./job.js";
import { jobs } from "./job.js";
import { users } from "./user.js";

export const applications = pgTable(
  "applications",
  {
    applicationId: serial("application_id").primaryKey(),
    jobId: integer("job_id")
      .notNull()
      .references(() => jobs.jobId, { onDelete: "cascade" }),
    applicantId: integer("applicant_id")
      .notNull()
      .references(() => users.userId, { onDelete: "cascade" }),
    applicantEmail: varchar("applicant_email", { length: 255 }).notNull(),
    status: applicationStatusEnum("status").notNull().default("submitted"),
    resume: varchar("resume", { length: 255 }).notNull(),
    appliedAt: timestamp("applied_at", { withTimezone: true }).notNull().defaultNow(),
    subscribed: boolean("subscribed"),
    interviewScore: integer("interview_score"),
  },
  (table) => ({
    uniqueApplicantPerJob: unique().on(table.jobId, table.applicantId),
  })
);