import { db } from "@app/db/client";
import { AuthenticatedRequest } from "../middlewares/auth.js";
import ErrorHandler from "../utils/errorHandler.js";
import { TryCatch } from "../utils/tryCatch.js";
import { company } from "@app/db/schema";
import { eq } from "drizzle-orm";
import axios from "axios";
import FormData from "form-data";

export const createCompany = TryCatch(async (req : AuthenticatedRequest,res) => {
    const user = req.user

    if (!user) throw new ErrorHandler(401,"Unauthorized")
    if (user.role !== 'recruiter') throw new ErrorHandler(403,"Forbidden : Only recruiters can create a company")

    const {name,description,website} = req.body

    if (!name || !description || !website) 
        throw new ErrorHandler(400,"Bad Request : Missing required fields")
    
    const existingCompany = await db
        .select({companyId : company.companyId})
        .from(company)
        .where(eq(company.name, name))

    if (existingCompany.length > 0) {
        throw new ErrorHandler(409, "Company already exists")
    }

    const file = req.file

    if (!file) 
        throw new ErrorHandler(400, "Bad Request : Logo file is required")
    
    const oldPublicId = company.logoPublicId
    const formData = new FormData()
    formData.append("file", file.buffer, {
        filename : file.originalname,
    })

    const {data} = await axios.post(`${process.env.UPLOAD_SERVICE}/api/utils/upload`, formData)

    const [newCompany] = await db
        .insert(company)
        .values({
            name,
            description,
            website,
            logo : data.url,
            logoPublicId : data.public_id,
            recruiterId : user.userId
        })
        .returning({
            companyId : company.companyId,
            name : company.name,
            description : company.description,
            website : company.website,
            logo : company.logo,
            logoPublicId : company.logoPublicId,
            recruiterId : company.recruiterId,
            createdAt : company.createdAt
        })

    res.status(201).json({
        message : "Company created successfully",
        company : newCompany
    })
})


