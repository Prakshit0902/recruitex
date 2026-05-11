import { integer, pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";

export const company = pgTable(
    'companies',
    {
        companyId : serial('company_id').primaryKey(),
        name : varchar('name', {length : 255}).notNull().unique(),
        description : varchar('description', {length : 255}).notNull(),
        website : varchar('website', {length : 255}).notNull(),
        logo : varchar('logo', {length : 255}).notNull(),
        logoPublicId : varchar('logo_public_id', {length : 255}).notNull(),
        recruiterId : integer('recruiter_id').notNull(),
        createdAt : timestamp('created_at', {withTimezone : true}).notNull().defaultNow()



    }
)
