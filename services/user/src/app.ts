import express from 'express'
import cors from 'cors'
import userRoutes from './routes/user.js'

const app = express()

app.use(cors())
app.use(express.json())
app.use('/api/user',userRoutes)

export default app
