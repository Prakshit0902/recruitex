import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import jobRoutes from './routes/job.js' 
import interviewRoutes from './routes/interview.js'
import quizRoutes from './routes/quiz.js'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

app.use('/api/job', jobRoutes)
app.use('/api/job/interview', interviewRoutes)
app.use('/api/job/quiz', quizRoutes)

export default app
