import { pgTable, serial, integer, varchar, text, jsonb, timestamp, numeric } from "drizzle-orm/pg-core";
import { jobs } from "./job.js";
import { applications } from "./application.js";
import { users } from "./user.js";

export const quizzes = pgTable("quizzes", {
  quizId: serial("quiz_id").primaryKey(),
  jobId: integer("job_id").notNull().references(() => jobs.jobId, { onDelete: "cascade" }),
});

export const quizQuestions = pgTable("quiz_questions", {
  questionId: serial("question_id").primaryKey(),
  quizId: integer("quiz_id").notNull().references(() => quizzes.quizId, { onDelete: "cascade" }),
  questionText: text("question_text").notNull(),
  options: jsonb("options").notNull(), // array of strings
  correctAnswerIndex: integer("correct_answer_index").notNull(),
});

export const quizAttempts = pgTable("quiz_attempts", {
  attemptId: serial("attempt_id").primaryKey(),
  applicationId: integer("application_id").notNull().references(() => applications.applicationId, { onDelete: "cascade" }),
  score: numeric("score").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const interviews = pgTable("interviews", {
  interviewId: serial("interview_id").primaryKey(),
  applicationId: integer("application_id").notNull().unique().references(() => applications.applicationId, { onDelete: "cascade" }),
  jobId: integer("job_id").notNull().references(() => jobs.jobId, { onDelete: "cascade" }),
  interviewerId: integer("interviewer_id").references(() => users.userId, { onDelete: "set null" }),
  scheduledAt: timestamp("scheduled_at").notNull(),
  meetLink: varchar("meet_link", { length: 255 }),
  feedback: text("feedback"),
  status: varchar("status", { length: 255 }).default("scheduled"),
});

export const interviewEvaluations = pgTable("interview_evaluations", {
  evaluationId: serial("evaluation_id").primaryKey(),
  interviewId: integer("interview_id").notNull().references(() => interviews.interviewId, { onDelete: "cascade" }),
  techRating: integer("tech_rating").notNull(),
  commRating: integer("comm_rating").notNull(),
  problemSolvingRating: integer("problem_solving_rating").notNull(),
  cultureRating: integer("culture_rating").notNull(),
  feedback: text("feedback").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
