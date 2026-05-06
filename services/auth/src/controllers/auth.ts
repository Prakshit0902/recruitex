import { db } from "@app/db/client";
import ErrorHandler from "../utils/errorHandler.js";
import { TryCatch } from "../utils/tryCatch.js";
import { users } from "@app/db/schema";
import {eq} from 'drizzle-orm'
import bcrypt from 'bcrypt'
import axios from "axios";
import FormData from "form-data";

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
                    bio : users.bio
                }
            )    

            registeredUser = user
    }

    else if (role === 'jobseeker'){
        const file = req.file

        if (!file) {
            throw new ErrorHandler(400,'Resume file is required for jobseeker')
        }

        const form = new FormData()

        form.append('file',file.buffer, {filename : file.originalname})
        

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
                    resumePublicId : users.resumePublicId
                }
            )


            registeredUser = user
        
    }
    
    res.json({
        message : "user registered successfully",
        registeredUser
    }) 
})