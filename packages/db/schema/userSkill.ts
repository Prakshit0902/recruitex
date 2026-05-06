import { integer, pgTable, primaryKey } from "drizzle-orm/pg-core";
import { users } from "./user.js";
import { skills } from "./skill.js";

export const userSkills = pgTable(
    'user_skills',
    {
        userId : integer('user_id').notNull().references(() => users.userId, {
            onDelete : 'cascade'
        }),
        skillId : integer('skill_id').notNull().references(() => skills.skillId , {
            onDelete : 'cascade'
        })
    },

    (table) => ({
        pk : primaryKey({
            columns : [table.userId,table.skillId]
        })
    })
)