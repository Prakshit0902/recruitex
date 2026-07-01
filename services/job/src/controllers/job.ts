import { db } from "@app/db/client";
import { AuthenticatedRequest } from "../middlewares/auth.js";
import ErrorHandler from "../utils/errorHandler.js";
import { TryCatch } from "../utils/tryCatch.js";
import { company, jobs, applications, users as userTable } from "@app/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
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
        contentType: file.mimetype
    })

    const {data} = await axios.post(`${process.env.UPLOAD_SERVICE}/api/utils/upload`, formData, {
        headers: {
            ...formData.getHeaders()
        }
    })

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
    .where(and(eq(company.companyId, Number(companyId)), eq(company.recruiterId, user.userId)))

    if (!com) {
        throw new ErrorHandler(404, "Company not found or you don't have permission to add job to this company")
    }

    const [newJob] = await db
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

export const getAllJobs = TryCatch(async (req: AuthenticatedRequest, res) => {
    const allJobs = await db
        .select({
            jobId: jobs.jobId,
            title: jobs.title,
            description: jobs.description,
            salary: jobs.salary,
            location: jobs.location,
            jobType: jobs.jobType,
            openings: jobs.openings,
            role: jobs.role,
            workLocation: jobs.workLocation,
            companyId: jobs.companyId,
            postedByRecruiter: jobs.postedByRecruiter,
            isActive: jobs.isActive,
            createdAt: jobs.createdAt,
            companyName: company.name,
            companyLogo: company.logo,
        })
        .from(jobs)
        .leftJoin(company, eq(jobs.companyId, company.companyId))
        .where(eq(jobs.isActive, true))
        .orderBy(desc(jobs.createdAt))

    const formatted = allJobs.map((j) => ({
        jobId: j.jobId,
        title: j.title,
        description: j.description,
        salary: j.salary,
        location: j.location,
        jobType: j.jobType,
        openings: j.openings,
        role: j.role,
        workLocation: j.workLocation,
        companyId: j.companyId,
        postedByRecruiter: j.postedByRecruiter,
        isActive: j.isActive,
        createdAt: j.createdAt,
        company: j.companyName ? {
            companyId: j.companyId,
            name: j.companyName,
            logo: j.companyLogo,
        } : null,
    }))

    res.json({ message: "Jobs fetched successfully", jobs: formatted })
})

export const getJobById = TryCatch(async (req: AuthenticatedRequest, res) => {
    const { id } = req.params
    const [job] = await db
        .select({
            jobId: jobs.jobId,
            title: jobs.title,
            description: jobs.description,
            salary: jobs.salary,
            location: jobs.location,
            jobType: jobs.jobType,
            openings: jobs.openings,
            role: jobs.role,
            workLocation: jobs.workLocation,
            companyId: jobs.companyId,
            postedByRecruiter: jobs.postedByRecruiter,
            isActive: jobs.isActive,
            createdAt: jobs.createdAt,
            companyName: company.name,
            companyDescription: company.description,
            companyWebsite: company.website,
            companyLogo: company.logo,
        })
        .from(jobs)
        .leftJoin(company, eq(jobs.companyId, company.companyId))
        .where(eq(jobs.jobId, Number(id)))

    if (!job) throw new ErrorHandler(404, "Job not found")

    const result = {
        ...job,
        company: job.companyName ? {
            companyId: job.companyId,
            name: job.companyName,
            description: job.companyDescription,
            website: job.companyWebsite,
            logo: job.companyLogo,
        } : null,
    }
    delete (result as any).companyName
    delete (result as any).companyDescription
    delete (result as any).companyWebsite
    delete (result as any).companyLogo

    res.json({ message: "Job fetched successfully", job: result })
})

export const getAllCompanies = TryCatch(async (req: AuthenticatedRequest, res) => {
    const allCompanies = await db
        .select()
        .from(company)
        .orderBy(desc(company.createdAt))

    res.json({ message: "Companies fetched successfully", companies: allCompanies })
})

export const getCompanyById = TryCatch(async (req: AuthenticatedRequest, res) => {
    const { id } = req.params
    const [comp] = await db
        .select()
        .from(company)
        .where(eq(company.companyId, Number(id)))

    if (!comp) throw new ErrorHandler(404, "Company not found")

    res.json({ message: "Company fetched successfully", company: comp })
})

