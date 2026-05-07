import { skills, users, userSkills } from "@app/db/schema";
import { AuthenticatedRequest, User } from "../middlewares/auth.js";
import { TryCatch } from "../utils/tryCatch.js";
import { eq, sql } from "drizzle-orm";
import { db } from "@app/db/client";
import { PgSerial } from "drizzle-orm/pg-core";
import ErrorHandler from "../utils/errorHandler.js";

export const myProfile = TryCatch(async(req :AuthenticatedRequest,res) => {
    const user = req.user

    res.status(200).json(   
        {
            message : "User profile fetched successfully",
            user
        }
    )

})

export const userProfile = TryCatch(async(req :AuthenticatedRequest,res) => {
    const {userId} = req.params

    const userList = await db
            .select(
                {
                    userId : users.userId,
                    name : users.name,
                    email : users.email,
                    password : users.password,
                    phoneNumber : users.phoneNumber,
                    role : users.role,
                    bio : users.bio,
                    resume : users.resume,
                    profilePic : users.profilePic,
                    subscription : users.subscription,
    
                    skills : sql<string[]> `
                        ARRAY_AGG(${skills.name})
                        FILTER (WHERE ${skills.name} IS NOT NULL)
                    `
                }
            )
    
            .from(users)
            
            .leftJoin(
                userSkills,
                eq(users.userId, userSkills.userId)
            )
            
            .leftJoin(
                skills,
                eq(userSkills.skillId, skills.skillId)
            )
            
            .where(
                eq(users.userId,userId as unknown as number)
            )
            
            .groupBy(users.userId)

        
    if (userList.length === 0){
        throw new ErrorHandler(404,'User with this id does not exist')
    }

    const user = userList[0] as User

    user.skills = user.skills || []

    res.status(200).json(   
        {
            message : "User profile fetched successfully",
            user
        }   
    )

})