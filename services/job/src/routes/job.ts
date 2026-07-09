import { Router } from "express"
import { createCompany, createJob, deleteCompany, getAllJobs, getJobById, getAllCompanies, getCompanyById, applyForJob, getUserApplications, getJobApplications, updateApplicationStatus, deleteJob, updateJob } from "../controllers/job.js"
import { getJobSeekerAnalytics } from "../controllers/analytics.controller.js"
import { isAuthenticated } from "../middlewares/auth.js"
import uploadFile from "../middlewares/multer.js"

const router = Router()

// Public read endpoints
router.get('/jobs', getAllJobs)
router.get('/jobs/:id', getJobById)
router.get('/companies', getAllCompanies)
router.get('/company/:id', getCompanyById)

// Protected write endpoints
router.post('/company/new', isAuthenticated, uploadFile, createCompany)
router.delete('/company/:companyId', isAuthenticated, deleteCompany)
router.post('/job/new', isAuthenticated, createJob)
router.delete('/jobs/:id', isAuthenticated, deleteJob)
router.put('/jobs/:id', isAuthenticated, updateJob)

// Applications
router.post('/apply', isAuthenticated, uploadFile, applyForJob)
router.get('/applications', isAuthenticated, getUserApplications)
router.get('/applications/:jobId', isAuthenticated, getJobApplications)
router.put('/application/:applicationId', isAuthenticated, updateApplicationStatus)

router.get('/analytics/job-seeker', isAuthenticated, getJobSeekerAnalytics)

export default router
