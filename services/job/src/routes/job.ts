import { Router } from "express"
import { createCompany, createJob, deleteCompany } from "../controllers/job.js"
import { isAuthenticated } from "../middlewares/auth.js"
import uploadFile from "../middlewares/multer.js"

const router = Router()

router.post('/company/new',isAuthenticated, uploadFile, createCompany)
router.delete('/company/:companyId',isAuthenticated, deleteCompany)
router.post('/job/new',isAuthenticated, createJob)

export default router