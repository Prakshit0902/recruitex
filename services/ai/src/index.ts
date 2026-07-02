import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import aiRoutes from './routes/ai.js'

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/ai', aiRoutes)

const port = process.env.PORT || 5004
app.listen(port, () => {
    console.log(`AI service is running on port ${port}`)
})

export default app
