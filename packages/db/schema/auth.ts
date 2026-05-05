import { pgTable, serial, varchar, text, pgEnum } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum('user_role',['jobseeker','recruiter'])
