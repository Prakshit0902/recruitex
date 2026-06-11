import { Router } from "express"
import { createCompany, deleteCompany } from "../controllers/job.js"
import { isAuthenticated } from "../middlewares/auth.js"
import uploadFile from "../middlewares/multer.js"

const router = Router()

router.post('/company/new',isAuthenticated, uploadFile, createCompany)


export default router