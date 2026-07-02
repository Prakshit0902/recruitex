import { skills, users, userSkills } from "@app/db/schema";
import { AuthenticatedRequest, User } from "../middlewares/auth.js";
import { TryCatch } from "../utils/tryCatch.js";
import { eq, sql,and } from "drizzle-orm";
import { db } from "@app/db/client";
import ErrorHandler from "../utils/errorHandler.js";
import FormData from "form-data";
import axios from "axios";

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

const getFullUser = async (userId: number) => {
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
                    resumePublicId : users.resumePublicId,
                    profilePic : users.profilePic,
                    profilePicPublicId : users.profilePicPublicId,
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
                eq(users.userId, userId)
            )
            .groupBy(users.userId)
    
    if (userList.length === 0) return null;
    const u = userList[0] as User;
    u.skills = u.skills || [];
    return u;
}

export const updateUserProfile = TryCatch(async(req :AuthenticatedRequest,res) => {
    const user = req.user

    if (!user) {
        throw new ErrorHandler(401, 'Unauthorized')
    }

    const {phoneNumber, bio, name} = req.body

    const newPhoneNumber = phoneNumber || user.phoneNumber
    const newBio = bio || user.bio
    const newName = name || user.name

    await db
        .update(users)
        .set({
            phoneNumber : newPhoneNumber,
            bio : newBio,
            name : newName
        })
        .where(eq(users.userId, user.userId))

    const fullUser = await getFullUser(user.userId)

    res.json(
        {
            message : "User profile updated successfully",
            user : fullUser
        }
    )
})

export const updateProfilePic = TryCatch(async(req :AuthenticatedRequest,res) => {
    const user = req.user

    if (!user) {
        throw new ErrorHandler(401, 'Unauthorized')
    }

    const file = req.file

    if (!file) {
        throw new ErrorHandler(400, 'No file uploaded')
    }

    const oldPublicId = user.profilePicPublicId
    const formData = new FormData()

    formData.append('file', file.buffer, {
        filename: file.originalname,
    })

    formData.append('public_id', oldPublicId || '')

    const {data} = await axios.post(`${process.env.UPLOAD_SERVICE}/api/utils/upload`, formData, {
        headers : {
            ...formData.getHeaders()
        }
    })

    console.log(data);
    

    await db
        .update(users)
        .set({
            profilePic : data.url,
            profilePicPublicId : data.public_id
        })
        .where(eq(users.userId, user.userId))

    const fullUser = await getFullUser(user.userId)

    res.json(
        {
            message : "Profile picture updated successfully",
            user : fullUser
        }
    )   
})

export const updateResume = TryCatch(async(req :AuthenticatedRequest,res) => {
    const user = req.user
    if (!user) {
        throw new ErrorHandler(401, 'Unauthorized')
    }

    const file = req.file

    if (!file) {
        throw new ErrorHandler(400, 'No file uploaded')
    }

    const oldPublicId = user.resumePublicId

    const formData = new FormData()

    formData.append('file', file.buffer, {
        filename: file.originalname,
    })

    formData.append('public_id', oldPublicId || '')

    const {data} = await axios.post(`${process.env.UPLOAD_SERVICE}/api/utils/upload`, formData, {
        headers : {
            ...formData.getHeaders()
        }
    })

    await db
        .update(users)
        .set({
            resume : data.url,
            resumePublicId : data.public_id
        })
        .where(eq(users.userId, user.userId))

    const fullUser = await getFullUser(user.userId)

    res.json(
        {
            message : "Resume updated successfully",
            user : fullUser
        }
    )
        
})

export const updateUserSkills = TryCatch(async(req :AuthenticatedRequest,res) => {
    const userId = req.user?.userId
    const {skillName} = req.body

    if (!userId) {
        throw new ErrorHandler(401, 'Unauthorized')
    }

    if (typeof skillName !== 'string' || skillName.trim() === '') {
        throw new ErrorHandler(400, 'Skill name is required')
    }

    let skillWasAdded = false


    await db.transaction(async (tx) => {
        const userList = await tx
            .select()
            .from(users)
            .where(eq(users.userId, userId))
        
        if (userList.length === 0) {
            throw new ErrorHandler(404, 'User not found')
        }

        const [skill] = await tx
            .insert(skills)
            .values({
                name : skillName.trim()
            })
            .onConflictDoUpdate(
                {
                    target : skills.name,
                    set : {
                        name : skillName.trim()
                    }
                }
            )
            .returning(
                {
                    skillId : skills.skillId,
                }
            )

            const skillId = skill.skillId

            const insertionResult = await tx
                .insert(userSkills)
                .values({
                    userId : userId,
                    skillId : skillId
                })
                .onConflictDoNothing()
                .returning(
                    {
                        userId : userSkills.userId,
                    }
                )

            if (insertionResult.length > 0) {
                skillWasAdded = true
            }
    })


    res.json(
        {
            message : skillWasAdded ? "Skill added successfully" : "Skill already exists for the user"
        }
    )

})

export const deleteUserSkill = TryCatch(async(req :AuthenticatedRequest,res) => {
    const user = req.user

    if (!user) {
        throw new ErrorHandler(401, 'Unauthorized')
    }

    const {skillName} = req.body

    if (!skillName || typeof skillName !== 'string' || skillName.trim() === '') {
        throw new ErrorHandler(400, 'Skill name is required')
    }

    const [skill] = await db
        .select(
            {
                skillId : skills.skillId
            }
        )
        .from(skills)
        .where(eq(skills.name, skillName.trim()))

    if (!skill) {
        throw new Error("Skill not found");
    }

    const result = await db
        .delete(userSkills)
        .where(
            and(
                eq(userSkills.userId, user.userId),
                eq(userSkills.skillId, skill.skillId)
            )
        )
        .returning(
            {
                userId : userSkills.userId,
            }
        )

    
    res.json(
        {
            message : result.length > 0 ? "Skill deleted successfully" : "Skill not found for the user"
        }
    )

})
