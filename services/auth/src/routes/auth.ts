import { Router } from 'express'
import { registerUser } from '../controllers/auth.js'
import uploadFile from '../middlewares/multer.js'

const router = Router() 

router.post('/register',uploadFile,registerUser)

export default router