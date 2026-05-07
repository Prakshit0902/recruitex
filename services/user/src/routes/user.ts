import { Router } from "express"
import { myProfile, userProfile } from "../controllers/user.js"
import { isAuthenticated } from "../middlewares/auth.js"

const router = Router()

router.get('/me', isAuthenticated ,myProfile)
router.get('/profile/:userId', isAuthenticated, userProfile)


export default router