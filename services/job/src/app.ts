import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import jobRoutes from './routes/job.js' 

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

app.use('/jobs', jobRoutes)

export default app