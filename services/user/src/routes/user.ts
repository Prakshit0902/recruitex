import { Router } from "express"
import { myProfile, updateProfilePic, updateResume, updateUserProfile, userProfile } from "../controllers/user.js"
import { isAuthenticated } from "../middlewares/auth.js"
import uploadFile from "../middlewares/multer.js"

const router = Router()

router.get('/me', isAuthenticated ,myProfile)
router.get('/profile/:userId', isAuthenticated, userProfile)
router.put('/update/profile', isAuthenticated, updateUserProfile)
router.put('/update/pic', isAuthenticated, uploadFile , updateProfilePic)
router.put('/update/resume', isAuthenticated, uploadFile , updateResume)

export default router