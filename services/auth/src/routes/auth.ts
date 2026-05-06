import { Router } from 'express'
import { forgotPassword, loginUser, registerUser } from '../controllers/auth.js'
import uploadFile from '../middlewares/multer.js'

const router = Router() 

router.post('/register',uploadFile,registerUser)
router.post('/login',loginUser)
router.post('/forgot-password', forgotPassword)
    

export default router