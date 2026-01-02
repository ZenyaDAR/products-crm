import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { authenticateToken } from './middleware/auth.js'
import authRoutes from './routes/auth.js'
import deliveriesRoutes from './routes/deliveries.js'
import salesRoutes from './routes/sales.js'
import warehouseRoutes from './routes/warehouse.js'
import suppliersRoutes from './routes/suppliers.js'
import employeesRoutes from './routes/employees.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api/auth', authRoutes)
app.use('/api/deliveries', authenticateToken, deliveriesRoutes)
app.use('/api/sales', authenticateToken, salesRoutes)
app.use('/api/warehouse', authenticateToken, warehouseRoutes)
app.use('/api/suppliers', authenticateToken, suppliersRoutes)
app.use('/api/employees', authenticateToken, employeesRoutes)

app.get('/health', (req, res) => {
    res.json({ status: 'OK' })
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})

