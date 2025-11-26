import express from 'express'
import db from '../db.js'

const router = express.Router()

router.get('/', async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT 
                d.*, 
                COALESCE(SUM(di.Quantity * di.PurchasePrice), 0) AS TotalAmount
            FROM Deliveries d
            LEFT JOIN DeliveryItems di ON d.DeliveryID = di.DeliveryID
            GROUP BY d.DeliveryID
            ORDER BY d.Date DESC
        `)

        res.json({
            success: true,
            deliveries: rows
        })
    }
    catch (error) {
        console.error('Deliveries error:', error)
        res.status(500).json({ error: 'Ошибка сервера' })
    }
})

export default router