export const applyForJob = TryCatch(async (req: AuthenticatedRequest, res) => {
    const user = req.user
    if (!user) throw new ErrorHandler(401, "Unauthorized")
    if (user.role !== "jobseeker") throw new ErrorHandler(403, "Only job seekers can apply")

    const { jobId } = req.body
    if (!jobId) throw new ErrorHandler(400, "Job ID is required")

    const [existingJob] = await db
        .select()
        .from(jobs)
        .where(eq(jobs.jobId, Number(jobId)))

    if (!existingJob) throw new ErrorHandler(404, "Job not found")

    const [existingApplication] = await db
        .select()
        .from(applications)
        .where(
            and(
                eq(applications.jobId, Number(jobId)),
                eq(applications.applicantId, user.userId)
            )
        )

    if (existingApplication) throw new ErrorHandler(409, "Already applied to this job")

    const [newApplication] = await db
        .insert(applications)
        .values({
            jobId: Number(jobId),
            applicantId: user.userId,
            applicantEmail: user.email,
            resume: user.resume || "",
            subscribed: true,
        })
        .returning()

    res.status(201).json({ message: "Application submitted successfully", application: newApplication })
})

export const getUserApplications = TryCatch(async (req: AuthenticatedRequest, res) => {
    const user = req.user
    if (!user) throw new ErrorHandler(401, "Unauthorized")

    const userApps = await db
        .select({
            applicationId: applications.applicationId,
            jobId: applications.jobId,
            applicantId: applications.applicantId,
            applicantEmail: applications.applicantEmail,
            status: applications.status,
            resume: applications.resume,
            subscribed: applications.subscribed,
            appliedAt: applications.appliedAt,
            jobTitle: jobs.title,
            jobLocation: jobs.location,
            jobType: jobs.jobType,
            companyName: company.name,
        })
        .from(applications)
        .leftJoin(jobs, eq(applications.jobId, jobs.jobId))
        .leftJoin(company, eq(jobs.companyId, company.companyId))
        .where(eq(applications.applicantId, user.userId))
        .orderBy(desc(applications.appliedAt))

    const formatted = userApps.map((a) => ({
        applicationId: a.applicationId,
        jobId: a.jobId,
        applicantId: a.applicantId,
        applicantEmail: a.applicantEmail,
        status: a.status,
        resume: a.resume,
        subscribed: a.subscribed,
        createdAt: a.appliedAt,
        job: a.jobTitle ? {
            jobId: a.jobId,
            title: a.jobTitle,
            location: a.jobLocation,
            jobType: a.jobType,
            company: a.companyName ? { name: a.companyName } : null,
        } : null,
    }))

    res.json({ message: "Applications fetched successfully", applications: formatted })
})

export const getJobApplications = TryCatch(async (req: AuthenticatedRequest, res) => {
    const user = req.user
    if (!user) throw new ErrorHandler(401, "Unauthorized")
    if (user.role !== "recruiter") throw new ErrorHandler(403, "Only recruiters can view applicants")

    const { jobId } = req.params

    const [existingJob] = await db
        .select()
        .from(jobs)
        .where(eq(jobs.jobId, Number(jobId)))

    if (!existingJob) throw new ErrorHandler(404, "Job not found")
    if (existingJob.postedByRecruiter !== user.userId) throw new ErrorHandler(403, "You can only view applications for your own jobs")

    const jobApps = await db
        .select({
            applicationId: applications.applicationId,
            jobId: applications.jobId,
            applicantId: applications.applicantId,
            applicantEmail: applications.applicantEmail,
            status: applications.status,
            resume: applications.resume,
            subscribed: applications.subscribed,
            appliedAt: applications.appliedAt,
            applicantName: userTable.name,
            applicantBio: userTable.bio,
            applicantProfilePic: userTable.profilePic,
        })
        .from(applications)
        .leftJoin(userTable, eq(applications.applicantId, userTable.userId))
        .where(eq(applications.jobId, Number(jobId)))
        .orderBy(desc(applications.appliedAt))

    const formatted = jobApps.map((a) => ({
        applicationId: a.applicationId,
        jobId: a.jobId,
        applicantId: a.applicantId,
        applicantEmail: a.applicantEmail,
        status: a.status,
        resume: a.resume,
        subscribed: a.subscribed,
        createdAt: a.appliedAt,
        applicant: a.applicantName ? {
            name: a.applicantName,
            bio: a.applicantBio,
            profilePic: a.applicantProfilePic,
        } : null,
    }))

    res.json({ message: "Applications fetched successfully", applications: formatted })
})
