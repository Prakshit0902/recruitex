import { db } from "@app/db/client"
import { skills, users, userSkills } from "@app/db/schema"
import { NextFunction, Request, Response } from "express"
import jwt, { JwtPayload } from 'jsonwebtoken'
import {eq, sql} from 'drizzle-orm'

export interface User {
    userId : number,
    name : string,
    email : string,
    phoneNumber : string,
    role : 'jobseeker' | 'recruiter',
    bio : string | null,
    resume : string | null,
    resumePublicId : string | null,
    profilePic : string | null,
    profilePicPublicId : string | null,
    skills : string[] | null,
    subscription : string | null
    
}

export interface AuthenticatedRequest extends Request {
    user? : User
}

export const isAuthenticated = async (req : AuthenticatedRequest, res : Response, next : NextFunction) => {
    try {
        const authHeader = req.headers.authorization

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Unauthorized' })
        }

        const token = authHeader.split(' ')[1]

        const decodedPayload = jwt.verify(token,process.env.JWT_SECRET_KEY as string) as JwtPayload

        if (!decodedPayload || !decodedPayload.userId) {
            return res.status(401).json({ message: 'Unauthorized' })
        }

        const userList = await db
        .select(
            {
                userId : users.userId,
                name : users.name,
                email : users.email,
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
            eq(users.userId,decodedPayload.userId)
        )
        
        .groupBy(users.userId)

        if (userList.length === 0){
            return res.status(401).json(
                { 
                    message: 'User associated with this token does not exist'
                }
            )
        }

        const user = userList[0] as User

        user.skills = user.skills || []
        req.user = user

        next()

    } catch (error) {
        return res.status(500).json(
            {
                message : 'Internal Server Error',
            }
        )

    }
}