import express from 'express'
import db from '../db.js'

const router = express.Router()

// Get warehouse inventory with stock levels
router.get('/inventory', async (req, res) => {
    try {
        const { category, status } = req.query

        let query = `
            SELECT
                p.SKU,
                p.Name AS ProductName,
                c.Name AS Category,
                s.Name AS Supplier,
                p.Unit,
                p.PurchasePrice,
                p.RetailPrice,
                p.MinStock AS MinQuantity,
                COALESCE(inv.TotalStock, 0) AS StockQuantity,
                CASE
                    WHEN COALESCE(inv.TotalStock, 0) = 0 THEN 'out_of_stock'
                    WHEN COALESCE(inv.TotalStock, 0) <= p.MinStock THEN 'low_stock'
                    ELSE 'in_stock'
                END AS StockStatus

            FROM products p
            LEFT JOIN categories c ON p.CategoryID = c.CategoryID
            LEFT JOIN suppliers s ON p.Supplier = s.SupplierID
            LEFT JOIN (
                SELECT SKU, SUM(Qty) AS TotalStock
                FROM inventory
                GROUP BY SKU
            ) inv ON p.SKU = inv.SKU
            WHERE p.Status = 'active'
        `

        const params = []

        if (category && category !== 'all') {
            query += ` AND c.Name = ?`
            params.push(category)
        }

        if (status && status !== 'all') {
            query += ` HAVING StockStatus = ?`
            params.push(status)
        }

        query += ` ORDER BY p.Name ASC`

        const [products] = await db.query(query, params)

        res.json({
            success: true,
            products
        })
    } catch (error) {
        console.error('Warehouse inventory error:', error)
        res.status(500).json({ error: 'Server Error' })
    }
})

// Get warehouse statistics
router.get('/stats', async (req, res) => {
    try {
        // Total warehouse value
        const [valueResult] = await db.query(`
            SELECT COALESCE(SUM(i.Qty * p.PurchasePrice), 0) AS TotalValue
            FROM products p
            JOIN inventory i ON p.SKU = i.SKU
            WHERE p.Status = 'active'
        `)

        // Total positions
        const [positionsResult] = await db.query(`
            SELECT COUNT(DISTINCT SKU) AS TotalPositions
            FROM products
            WHERE Status = 'active'
        `)

        // Low stock items
        const [lowStockResult] = await db.query(`
            SELECT COUNT(*) AS LowStockCount
            FROM products p
            LEFT JOIN (
                SELECT SKU, SUM(Qty) as qty FROM inventory GROUP BY SKU
            ) i ON p.SKU = i.SKU
            WHERE p.Status = 'active'
            AND COALESCE(i.qty, 0) > 0 
            AND COALESCE(i.qty, 0) <= p.MinStock
        `)

        // Last replenishment date
        const [lastReplenishmentResult] = await db.query(`
            SELECT MAX(Date) AS LastReplenishment
            FROM deliveries
            WHERE Status = 'completed'
        `)

        res.json({
            success: true,
            stats: {
                totalValue: Number(valueResult[0]?.TotalValue || 0),
                totalPositions: Number(positionsResult[0]?.TotalPositions || 0),
                lowStockCount: Number(lowStockResult[0]?.LowStockCount || 0),
                lastReplenishment: lastReplenishmentResult[0]?.LastReplenishment || null
            }
        })
    } catch (error) {
        console.error('Warehouse stats error:', error)
        res.status(500).json({ error: 'Server Error' })
    }
})

// Get available categories
router.get('/categories', async (req, res) => {
    try {
        const [categories] = await db.query(`
            SELECT Name FROM categories ORDER BY Name
        `)

        res.json({
            success: true,
            categories: categories.map(c => c.Name)
        })
    } catch (error) {
        console.error('Get categories error:', error)
        res.status(500).json({ error: 'Server Error' })
    }
})

// Update product
router.put('/products/:sku', async (req, res) => {
    const { sku } = req.params
    const { purchasePrice, retailPrice, minQuantity } = req.body

    try {
        await db.query(
            `UPDATE products SET PurchasePrice = ?, RetailPrice = ?, MinStock = ? WHERE SKU = ?`,
            [Number(purchasePrice), Number(retailPrice), Number(minQuantity), sku]
        )
        res.json({ success: true })
    } catch (error) {
        console.error('Update product error:', error)
        res.status(500).json({ error: 'Server Error' })
    }
})

// Create new product
router.post('/products', async (req, res) => {
    const { name, sku, category, unit, purchasePrice, retailPrice, supplier, minStock } = req.body

    if (!name || !sku || !category || !unit || !supplier) {
        return res.status(400).json({ error: 'All fields are required' })
    }

    try {
        // First, get or create the category
        let categoryId
        const [existingCategory] = await db.query(
            'SELECT CategoryID FROM categories WHERE Name = ?',
            [category]
        )

        if (existingCategory.length > 0) {
            categoryId = existingCategory[0].CategoryID
        } else {
            // Create new category if it doesn't exist
            const [result] = await db.query(
                'INSERT INTO categories (Name) VALUES (?)',
                [category]
            )
            categoryId = result.insertId
        }

        // Insert the product
        await db.query(
            `INSERT INTO products (SKU, Name, CategoryID, Unit, PurchasePrice, RetailPrice, Supplier, Status, MinStock)
             VALUES (?, ?, ?, ?, ?, ?, ?, 'active', ?)`,
            [sku, name, categoryId, unit, Number(purchasePrice) || 0, Number(retailPrice) || 0, Number(supplier), Number(minStock) || 10]
        )

        await db.query(`INSERT INTO inventory (SKU, Qty, Date, EmployeeID) VALUES (?, 0, NOW(), 1)`, [sku]
        )

        res.json({ success: true })
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'SKU already exists' })
        }
        console.error('Create product error:', error)
        res.status(500).json({ error: 'Server Error' })
    }
})

// Delete (deactivate) product
router.delete('/products/:sku', async (req, res) => {
    const { sku } = req.params
    try {
        await db.query(
            `UPDATE products SET Status = 'inactive' WHERE SKU = ?`,
            [sku]
        )
        res.json({ success: true })
    } catch (error) {
        console.error('Delete product error:', error)
        res.status(500).json({ error: 'Server Error' })
    }
})

export default router