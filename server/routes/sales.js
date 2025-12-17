import express from 'express'
import db from '../db.js'

const router = express.Router()

const calculateChange = (current, previous) => {
    const curr = Number(current)
    const prev = Number(previous)
    if (prev === 0) return curr > 0 ? 100 : 0
    return Math.round(((curr - prev) / prev) * 100)
}

router.get('/dashboard', async (req, res) => {
    try {
        const [statsRaw] = await db.query(`
            SELECT 
                COALESCE(SUM(CASE WHEN MONTH(DateTime) = MONTH(CURDATE()) AND YEAR(DateTime) = YEAR(CURDATE()) THEN TotalAmount ELSE 0 END), 0) as currentMonthIncome,
                COALESCE(SUM(CASE WHEN MONTH(DateTime) = MONTH(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)) AND YEAR(DateTime) = YEAR(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)) THEN TotalAmount ELSE 0 END), 0) as prevMonthIncome,
                COALESCE(SUM(CASE WHEN MONTH(DateTime) = MONTH(DATE_SUB(CURDATE(), INTERVAL 2 MONTH)) AND YEAR(DateTime) = YEAR(DATE_SUB(CURDATE(), INTERVAL 2 MONTH)) THEN TotalAmount ELSE 0 END), 0) as prePrevMonthIncome,
                COALESCE(SUM(CASE WHEN DATE(DateTime) = CURDATE() THEN TotalAmount ELSE 0 END), 0) as dailyIncome,
                COALESCE(SUM(CASE WHEN DATE(DateTime) = DATE_SUB(CURDATE(), INTERVAL 1 DAY) THEN TotalAmount ELSE 0 END), 0) as yesterdayIncome,
                COUNT(CASE WHEN MONTH(DateTime) = MONTH(CURDATE()) AND YEAR(DateTime) = YEAR(CURDATE()) THEN 1 END) as monthSalesCount,
                COUNT(CASE WHEN MONTH(DateTime) = MONTH(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)) AND YEAR(DateTime) = YEAR(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)) THEN 1 END) as prevMonthSalesCount
            FROM sales
        `)

        const s = statsRaw[0]

        const monthChange = calculateChange(s.currentMonthIncome, s.prevMonthIncome)
        const dayChange = calculateChange(s.dailyIncome, s.yesterdayIncome)
        const countChange = calculateChange(s.monthSalesCount, s.prevMonthSalesCount)
        const lastMonthChange = calculateChange(s.prevMonthIncome, s.prePrevMonthIncome) 

        const [recentOrders] = await db.query(`
            SELECT s.SaleID as id, s.DateTime as date, e.FullName as client, s.TotalAmount as sum,
            (SELECT SUM(Quantity) FROM saleitems WHERE SaleID = s.SaleID) as quantity
            FROM sales s LEFT JOIN employees e ON s.EmployeeID = e.EmployeeID
            ORDER BY s.DateTime DESC LIMIT 20
        `)
        
        const [topProducts] = await db.query(`
            SELECT p.Name as name, SUM(si.Quantity) as count
            FROM saleitems si JOIN sales s ON si.SaleID = s.SaleID JOIN products p ON si.SKU = p.SKU
            WHERE DATE(s.DateTime) = CURDATE()
            GROUP BY p.SKU, p.Name ORDER BY count DESC LIMIT 5
        `)

        const [chartRaw] = await db.query(`
            SELECT MONTH(DateTime) as month, SUM(TotalAmount) as total 
            FROM sales WHERE YEAR(DateTime) = YEAR(CURDATE())
            GROUP BY MONTH(DateTime) ORDER BY month ASC
        `)
        
        const salesByMonth = new Array(12).fill(0)
        chartRaw.forEach(r => { if (r.month >= 1 && r.month <= 12) salesByMonth[r.month - 1] = parseFloat(r.total) })
        const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

        res.json({
            stats: {
                monthIncome: Number(s.currentMonthIncome),
                monthChange: monthChange,
                dailyIncome: Number(s.dailyIncome),
                dailyIncomeChange: dayChange,
                monthSalesCount: Number(s.monthSalesCount),
                monthSalesChange: countChange,
                lastMonthIncome: Number(s.prevMonthIncome),
                lastMonthChange: lastMonthChange,
                topProductToday: topProducts.length > 0 ? topProducts[0].name : 'No sales',
                topProductCount: topProducts.length > 0 ? topProducts[0].count : 0
            },
            recentOrders: recentOrders.map(o => ({ ...o, status: 'Completed' })),
            topProducts: topProducts,
            chartData: {
                labels: monthLabels,
                datasets: [{ label: 'Sales (₴)', backgroundColor: '#3B82F6', data: salesByMonth }]
            }
        })

    } catch (error) {
        console.error('Error:', error)
        res.status(500).json({ message: 'Server Error' })
    }
})

export default router