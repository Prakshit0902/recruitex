import express from "express";
import { isAuthenticated } from "../middlewares/auth.js";
import { createQuiz, getQuizByJob, submitQuizAttempt } from "../controllers/quiz.js";

const router = express.Router();

router.post("/new", isAuthenticated, createQuiz);
router.get("/job/:job_id", isAuthenticated, getQuizByJob);
router.post("/attempt", isAuthenticated, submitQuizAttempt);

export default router;
