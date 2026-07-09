import { AuthenticatedRequest } from "../middlewares/auth.js";
import { db } from "@app/db/client";
import { jobs, quizzes, quizQuestions, quizAttempts, applications } from "@app/db/schema";
import { eq } from "drizzle-orm";
import ErrorHandler from "../utils/errorHandler.js";
import { TryCatch } from "../utils/tryCatch.js";

// Manually or AI created quiz - expects { questions: [{ text, options: [], correct_answer_index }] }
export const createQuiz = TryCatch(async (req: AuthenticatedRequest, res) => {
    const user = req.user;
    if (!user || user.role !== "recruiter") {
        throw new ErrorHandler(403, "Forbidden: Only recruiter can create a quiz");
    }

    const { job_id, questions } = req.body;
    if (!job_id || !questions || !Array.isArray(questions)) {
        throw new ErrorHandler(400, "Job ID and questions array are required");
    }

    // Verify job belongs to recruiter
    const [job] = await db
        .select({ postedByRecruiter: jobs.postedByRecruiter })
        .from(jobs)
        .where(eq(jobs.jobId, Number(job_id)));
    if (!job || job.postedByRecruiter !== user.userId) {
        throw new ErrorHandler(403, "Forbidden or Job not found");
    }

    // Delete existing quiz for job if any (for simple replacement)
    await db.delete(quizzes).where(eq(quizzes.jobId, Number(job_id)));

    const [quiz] = await db
        .insert(quizzes)
        .values({ jobId: Number(job_id) })
        .returning();

    for (const q of questions) {
        await db
            .insert(quizQuestions)
            .values({
                quizId: quiz.quizId,
                questionText: q.text,
                options: q.options, // jsonb will handle serialization
                correctAnswerIndex: q.correct_answer_index
            });
    }

    res.json({ message: "Quiz created successfully", quiz_id: quiz.quizId });
});

export const getQuizByJob = TryCatch(async (req: AuthenticatedRequest, res) => {
    const { job_id } = req.params;
    const [quiz] = await db
        .select()
        .from(quizzes)
        .where(eq(quizzes.jobId, Number(job_id)));
    
    if (!quiz) {
        throw new ErrorHandler(404, "Quiz not found for this job");
    }

    const questions = await db
        .select({
            questionId: quizQuestions.questionId,
            questionText: quizQuestions.questionText,
            options: quizQuestions.options,
            correctAnswerIndex: quizQuestions.correctAnswerIndex
        })
        .from(quizQuestions)
        .where(eq(quizQuestions.quizId, quiz.quizId));

    if (req.user?.role === 'jobseeker') {
        const safeQuestions = questions.map(q => ({
            question_id: q.questionId,
            question_text: q.questionText,
            options: q.options
        }));
        return res.json({ quiz, questions: safeQuestions });
    }

    const rawQuestions = questions.map(q => ({
        question_id: q.questionId,
        question_text: q.questionText,
        options: q.options,
        correct_answer_index: q.correctAnswerIndex
    }));

    res.json({ quiz, questions: rawQuestions });
});

export const submitQuizAttempt = TryCatch(async (req: AuthenticatedRequest, res) => {
    const user = req.user;
    const { application_id, answers } = req.body; // answers: { [question_id]: selected_option_index }

    if (!application_id || !answers) {
        throw new ErrorHandler(400, "Application ID and answers are required");
    }

    const [application] = await db
        .select()
        .from(applications)
        .where(eq(applications.applicationId, Number(application_id)));

    if (!application || application.applicantId !== user?.userId) {
        throw new ErrorHandler(403, "Forbidden or application not found");
    }

    const [quiz] = await db
        .select()
        .from(quizzes)
        .where(eq(quizzes.jobId, application.jobId));
    
    if (!quiz) throw new ErrorHandler(404, "Quiz not found");

    const questions = await db
        .select({
            questionId: quizQuestions.questionId,
            correctAnswerIndex: quizQuestions.correctAnswerIndex
        })
        .from(quizQuestions)
        .where(eq(quizQuestions.quizId, quiz.quizId));

    let correct = 0;
    questions.forEach(q => {
        if (answers[q.questionId] === q.correctAnswerIndex) {
            correct += 1;
        }
    });

    const rawScore = questions.length > 0 ? (correct / questions.length) * 100 : 0;
    const score = Math.round(rawScore * 100) / 100;

    await db.delete(quizAttempts).where(eq(quizAttempts.applicationId, Number(application_id)));

    const [attempt] = await db
        .insert(quizAttempts)
        .values({
            applicationId: Number(application_id),
            score: score.toString()
        })
        .returning();

    // Update application score
    await db
        .update(applications)
        .set({ interviewScore: score })
        .where(eq(applications.applicationId, Number(application_id)));

    res.json({ message: "Quiz submitted", score, attempt });
});
