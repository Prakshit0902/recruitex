import { pgTable, serial, varchar } from "drizzle-orm/pg-core";


export const skills = pgTable(
    'skills',
    {
        skillId : serial('skill_id').primaryKey(),
        name : varchar('name',{length : 100}).notNull().unique(),
        
    }
)