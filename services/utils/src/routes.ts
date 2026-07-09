import express from 'express' 
import cloudinary from 'cloudinary'
import streamifier from 'streamifier'
import multer from 'multer';

const router = express.Router()

const storage = multer.memoryStorage();
const upload = multer({ storage });


router.post('/upload', upload.single('file'), async (req,res) => {
    try {
        const {public_id} = req.body
        const file = req.file


        
        console.log(file)

        if (!file) {
            return res.status(400).json(
                {
                    message : 'No file provided'
                }
            )
        }

        if (public_id && typeof public_id === 'string' && public_id.trim() !== '' && public_id !== 'undefined' && public_id !== 'null'){
            await cloudinary.v2.uploader.destroy(public_id)
        }

        const uploadStream = () => {
            return new Promise((resolve,reject) => {
                const stream = cloudinary.v2.uploader.upload_stream(
                    {
                        folder : 'recruitex'
                    },
                    (error,result) => {
                        if (error) return reject(error)
                        resolve(result)
                    }
                )


                streamifier.createReadStream(file.buffer).pipe(stream)
            })
        }

        const result : any = await uploadStream()

        res.json({
            url : result.secure_url,
            public_id : result.public_id
        })

    } catch (error : any) {
        res.status(500).json({
            message : error.message
        })
    }
})

import Groq from "groq-sdk";
import { PDFParse } from "pdf-parse";
import { isAuth, AuthenticatedRequest } from "./auth.js";
import { processResume, queryResume, queryResumeVsJob, getResumeStatus } from "./resume-rag.js";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function askGroq(prompt: string): Promise<string> {
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });
  return completion.choices[0]?.message?.content ?? "";
}

// ── /career ──────────────────────────────────────────────────────────────────
router.post("/career", async (req, res) => {
  try {
    const { skills } = req.body;
    if (!skills) return res.status(400).json({ message: "Skills Required" });

    const prompt = `Based on the following skills: ${skills}. Generate a career path suggestion as a valid JSON object matching: {"summary": "", "jobOptions": [{"title": "", "responsibilities": "", "why": ""}], "skillsToLearn": [{"category": "", "skills": [{"title": "", "why": "", "how": ""}]}], "learningApproach": {"title": "", "points": [""]}}`;

    const rawText = (await askGroq(prompt)).replace(/```json/g, "").replace(/```/g, "").trim();
    res.json(JSON.parse(rawText));
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// ── /resume-analyser ─────────────────────────────────────────────────────────
router.post("/resume-analyser", async (req, res) => {
  try {
    const { pdfBase64 } = req.body;
    if (!pdfBase64) return res.status(400).json({ message: "PDF data is required" });

    const base64Data = pdfBase64.replace(/^data:application\/pdf;base64,/, "");
    const pdfBuffer = Buffer.from(base64Data, "base64");

    const parser = new PDFParse({ data: pdfBuffer });
    const pdfData = await parser.getText();
    await parser.destroy();
    const extractedText = pdfData.text.substring(0, 6000);

    const prompt = `Analyze this resume and provide an ATS compatibility JSON response: {"atsScore": 85, "scoreBreakdown": {"formatting": {"score": 90, "feedback": ""}, "keywords": {"score": 80, "feedback": ""}, "structure": {"score": 85, "feedback": ""}, "readability": {"score": 88, "feedback": ""}}, "suggestions": [{"category": "", "issue": "", "recommendation": "", "priority": "high"}], "strengths": [""], "summary": ""}. Resume: """${extractedText}"""`;

    const rawText = (await askGroq(prompt)).replace(/```json/g, "").replace(/```/g, "").trim();
    res.json(JSON.parse(rawText));
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// ── /ats-job-match ─────────────────────────────────────────────────────────────
router.post("/ats-job-match", async (req, res) => {
  try {
    const { pdfBase64, resumeUrl, jobDescription } = req.body;
    if (!jobDescription) return res.status(400).json({ message: "Job Description is required" });
    if (!pdfBase64 && !resumeUrl) return res.status(400).json({ message: "PDF or URL is required" });

    let pdfBuffer: Buffer;
    if (pdfBase64) {
      pdfBuffer = Buffer.from(pdfBase64.replace(/^data:application\/pdf;base64,/, ""), "base64");
    } else {
      const response = await fetch(resumeUrl);
      pdfBuffer = Buffer.from(await response.arrayBuffer());
    }

    const parser = new PDFParse({ data: pdfBuffer });
    const pdfData = await parser.getText();
    await parser.destroy();
    const extractedText = pdfData.text.substring(0, 6000);

    const prompt = `Compare resume against Job Description. Return valid JSON only: {"atsScore": 85, "scoreBreakdown": {"formatting": {"score": 90, "feedback": ""}, "keywords": {"score": 80, "feedback": ""}, "structure": {"score": 85, "feedback": ""}, "readability": {"score": 88, "feedback": ""}}, "suggestions": [{"category": "", "issue": "", "recommendation": "", "priority": "high"}], "strengths": [""], "summary": ""}. Job: """${jobDescription}""" Resume: """${extractedText}"""`;

    const rawText = (await askGroq(prompt)).replace(/<|im_start|>system\n.*?\n/gs, '').replace(/```json/g, "").replace(/```/g, "").trim();
    res.json(JSON.parse(rawText.replace(/[\u0000-\u001F\u007F-\u009F]/g, "")));
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// ── /generate-quiz ─────────────────────────────────────────────────────────────
router.post("/generate-quiz", async (req, res) => {
  try {
    const { jobDescription, questionCount = 5 } = req.body;
    if (!jobDescription) return res.status(400).json({ message: "Job Description is required" });

    const prompt = `Generate a ${questionCount}-question multiple-choice quiz based on Job Description. Valid JSON array only: [{"text": "", "options": ["", "", "", ""], "correct_answer_index": 0}]. Job: """${jobDescription}"""`;

    const rawText = (await askGroq(prompt)).replace(/<|im_start|>system\n.*?\n/gs, '').replace(/```json/g, "").replace(/```/g, "").trim();
    res.json(JSON.parse(rawText.replace(/[\u0000-\u001F\u007F-\u009F]/g, "")));
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// ── RESUME INTELLIGENCE (RAG) ─────────────────────────────────────
router.post("/resume/upload", isAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { userId, pdfBase64, resumeUrl } = req.body;
    const targetUserId = userId || req.user?.user_id;
    if (!targetUserId) return res.status(400).json({ message: "userId is required" });

    let pdfBuffer: Buffer;
    if (pdfBase64) {
      pdfBuffer = Buffer.from(pdfBase64.replace(/^data:application\/pdf;base64,/, ""), "base64");
    } else {
      const response = await fetch(resumeUrl);
      pdfBuffer = Buffer.from(await response.arrayBuffer());
    }

    const result = await processResume(targetUserId, pdfBuffer);
    res.json({ success: true, chunksCreated: result.chunksCreated, structured: result.structured });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/resume/query", isAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { userId, question } = req.body;
    const result = await queryResume(userId, question);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/resume/query-job", isAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { userId, question, jobDescription } = req.body;
    const result = await queryResumeVsJob(userId, question, jobDescription);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/resume/status/:userId", isAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const status = await getResumeStatus(parseInt(req.params.userId as string, 10));
    res.json(status);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
