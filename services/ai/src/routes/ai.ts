import { Router } from "express"
import { matchJob } from "../controllers/ai.js"
import { isAuthenticated } from "../middlewares/auth.js"

const router = Router()

router.post('/match', isAuthenticated, matchJob)

export default router
