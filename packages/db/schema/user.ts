import { pgTable, serial, varchar, text, pgEnum, timestamp } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum('user_role',['jobseeker','recruiter'])

export const users = pgTable(
    'users',
    {
        userId : serial('user_id').primaryKey(),
        name : varchar('name',{length : 255}).notNull(),
        email : varchar('email',{length : 255}).notNull().unique(),
        password : varchar('password',{length : 255}).notNull(),
        phoneNumber : varchar('phone_number',{length : 20}).notNull(),
        role : userRoleEnum('role').notNull(),
        bio : text('bio'),
        resume : varchar('resume', {length : 255}),
        resumePublicId : varchar('resume_public_id',{length : 255}),
        profilePic : varchar('profile_pic',{length : 255}),
        profilePicPublicId : varchar('profile_pic_public_id',{length : 255}),
        createAt : timestamp('created_at', {withTimezone : true}).notNull().defaultNow(),
        subscription : timestamp('subscription',{withTimezone : true})
    }
)