import express from 'express'
import db from '../db.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()

const router = express.Router()
const JWT_SECRET = process.env.JWT_SECRET

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1]
        if (!token) {
            return res.status(401).json({ error: 'Access token required' })
        }

        const decoded = jwt.verify(token, JWT_SECRET)
        if (decoded.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' })
        }

        req.user = decoded
        next()
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' })
    }
}

// Get all employees
router.get('/', requireAdmin, async (req, res) => {
    try {
        const [rows] = await db.execute(
            'SELECT EmployeeID, Login, FullName, Role, Status FROM Employees ORDER BY EmployeeID DESC'
        )
        res.json(rows)
    } catch (error) {
        console.error('Error fetching employees:', error)
        res.status(500).json({ error: 'Failed to fetch employees' })
    }
})

// Create new employee
router.post('/', requireAdmin, async (req, res) => {
    try {
        const { login, password, fullName, role } = req.body

        // Validation
        if (!login || !password || !fullName || !role) {
            return res.status(400).json({ error: 'All fields are required' })
        }

        if (!['admin', 'manager'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role. Must be admin or manager' })
        }

        // Check if login already exists
        const [existing] = await db.execute(
            'SELECT EmployeeID FROM Employees WHERE Login = ?',
            [login]
        )

        if (existing.length > 0) {
            return res.status(400).json({ error: 'Login already exists' })
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10)

        // Insert employee
        const [result] = await db.execute(
            'INSERT INTO Employees (Login, Password, FullName, Role, Status) VALUES (?, ?, ?, ?, ?)',
            [login, hashedPassword, fullName, role, 'active']
        )

        // Get created employee
        const [newEmployee] = await db.execute(
            'SELECT EmployeeID, Login, FullName, Role, Status FROM Employees WHERE EmployeeID = ?',
            [result.insertId]
        )

        res.status(201).json({
            success: true,
            employee: newEmployee[0]
        })
    } catch (error) {
        console.error('Error creating employee:', error)
        res.status(500).json({ error: 'Failed to create employee' })
    }
})

// Update employee
router.put('/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params
        const { fullName, role, status } = req.body

        // Validation
        if (role && !['admin', 'manager'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role. Must be admin or manager' })
        }

        if (status && !['active', 'inactive'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status. Must be active or inactive' })
        }

        // Check if employee exists
        const [existing] = await db.execute(
            'SELECT EmployeeID FROM Employees WHERE EmployeeID = ?',
            [id]
        )

        if (existing.length === 0) {
            return res.status(404).json({ error: 'Employee not found' })
        }

        // Build update query
        let updateFields = []
        let values = []

        if (fullName !== undefined) {
            updateFields.push('FullName = ?')
            values.push(fullName)
        }

        if (role !== undefined) {
            updateFields.push('Role = ?')
            values.push(role)
        }

        if (status !== undefined) {
            updateFields.push('Status = ?')
            values.push(status)
        }

        if (updateFields.length === 0) {
            return res.status(400).json({ error: 'No fields to update' })
        }

        values.push(id)

        // Update employee
        await db.execute(
            `UPDATE Employees SET ${updateFields.join(', ')} WHERE EmployeeID = ?`,
            values
        )

        // Get updated employee
        const [updatedEmployee] = await db.execute(
            'SELECT EmployeeID, Login, FullName, Role, Status FROM Employees WHERE EmployeeID = ?',
            [id]
        )

        res.json({
            success: true,
            employee: updatedEmployee[0]
        })
    } catch (error) {
        console.error('Error updating employee:', error)
        res.status(500).json({ error: 'Failed to update employee' })
    }
})

// Delete employee
router.delete('/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params

        // Check if employee exists
        const [existing] = await db.execute(
            'SELECT EmployeeID FROM Employees WHERE EmployeeID = ?',
            [id]
        )

        if (existing.length === 0) {
            return res.status(404).json({ error: 'Employee not found' })
        }

        // Don't allow deleting yourself
        if (req.user.id == id) {
            return res.status(400).json({ error: 'Cannot delete your own account' })
        }

        // Delete employee
        await db.execute(
            'DELETE FROM Employees WHERE EmployeeID = ?',
            [id]
        )

        res.json({ success: true })
    } catch (error) {
        console.error('Error deleting employee:', error)
        res.status(500).json({ error: 'Failed to delete employee' })
    }
})

export default router
