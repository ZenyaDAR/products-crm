import express from 'express'
import db from '../db.js'

const router = express.Router()

router.get('/', async (req, res) => {
    try {
        const [suppliers] = await db.query(`
            SELECT * FROM suppliers 
            ORDER BY SupplierID DESC
        `)
        res.json(suppliers)
    } catch (error) {
        console.error('Error fetching suppliers:', error)
        res.status(500).json({ error: 'Server error' })
    }
})

router.post('/', async (req, res) => {
    const { 
        Name, Code, IBAN, Phone, Email, 
        Address, PaymentTerms, SLA_Days 
    } = req.body

    try {
        const [result] = await db.query(`
            INSERT INTO suppliers 
            (Name, Code, IBAN, Phone, Email, Address, PaymentTerms, SLA_Days, Status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Active')
        `, [Name, Code, IBAN, Phone, Email, Address, PaymentTerms || 'Prepaid', SLA_Days || 0])

        const [newSupplier] = await db.query('SELECT * FROM suppliers WHERE SupplierID = ?', [result.insertId])
        
        res.json(newSupplier[0])
    } catch (error) {
        console.error('Error adding supplier:', error)
        res.status(500).json({ error: 'Server error' })
    }
})

router.put('/:id', async (req, res) => {
    const supplierId = req.params.id
    const { Name, Code, IBAN, Phone, Email, Address, PaymentTerms, SLA_Days, Status } = req.body

    try {
        await db.query(`
            UPDATE suppliers 
            SET Name=?, Code=?, IBAN=?, Phone=?, Email=?, Address=?, PaymentTerms=?, SLA_Days=?, Status=?
            WHERE SupplierID=?
        `, [Name, Code, IBAN, Phone, Email, Address, PaymentTerms, SLA_Days, Status, supplierId])

        const [updated] = await db.query('SELECT * FROM suppliers WHERE SupplierID = ?', [supplierId])
        res.json(updated[0])
    } catch (error) {
        console.error('Error updating supplier:', error)
        res.status(500).json({ error: 'Server error' })
    }
})

router.patch('/:id/status', async (req, res) => {
    const supplierId = req.params.id
    const { status } = req.body

    try {
        await db.query(`
            UPDATE suppliers 
            SET Status = ? 
            WHERE SupplierID = ?
        `, [status, supplierId])
        
        res.json({ success: true, id: supplierId, newStatus: status })
    } catch (error) {
        console.error('Error toggling status:', error)
        res.status(500).json({ error: 'Server error' })
    }
})

export default router