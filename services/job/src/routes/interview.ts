import express from "express";
import { isAuthenticated } from "../middlewares/auth.js";
import { evaluateInterview, scheduleInterview } from "../controllers/interview.js";

const router = express.Router();

router.post("/schedule", isAuthenticated, scheduleInterview);
router.post("/evaluate", isAuthenticated, evaluateInterview);

export default router;
