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
                COALESCE(inv.TotalStock, 0) AS StockQuantity,
                COALESCE(pen.PendingQty, 0) AS PendingQuantity,
                CASE 
                    WHEN COALESCE(inv.TotalStock, 0) = 0 THEN 'out_of_stock'
                    WHEN COALESCE(inv.TotalStock, 0) < p.MinStock THEN 'low_stock'
                    ELSE 'in_stock'
                END AS StockStatus
        
            FROM Products p
            LEFT JOIN Categories c ON p.CategoryID = c.CategoryID
            LEFT JOIN Suppliers s ON p.Supplier = s.SupplierID
            LEFT JOIN (
                SELECT SKU, SUM(Qty) AS TotalStock
                FROM inventory
                GROUP BY SKU
            ) inv ON p.SKU = inv.SKU
            LEFT JOIN (
                SELECT di.SKU, SUM(di.Quantity) AS PendingQty
                FROM deliveryitems di
                JOIN deliveries d ON di.DeliveryID = d.DeliveryID
                WHERE d.Status = 'pending'
                GROUP BY di.SKU
            ) pen ON p.SKU = pen.SKU
            WHERE p.Status = 'active'
        `

        const params = []

        if (category && category !== 'all') {
            query += ` AND c.Name = ?`
            params.push(category)
        }

        query += ` GROUP BY p.SKU, p.Name, c.Name, p.Unit, p.PurchasePrice, p.RetailPrice`

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
        res.status(500).json({ error: 'Помилка сервера' })
    }
})

// Get warehouse statistics
router.get('/stats', async (req, res) => {
    try {
        // Total warehouse value
        const [valueResult] = await db.query(`
            SELECT COALESCE(SUM(di.Quantity * p.PurchasePrice), 0) AS TotalValue
            FROM Products p
            LEFT JOIN DeliveryItems di ON p.SKU = di.SKU
            LEFT JOIN Deliveries d ON di.DeliveryID = d.DeliveryID AND d.Status = 'completed'
            WHERE p.Status = 'active'
        `)

        // Total positions
        const [positionsResult] = await db.query(`
            SELECT COUNT(DISTINCT p.SKU) AS TotalPositions
            FROM Products p
            WHERE p.Status = 'active'
        `)

        // Low stock items
        const [lowStockResult] = await db.query(`
            SELECT COUNT(*) AS LowStockCount
            FROM (
                SELECT 
                    p.SKU,
                    COALESCE(SUM(di.Quantity), 0) AS StockQuantity
                FROM Products p
                LEFT JOIN DeliveryItems di ON p.SKU = di.SKU
                LEFT JOIN Deliveries d ON di.DeliveryID = d.DeliveryID AND d.Status = 'completed'
                WHERE p.Status = 'active'
                GROUP BY p.SKU
                HAVING StockQuantity > 0 AND StockQuantity < 20
            ) AS LowStock
        `)

        // Last replenishment date
        const [lastReplenishmentResult] = await db.query(`
            SELECT MAX(d.Date) AS LastReplenishment
            FROM Deliveries d
            WHERE d.Status = 'completed'
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
        res.status(500).json({ error: 'Помилка сервера' })
    }
})

// Get available categories
router.get('/categories', async (req, res) => {
    try {
        const [categories] = await db.query(`
            SELECT DISTINCT c.Name
            FROM Categories c
            INNER JOIN Products p ON c.CategoryID = p.CategoryID
            WHERE p.Status = 'active'
            ORDER BY c.Name
        `)

        res.json({
            success: true,
            categories: categories.map(c => c.Name)
        })
    } catch (error) {
        console.error('Get categories error:', error)
        res.status(500).json({ error: 'Помилка сервера' })
    }
})

// Update product
router.put('/products/:sku', async (req, res) => {
    const { sku } = req.params
    const { purchasePrice, retailPrice } = req.body

    try {
        const updates = []
        const params = []

        if (purchasePrice !== undefined) {
            updates.push('PurchasePrice = ?')
            params.push(Number(purchasePrice))
        }

        if (retailPrice !== undefined) {
            updates.push('RetailPrice = ?')
            params.push(Number(retailPrice))
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'No fields to update' })
        }

        params.push(sku)

        await db.execute(
            `UPDATE Products SET ${updates.join(', ')} WHERE SKU = ?`,
            params
        )

        res.json({ success: true })
    } catch (error) {
        console.error('Update product error:', error)
        res.status(500).json({ error: 'Помилка сервера' })
    }
})

// Create new product
router.post('/products', async (req, res) => {
    const { name, sku, category, unit, purchasePrice, retailPrice, supplier, brand, minStock } = req.body

    if (!name || !sku || !category || !unit || !supplier) {
        return res.status(400).json({ error: 'Всі поля обов\'язкові' })
    }

    try {
        // First, get or create the category
        let categoryId
        const [existingCategory] = await db.query(
            'SELECT CategoryID FROM Categories WHERE Name = ?',
            [category]
        )

        if (existingCategory.length > 0) {
            categoryId = existingCategory[0].CategoryID
        } else {
            // Create new category if it doesn't exist
            const [result] = await db.execute(
                'INSERT INTO Categories (Name) VALUES (?)',
                [category]
            )
            categoryId = result.insertId
        }

        // Insert the product
        await db.execute(
            `INSERT INTO Products (SKU, Name, CategoryID, Unit, Brand, PurchasePrice, RetailPrice, MinStock, Supplier,  Status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
            [sku, name, categoryId, unit, brand, Number(purchasePrice) || 0, Number(retailPrice) || 0, Number(minStock) || 0, Number(supplier)]
        )

        res.json({ success: true })
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Товар з таким SKU вже існує' })
        }
        console.error('Create product error:', error)
        res.status(500).json({ error: 'Помилка сервера' })
    }
})

// Delete (deactivate) product
router.delete('/products/:sku', async (req, res) => {
    const { sku } = req.params

    try {
        await db.execute(
            `UPDATE Products SET Status = 'inactive' WHERE SKU = ?`,
            [sku]
        )

        res.json({ success: true })
    } catch (error) {
        console.error('Delete product error:', error)
        res.status(500).json({ error: 'Помилка сервера' })
    }
})

export default router

