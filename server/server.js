import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
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
app.use('/api/deliveries', deliveriesRoutes)
app.use('/api/sales', salesRoutes)
app.use('/api/warehouse', warehouseRoutes)
app.use('/api/suppliers', suppliersRoutes)
app.use('/api/employees', employeesRoutes)

app.get('/health', (req, res) => {
    res.json({ status: 'OK' })
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})

