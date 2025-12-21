import express from 'express'
import db from '../db.js'

const router = express.Router()

const STATUS_VALUES = ['draft', 'pending', 'completed', 'canceled']

async function fetchDeliveryWithDetails(connection, deliveryId) {
    const [deliveryRows] = await connection.execute(`
        SELECT d.*, 
               s.SupplierID, s.Name AS SupplierName, s.Code AS SupplierCode,
               e.EmployeeID, e.FullName AS EmployeeName
        FROM Deliveries d
        JOIN Suppliers s ON d.SupplierID = s.SupplierID
        JOIN Employees e ON d.EmployeeID = e.EmployeeID
        WHERE d.DeliveryID = ?
    `, [deliveryId])

    if (!deliveryRows.length) {
        return null
    }

    const delivery = deliveryRows[0]

    const [items] = await connection.execute(`
        SELECT di.*, 
               p.Name AS ProductName, 
               p.Unit,
               p.PurchasePrice,
               p.RetailPrice,
               p.Brand
        FROM DeliveryItems di
        JOIN Products p ON di.SKU = p.SKU
        WHERE di.DeliveryID = ?
    `, [deliveryId])

    const [history] = await connection.execute(`
        SELECT h.*, e.FullName AS ChangedBy
        FROM DeliveryStatusHistory h
        JOIN Employees e ON h.EmployeeID = e.EmployeeID
        WHERE h.DeliveryID = ?
        ORDER BY h.ChangeDate DESC
    `, [deliveryId])

    return {
        ...delivery,
        items,
        history
    }
}

