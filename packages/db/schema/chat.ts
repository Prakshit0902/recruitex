import { pgTable, serial, integer, timestamp, varchar, boolean, pgEnum, text } from "drizzle-orm/pg-core";
import { users } from "./user.js";
import { jobs } from "./job.js";
import { applications } from "./application.js";

export const messageTypeEnum = pgEnum("message_type_enum", ["text", "file", "image"]);

export const conversations = pgTable("conversations", {
  conversationId: serial("conversation_id").primaryKey(),
  applicationId: integer("application_id").notNull().unique().references(() => applications.applicationId, { onDelete: "cascade" }),
  applicantId: integer("applicant_id").notNull().references(() => users.userId, { onDelete: "cascade" }),
  recruiterId: integer("recruiter_id").notNull().references(() => users.userId, { onDelete: "cascade" }),
  jobId: integer("job_id").notNull().references(() => jobs.jobId, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  lastMessageAt: timestamp("last_message_at", { withTimezone: true }).defaultNow(),
});

export const messages = pgTable("messages", {
  messageId: serial("message_id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => conversations.conversationId, { onDelete: "cascade" }),
  senderId: integer("sender_id").notNull().references(() => users.userId, { onDelete: "cascade" }),
  content: text("content").notNull(),
  messageType: messageTypeEnum("message_type").notNull().default("text"),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
