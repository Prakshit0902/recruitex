import { db } from "@app/db/client";
import { AuthenticatedRequest } from "../middlewares/auth.js";
import ErrorHandler from "../utils/errorHandler.js";
import { TryCatch } from "../utils/tryCatch.js";
import { company, jobs } from "@app/db/schema";
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


export const deleteCompany = TryCatch(async(req : AuthenticatedRequest,res) => {
    const user = req.user
    if (!user) throw new ErrorHandler(401,"Unauthorized")
    if (user.role !== 'recruiter') throw new ErrorHandler(403,"Forbidden : Only recruiters can delete a company")

    const {companyId} = req.params
    const companyList = await db
        .select()
        .from(company)
        .where(eq(company.companyId, Number(companyId)))
    if (companyList.length === 0) {
        throw new ErrorHandler(404, "Company not found")
    }

    const companyToDelete = companyList[0]
    if (companyToDelete.recruiterId !== user.userId) {
        throw new ErrorHandler(403, "Forbidden : You can only delete your own company")
    }

    await db
        .delete(company)
        .where(eq(company.companyId, Number(companyId)))

    res.json({
        message : "Company deleted successfully"
    })
})

export const createJob = TryCatch(async(req : AuthenticatedRequest,res) => {
    const user = req.user

    if (!user) throw new ErrorHandler(401,"Unauthorized")
    if (user.role !== 'recruiter') throw new ErrorHandler(403,"Forbidden : Only recruiters can create a job")
    
    const {title, description, companyId, location, jobType, skills, role, salary, openings, workLocation} = req.body

    if (!title || !description || !companyId || !location || !jobType || !role || !salary || !openings || !workLocation) {
        throw new ErrorHandler(400,"Bad Request : Missing required fields")
    }

    const [com] = await db
    .select()
    .from(company)
    .where(eq(company.companyId, Number(companyId)) && eq(company.recruiterId, user.userId))

    if (!com) {
        throw new ErrorHandler(404, "Company not found or you don't have permission to add job to this company")
    }

    const newJob = await db
            .insert(jobs)
            .values({
                title,
                description,
                companyId : Number(companyId),
                location,
                jobType,
                role,
                salary,
                openings : Number(openings),
                workLocation,
                postedByRecruiter : user.userId
            })
            .returning({
                jobId : jobs.jobId,
                title : jobs.title,
                description : jobs.description,
                companyId : jobs.companyId,
                location : jobs.location,
                jobType : jobs.jobType,
                role : jobs.role,
                salary : jobs.salary,
                openings : jobs.openings,
                workLocation : jobs.workLocation,
                postedByRecruiter : jobs.postedByRecruiter,
                createdAt : jobs.createdAt,
                isActive : jobs.isActive
            })

    res.status(201).json({
        message : "Job created successfully",
        job : newJob
    })


})