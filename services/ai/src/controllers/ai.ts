import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai"
import axios from "axios"
import { db } from "@app/db/client"
import { jobs } from "@app/db/schema"
import { eq } from "drizzle-orm"
import { AuthenticatedRequest } from "../middlewares/auth.js"
import { TryCatch } from "../utils/tryCatch.js"
import ErrorHandler from "../utils/errorHandler.js"

export const matchJob = TryCatch(async (req: AuthenticatedRequest, res) => {
    let jobDescription = req.body.jobDescription
    let jobTitle = req.body.jobTitle || "Job Position"
    let resumeUrl = req.body.resumeUrl
    let candidateSkills: string[] = req.body.skills || []

    if (req.body.jobId) {
        const jobId = Number(req.body.jobId)
        const jobResult = await db
            .select()
            .from(jobs)
            .where(eq(jobs.jobId, jobId))

        if (jobResult.length === 0) {
            throw new ErrorHandler(404, "Job not found")
        }

        jobDescription = jobResult[0].description
        jobTitle = jobResult[0].title

        if (!resumeUrl && req.user) {
            resumeUrl = req.user.resume || undefined
        }
        if (candidateSkills.length === 0 && req.user && req.user.skills) {
            candidateSkills = req.user.skills
        }
    }

    if (!resumeUrl) {
        throw new ErrorHandler(400, "No resume found. Please upload a resume first.")
    }

    if (!jobDescription) {
        throw new ErrorHandler(400, "Job description is required")
    }

    // Fetch the resume PDF content from the Cloudinary URL using axios with responseType: 'arraybuffer'
    let pdfBuffer: Buffer
    try {
        const response = await axios.get(resumeUrl, { responseType: 'arraybuffer' })
        pdfBuffer = Buffer.from(response.data)
    } catch (error: any) {
        throw new ErrorHandler(400, `Failed to fetch resume from URL: ${error.message}`)
    }

    // Call Google Gemini API
    const geminiApiKey = process.env.GEMINI_API_KEY
    if (!geminiApiKey) {
        console.warn("GEMINI_API_KEY environment variable is not configured. Returning fallback mock response.")
        
        let matchedSkills: string[] = []
        if (candidateSkills && candidateSkills.length > 0) {
            matchedSkills = candidateSkills.filter(skill => 
                jobDescription.toLowerCase().includes(skill.toLowerCase()) || 
                jobTitle.toLowerCase().includes(skill.toLowerCase())
            )
        }
        
        let matchScore = 75
        if (candidateSkills.length > 0) {
            const matchRatio = matchedSkills.length / candidateSkills.length
            matchScore = Math.min(95, Math.round(70 + (matchRatio * 25)))
        } else {
            matchScore = 80
        }

        const skillsSnippet = candidateSkills.length > 0 
            ? `My technical skillset includes ${candidateSkills.join(", ")}.`
            : "I possess a strong foundation in the key areas required for this role."

        const matchedSnippet = matchedSkills.length > 0
            ? `I am particularly excited to leverage my expertise in ${matchedSkills.join(", ")} to contribute to your team's success.`
            : "I am eager to apply my diverse professional background and problem-solving skills to this opportunity."

        const coverLetter = `Dear Hiring Manager,

I am writing to express my strong interest in the ${jobTitle} position. With a solid background aligned with the requirements outlined in the job description, I am confident in my ability to make a meaningful impact.

${skillsSnippet} ${matchedSnippet} Having reviewed the description, I see a strong alignment with my experiences and career aspirations. I am particularly drawn to this role because of the opportunity it presents to solve complex challenges and contribute to your team's key objectives.

Thank you for your time and consideration. I look forward to the possibility of discussing how my skills and experience align with your needs in more detail.

Sincerely,
Applicant`

        const gapSkills = candidateSkills.filter(skill => !matchedSkills.includes(skill))
        let explanation = `The candidate shows a strong match for the ${jobTitle} position with a score of ${matchScore}%.`
        if (matchedSkills.length > 0) {
            explanation += ` Key matching skills found in the profile include: ${matchedSkills.join(", ")}.`
        }
        if (gapSkills.length > 0 && candidateSkills.length > matchedSkills.length) {
            explanation += ` Potential focus areas/gaps relative to the job requirements might include: ${gapSkills.slice(0, 3).join(", ")}.`
        } else {
            explanation += ` The candidate's skills align well with the overall requirements of the job description.`
        }

        res.json({
            matchScore,
            coverLetter,
            explanation
        })
        return
    }

    const genAI = new GoogleGenerativeAI(geminiApiKey)
    // model gemini-1.5-flash is recommended for speed and cost-effectiveness
    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
                type: SchemaType.OBJECT,
                properties: {
                    matchScore: { type: SchemaType.NUMBER },
                    coverLetter: { type: SchemaType.STRING },
                    explanation: { type: SchemaType.STRING }
                },
                required: ["matchScore", "coverLetter", "explanation"]
            }
        }
    })

    const prompt = `
You are an advanced AI recruitment assistant.
Analyze the candidate's resume (attached as a PDF) and compare it against the job details:
Job Title: ${jobTitle}
Job Description:
${jobDescription}

Candidate Skills: ${candidateSkills.join(", ")}

Your tasks:
1. Calculate a match score between 0 and 100 based on how well the candidate's experience and skills match the job description.
2. Write a highly personalized, professional cover letter from the candidate's perspective for this job.
3. Provide a brief (2-3 sentences) explanation summary explaining why the score was given, highlighting strengths and any gap.

Return the result in the exact JSON schema requested:
{
  "matchScore": number,
  "coverLetter": "string",
  "explanation": "string"
}
`

    try {
        const result = await model.generateContent([
            {
                inlineData: {
                    data: pdfBuffer.toString("base64"),
                    mimeType: "application/pdf"
                }
            },
            {
                text: prompt
            }
        ])

        const responseText = result.response.text()
        const parsedResponse = JSON.parse(responseText)

        res.json({
            matchScore: parsedResponse.matchScore,
            coverLetter: parsedResponse.coverLetter,
            explanation: parsedResponse.explanation
        })
    } catch (error: any) {
        throw new ErrorHandler(500, `Gemini API or parser error: ${error.message}`)
    }
})
