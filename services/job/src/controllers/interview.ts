import { AuthenticatedRequest } from "../middlewares/auth.js";
import { db } from "@app/db/client";
import { applications, jobs, interviews, interviewEvaluations } from "@app/db/schema";
import { eq } from "drizzle-orm";
import ErrorHandler from "../utils/errorHandler.js";
import { TryCatch } from "../utils/tryCatch.js";

export const scheduleInterview = TryCatch(async (req: AuthenticatedRequest, res) => {
    const user = req.user;
    if (!user || user.role !== "recruiter") {
        throw new ErrorHandler(403, "Forbidden: Only recruiter can schedule an interview");
    }

    const { application_id, scheduled_at, meet_link } = req.body;
    if (!application_id || !scheduled_at || !meet_link) {
        throw new ErrorHandler(400, "Application ID, scheduled time, and meet link are required");
    }

    const [application] = await db
        .select()
        .from(applications)
        .where(eq(applications.applicationId, Number(application_id)));
    if (!application) throw new ErrorHandler(404, "Application not found");

    const [job] = await db
        .select({ postedByRecruiter: jobs.postedByRecruiter })
        .from(jobs)
        .where(eq(jobs.jobId, application.jobId));
    if (!job || job.postedByRecruiter !== user.userId) {
        throw new ErrorHandler(403, "Forbidden or Job not found");
    }

    const [interview] = await db
        .insert(interviews)
        .values({
            applicationId: Number(application_id),
            jobId: application.jobId,
            scheduledAt: new Date(scheduled_at),
            meetLink: meet_link,
            interviewerId: user.userId,
            status: "scheduled"
        })
        .returning();

    // Update application stage to 'Interview'
    await db
        .update(applications)
        .set({ status: "Interview" })
        .where(eq(applications.applicationId, Number(application_id)));

    res.json({ message: "Interview scheduled successfully", interview });
});

export const evaluateInterview = TryCatch(async (req: AuthenticatedRequest, res) => {
    const user = req.user;
    if (!user || user.role !== "recruiter") {
        throw new ErrorHandler(403, "Forbidden: Only recruiter can evaluate an interview");
    }

    const { application_id, tech_rating, comm_rating, problem_solving_rating, culture_rating, feedback } = req.body;

    if (!application_id || !feedback || !tech_rating || !comm_rating || !problem_solving_rating || !culture_rating) {
        throw new ErrorHandler(400, "All rating fields, feedback, and application id are required");
    }

    const [interview] = await db
        .select()
        .from(interviews)
        .where(eq(interviews.applicationId, Number(application_id)));
    if (!interview || interview.interviewerId !== user.userId) {
        throw new ErrorHandler(404, "Interview not found or not assigned to you");
    }

    const [evaluation] = await db
        .insert(interviewEvaluations)
        .values({
            interviewId: interview.interviewId,
            techRating: tech_rating,
            commRating: comm_rating,
            problemSolvingRating: problem_solving_rating,
            cultureRating: culture_rating,
            feedback: feedback
        })
        .returning();

    // Calculate interview score: Average of 4 ratings converted to percentage (1-5 scale)
    const averageRating = (tech_rating + comm_rating + problem_solving_rating + culture_rating) / 4;
    const interviewScore = Math.round((averageRating / 5) * 100);

    // Update application interview_score
    await db
        .update(applications)
        .set({ interviewScore: interviewScore })
        .where(eq(applications.applicationId, interview.applicationId));

    res.json({ message: "Interview evaluated successfully", evaluation, interviewScore });
});