router.get('/', async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT 
                d.*, 
                COALESCE(SUM(di.Quantity * di.PurchasePrice), 0) AS TotalAmount
            FROM Deliveries d
            LEFT JOIN DeliveryItems di ON d.DeliveryID = di.DeliveryID
            GROUP BY d.DeliveryID
            ORDER BY d.DeliveryID DESC
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

router.get('/:id/available-products', async (req, res) => {
    try {
        const deliveryId = req.params.id
        const [deliveryRows] = await db.execute(
            'SELECT DeliveryID, SupplierID FROM Deliveries WHERE DeliveryID = ?',
            [deliveryId]
        )

        if (!deliveryRows.length) {
            return res.status(404).json({ error: 'Delivery not found' })
        }

        const delivery = deliveryRows[0]


        const [products] = await db.execute(
            `
            SELECT SKU, Name, Unit, PurchasePrice, RetailPrice, Supplier
            FROM Products
            WHERE Supplier = ? 
              AND Status = 'active'
              AND SKU NOT IN (SELECT SKU FROM DeliveryItems WHERE DeliveryID = ?)
        `,
            [delivery.SupplierID, deliveryId]
        )

        res.json({
            success: true,
            products
        })
    } catch (error) {
        console.error('Available products error:', error)
        res.status(500).json({ error: 'Помилка сервера' })
    }
})

router.get('/suppliers', async (req, res) => {
    try {
        const [suppliers] = await db.execute(`
            SELECT SupplierID, Name, Code 
            FROM Suppliers 
            WHERE Status = 'active'
            ORDER BY Name ASC
        `)
        res.json({ success: true, suppliers })
    } catch (error) {
        console.error('Suppliers list error:', error)
        res.status(500).json({ error: 'Помилка сервера' })
    }
})

router.get('/suppliers/:supplierId/products', async (req, res) => {
    try {
        const supplierId = req.params.supplierId
        const [products] = await db.execute(
            `
            SELECT SKU, Name, Unit, PurchasePrice, RetailPrice 
            FROM Products
            WHERE Supplier = ? AND Status = 'active'
            ORDER BY Name ASC
        `,
            [supplierId]
        )
        res.json({ success: true, products })
    } catch (error) {
        console.error('Supplier products error:', error)
        res.status(500).json({ error: 'Помилка сервера' })
    }
})

router.get('/:id', async (req, res) => {
    try {
        const deliveryId = req.params.id;

        // 1. Основная доставка + постачальник + працівник
        const [deliveryRows] = await db.execute(`
            SELECT d.*, 
                   s.SupplierID, s.Name AS SupplierName, s.Code AS SupplierCode,
                   e.EmployeeID, e.FullName AS EmployeeName
            FROM Deliveries d
            JOIN Suppliers s ON d.SupplierID = s.SupplierID
            JOIN Employees e ON d.EmployeeID = e.EmployeeID
            WHERE d.DeliveryID = ?
        `, [deliveryId]);

        if (deliveryRows.length === 0) {
            return res.status(404).json({ error: 'Delivery not found' });
        }

        const delivery = deliveryRows[0];

        // 2. Товари, які є в цій доставці
        const [items] = await db.execute(`
            SELECT di.*, 
                   p.Name AS ProductName, 
                   p.Unit,
                   p.PurchasePrice,
                   p.RetailPrice,
                   p.Brand
            FROM DeliveryItems di
            JOIN Products p ON di.SKU = p.SKU
            WHERE di.DeliveryID = ?
        `, [deliveryId]);

        // 3. Історія статусів
        const [history] = await db.execute(`
            SELECT h.*, e.FullName AS ChangedBy
            FROM DeliveryStatusHistory h
            JOIN Employees e ON h.EmployeeID = e.EmployeeID
            WHERE h.DeliveryID = ?
            ORDER BY h.ChangeDate DESC
        `, [deliveryId]);


        // Формуємо відповідь
        res.json({
            success: true,
            delivery: {
                ...delivery,
                items,    // Товари всередині цієї поставки
                history   // Історія змін
            },
        });

    } catch (error) {
        console.error('Delivery error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

router.put('/:id', async (req, res) => {
    const connection = await db.getConnection()
    try {
        const deliveryId = req.params.id
        const { status, items = [], employeeId } = req.body

        await connection.beginTransaction()

        const [deliveryRows] = await connection.execute(
            'SELECT * FROM Deliveries WHERE DeliveryID = ?',
            [deliveryId]
        )

        if (!deliveryRows.length) {
            await connection.rollback()
            return res.status(404).json({ error: 'Delivery not found' })
        }

        const delivery = deliveryRows[0]

        if (status && !STATUS_VALUES.includes(status)) {
            await connection.rollback()
            return res.status(400).json({ error: 'Invalid status value' })
        }

        if (status && status !== delivery.Status) {
            await connection.execute(
                'UPDATE Deliveries SET Status = ? WHERE DeliveryID = ?',
                [status, deliveryId]
            )
        }

        const itemsToInsert = Array.isArray(items)
            ? items.filter((item) => item?.SKU && Number(item?.Quantity) > 0)
            : []

        if (itemsToInsert.length) {
            const isCompleted = status === 'completed' || delivery.Status === 'completed'
            if (isCompleted) {
                await connection.rollback()
                return res.status(400).json({ error: 'Cannot modify items for completed delivery' })
            }

            const skuPlaceholders = itemsToInsert.map(() => '?').join(',')
            const skuValues = itemsToInsert.map((item) => item.SKU)

            const [products] = await connection.query(
                `SELECT SKU, Supplier FROM Products WHERE SKU IN (${skuPlaceholders})`,
                skuValues
            )

            const invalidSku = products.some((p) => p.Supplier !== delivery.SupplierID)
            if (invalidSku) {
                await connection.rollback()
                return res.status(400).json({ error: 'All products must belong to the same supplier' })
            }

            const [existingItems] = await connection.execute(
                'SELECT DeliveryItemID, SKU FROM DeliveryItems WHERE DeliveryID = ?',
                [deliveryId]
            )
            const existingMap = new Map(existingItems.map((i) => [i.DeliveryItemID, i.SKU]))

            const payloadIds = itemsToInsert
                .filter((i) => i.DeliveryItemID)
                .map((i) => Number(i.DeliveryItemID))

            const idsToDelete = existingItems
                .map((i) => i.DeliveryItemID)
                .filter((id) => !payloadIds.includes(id))

            if (idsToDelete.length) {
                const delPlaceholders = idsToDelete.map(() => '?').join(',')
                await connection.execute(
                    `DELETE FROM DeliveryItems WHERE DeliveryItemID IN (${delPlaceholders})`,
                    idsToDelete
                )
            }

            for (const item of itemsToInsert) {
                if (item.DeliveryItemID && existingMap.has(Number(item.DeliveryItemID))) {
                    await connection.execute(
                        `
                        UPDATE DeliveryItems
                        SET SKU = ?, Quantity = ?, PurchasePrice = ?, BatchNumber = ?, ManufactureDate = ?, ExpiryDate = ?
                        WHERE DeliveryItemID = ? AND DeliveryID = ?
                    `,
                        [
                            item.SKU,
                            item.Quantity,
                            item.PurchasePrice ?? 0,
                            item.BatchNumber || null,
                            item.ManufactureDate || null,
                            item.ExpiryDate || null,
                            item.DeliveryItemID,
                            deliveryId,
                        ]
                    )
                    continue
                }

                await connection.execute(
                    `
                    INSERT INTO DeliveryItems 
                    (DeliveryID, SKU, Quantity, PurchasePrice, BatchNumber, ManufactureDate, ExpiryDate)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `,
                    [
                        deliveryId,
                        item.SKU,
                        item.Quantity,
                        item.PurchasePrice ?? 0,
                        item.BatchNumber || null,
                        item.ManufactureDate || null,
                        item.ExpiryDate || null,
                    ]
                )
            }
        }

        await connection.commit()

        const updatedDelivery = await fetchDeliveryWithDetails(connection, deliveryId)

        res.json({
            success: true,
            delivery: updatedDelivery,
        })
    } catch (error) {
        console.error('Update delivery error:', error)
        await connection.rollback()
        res.status(500).json({ error: 'Server error' })
    } finally {
        connection.release()
    }
})

router.post('/', async (req, res) => {
    const connection = await db.getConnection()
    try {
        const { supplierId, employeeId = 1, items = [] } = req.body
        const date = req.body.date || new Date().toISOString().slice(0, 10)

        if (!supplierId) {
            return res.status(400).json({ error: 'Supplier is required' })
        }

        const [suppliers] = await connection.execute(
            'SELECT SupplierID FROM Suppliers WHERE SupplierID = ? AND Status = "active"',
            [supplierId]
        )
        if (!suppliers.length) {
            return res.status(404).json({ error: 'Supplier not found or inactive' })
        }

        const payloadItems = Array.isArray(items)
            ? items.filter((i) => i?.SKU && Number(i?.Quantity) > 0)
            : []

        if (!payloadItems.length) {
            return res.status(400).json({ error: 'You need to add at least one product' })
        }

        const skuPlaceholders = payloadItems.map(() => '?').join(',')
        const skuValues = payloadItems.map((i) => i.SKU)
        const [products] = await connection.query(
            `SELECT SKU, Supplier, PurchasePrice, Unit, Name FROM Products WHERE SKU IN (${skuPlaceholders})`,
            skuValues
        )

        const invalidSupplier = products.some((p) => p.Supplier !== Number(supplierId))
        if (invalidSupplier || products.length !== payloadItems.length) {
            return res.status(400).json({ error: 'Products must belong to supplier and be active' })
        }

        await connection.beginTransaction()

        const number = `DEL-${Date.now()}`

        const [deliveryResult] = await connection.execute(
            `
            INSERT INTO Deliveries (Number, Date, SupplierID, EmployeeID, Status)
            VALUES (?, ?, ?, ?, 'draft')
        `,
            [number, date, supplierId, employeeId]
        )

        const deliveryId = deliveryResult.insertId

        for (const item of payloadItems) {
            const p = products.find((pr) => pr.SKU === item.SKU)
            await connection.execute(
                `
                INSERT INTO DeliveryItems 
                (DeliveryID, SKU, Quantity, PurchasePrice, BatchNumber, ManufactureDate, ExpiryDate)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `,
                [
                    deliveryId,
                    item.SKU,
                    item.Quantity,
                    p?.PurchasePrice ?? 0,
                    item.BatchNumber || null,
                    item.ManufactureDate || null,
                    item.ExpiryDate || null,
                ]
            )
        }

        await connection.commit()

        const created = await fetchDeliveryWithDetails(connection, deliveryId)

        res.json({ success: true, delivery: created })
    } catch (error) {
        console.error('Create delivery error:', error)
        await connection.rollback()
        res.status(500).json({ error: 'Server error' })
    } finally {
        connection.release()
    }
})

export default router