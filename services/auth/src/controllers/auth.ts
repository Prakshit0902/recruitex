import { db } from "@app/db/client";
import ErrorHandler from "../utils/errorHandler.js";
import { TryCatch } from "../utils/tryCatch.js";
import { skills, users, userSkills } from "@app/db/schema";
import {eq, sql} from 'drizzle-orm'
import bcrypt from 'bcrypt'
import axios from "axios";
import FormData from "form-data";
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import { forgotPasswordTemplate } from "../template.js";
import { publishToTopic } from "../producer.js";
import { redis } from "../index.js";

dotenv.config()

export const registerUser = TryCatch(async (req,res,next) => {
    const {name,email,password,phoneNumber,role,bio} = req.body
    
    if (!name || !email || !password || !phoneNumber || !role || !bio){
        throw new ErrorHandler(400,'Please fill all details')
    }

    const existingUser = await db
        .select({userId : users.userId})
        .from(users)
        .where(eq(users.email,email))
        .limit(1)

    if (existingUser.length > 0){
        throw new ErrorHandler(409, 'User with this email already exists')
    }

    const hashPassword = await bcrypt.hash(password,10)

    let registeredUser;

    if (role === 'recruiter'){
            const [user] = await db
            .insert(users).values(
                {
                    name : name,
                    email : email,
                    password : hashPassword,
                    phoneNumber : phoneNumber,
                    role : role,
                    bio : bio
                }

            )
            .returning(
                {
                    userId : users.userId,
                    name : users.name,
                    email : users.email,
                    phoneNumber : users.phoneNumber,
                    role : users.role, 
                    bio : users.bio,
                    resume : users.resume,
                    profilePic : users.profilePic,
                    subscription : users.subscription
                }
            )    

            registeredUser = {
                ...user,
                skills: []
            }
    }

    else if (role === 'jobseeker'){
        const file = req.file

        if (!file) {
            throw new ErrorHandler(400,'Resume file is required for jobseeker')
        }

        const form = new FormData()

        form.append('file',file.buffer, {filename : file.originalname, contentType: file.mimetype})
        

        const {data} = await axios.post(`${process.env.UPLOAD_SERVICE}/api/utils/upload`,
            form,
            {
                headers : {
                    ...form.getHeaders()
                }
            }
         )

        // console.log(data)

        const [user] = await db 
            .insert(users).values(
                {
                    name : name,
                    email : email,  
                    password : hashPassword,
                    phoneNumber : phoneNumber,
                    role : role,
                    bio : bio,
                    resume : data.url,
                    resumePublicId : data.public_id
                }

            )
            .returning(
                {
                    userId : users.userId,
                    name : users.name,
                    email : users.email,
                    phoneNumber : users.phoneNumber,
                    role : users.role,
                    bio : users.bio,
                    resume : users.resume,
                    profilePic : users.profilePic,
                    subscription : users.subscription
                }
            )


            registeredUser = {
                ...user,
                skills: []
            }
        
    }

    const token = jwt.sign(
        {
            userId : registeredUser?.userId,
        },
        process.env.JWT_SECRET_KEY as string,
        {
            expiresIn : '15d'
        }
    )
    
    res.json({
        message : "user registered successfully",
        user: registeredUser,
        token
    }) 
})


export const loginUser = TryCatch(async (req,res,next) => {
    const {email,password} = req.body       
    if (!email || !password){
        throw new ErrorHandler(400,'Please fill all details')
    }
    
    /*
    below drizzle orm syntax is equivalent to the following SQL query :
    const user = await sql `SELECT u.user_id,
        u.name,
        u.email,
        u.password,
        u.phone_number,
        u.role,
        u.bio,
        u. resume,
        u.profile_pic,
        u.subscription,

        ARRAY_AGG(s.name)
        FILTER (WHERE s.name IS NOT NULL) as skills 
        
        FROM users u 
        
        LEFT JOIN user_skills us ON u.user_id = us.user_id 
        
        LEFT JOIN skills s ON us.skill_id = s.skill_id 
        
        WHERE u.email = $(email)
        
        GROUP BY u.user_id`
                    
    */

        /**
         * Will return user details along with an array of skills associated with the user. If no skills are associated, it will return an empty array for skills.
         * The FILTER clause ensures that if there are no skills, it doesn't return an array with a single null value, but rather an empty array.
         * Grouping by user_id is necessary because of the aggregation of skills. Each user will be returned as a single row with their details and an array of their skills.   
         */


    const user = await db
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
            eq(users.email,email)
        )
        
        .groupBy(users.userId)


    if (user.length === 0){
        throw new ErrorHandler(404,'User with this email does not exist')
    }

    const userObject = user[0]

    const isPasswordValid = await bcrypt.compare(password,userObject.password)

    if (!isPasswordValid){
        throw new ErrorHandler(401,'Invalid Credentials')
    }

    userObject.skills = userObject.skills || []

    const {password : _, ...userWithoutPassword} = userObject

    const token = jwt.sign(
        {
            userId : userObject.userId,
        },
        process.env.JWT_SECRET_KEY as string,
        {
            expiresIn : '15d'
        }
    )


    res.status(200).json({
        message : "Login successful",
        user : userWithoutPassword,
        token
    })
        

})

export const forgotPassword = TryCatch(async (req,res,next) => {
    const {email} = req.body

    if (!email){
        throw new ErrorHandler(400,'Please provide email')
    }

    const user = await db
        .select({userId : users.userId, email : users.email})
        .from(users)
        .where(eq(users.email,email))
        .limit(1)
    
    if (user.length === 0){
        throw new ErrorHandler(404,'User with this email does not exist')
    }

    const userFound = user[0]

    const resetToken = jwt.sign(
        {
            email : userFound.email,
            type : 'reset'
        },
        process.env.JWT_SECRET_KEY as string,
        {
            expiresIn : '15m'
        }  
    )

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`

    await redis.set(`forgot:${email}`,resetToken, {
        ex : 15 * 60 
    }) 



    const message = {
        to : email,
        subject : 'Password Reset Request',
        html : forgotPasswordTemplate(resetLink)
    }

    publishToTopic('send-mail-topic',message)
    .catch((error) => {
        console.error('Error publishing forgot password email to Kafka topic:', error);
    })


    res.json({
        message : 'Password reset link has been sent to your email'
    })

})

export const resetPassword = TryCatch(async (req,res,next) => {
    const {token} = req.params
    const {password} = req.body

    let decoded : any

    try {
        decoded = jwt.verify(token as string,process.env.JWT_SECRET_KEY as string)

    } catch (error) {
        throw new ErrorHandler(400,'Invalid or expired token')
    }

    if (decoded.type !== 'reset'){
        throw new ErrorHandler(400,'Invalid token type')
    }   

    const email = decoded.email

    const storedToken = await redis.get(`forgot:${email}`)

    if (!storedToken || storedToken !== token){
        throw new ErrorHandler(400,'Invalid or expired token')
    }

    const userList = await db
        .select({userId : users.userId})
        .from(users)
        .where(eq(users.email,email))
        .limit(1)

    if (userList.length === 0){
        throw new ErrorHandler(404,'User with this email does not exist')
    
    }

    const user = userList[0]
    const hashPassword = await bcrypt.hash(password,10)

    await db
        .update(users)
        .set({password : hashPassword})
        .where(eq(users.userId,user.userId))

    await redis.del(`forgot:${email}`)

    res.json({
        message : 'Password has been reset successfully'
    })

    
})
