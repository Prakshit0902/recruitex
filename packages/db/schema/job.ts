import { integer, pgTable, serial, text, varchar,pgEnum, numeric, timestamp, boolean } from "drizzle-orm/pg-core";
import { company } from "./company.js";


export const jobTypeEnum = pgEnum('job_type',['full_time','part_time','internship','contract'])
export const workLocationEnum = pgEnum('work_location',['remote','on_site','hybrid'])
export const applicationStatusEnum = pgEnum('application_status',['submitted','rejected','hired'])


export const jobs = pgTable(
    'jobs',
    {
        jobId : serial('job_id').primaryKey(),
        title : varchar('title', {length : 255}).notNull(),
        description : text('description').notNull(),
        salary : numeric('salary', {precision : 10, scale : 2}).notNull(),
        location : varchar('location', {length : 255}),
        jobType : jobTypeEnum('job_type').notNull(),
        openings : integer('openings').notNull(),
        role : varchar('role', {length : 255}).notNull(),
        workLocation : workLocationEnum('work_location').notNull(),
        companyId : integer('company_id')
        .notNull()
        .references(() => company.companyId, {onDelete : 'cascade'}),
        postedByRecruiter : integer('posted_by_recruiter').notNull(),
        createdAt : timestamp('created_at', {withTimezone : true}).notNull().defaultNow(),   
        isActive : boolean('is_active').notNull().default(true)
    }
)
