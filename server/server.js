import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api/auth', authRoutes)

app.get('/health', (req, res) => {
    res.json({ status: 'OK' })
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})

