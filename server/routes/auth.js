import express from 'express'
import db from '../db.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const router = express.Router()
const JWT_SECRET = 'secret_key_123'

router.post('/login', async (req, res) => {
    try {
        const { login, password } = req.body

        if (!login || !password) {
            return res.status(400).json({ error: 'Логин и пароль обязательны' })
        }

        const [rows] = await db.execute(
            'SELECT * FROM Employees WHERE Login = ? AND Status = ?',
            [login, 'active']
        )

        if (rows.length === 0) {
            return res.status(401).json({ error: 'Пользователь не найден' })
        }

        const employee = rows[0]
        const isPasswordValid = await bcrypt.compare(password, employee.Password)

        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Неверный пароль' })
        }

        const token = jwt.sign(
            { id: employee.EmployeeID, role: employee.Role },
            JWT_SECRET,
            { expiresIn: '24h' }
        )

        res.json({
            success: true,
            token: token,
            user: {
                id: employee.EmployeeID,
                login: employee.Login,
                fullName: employee.FullName,
                role: employee.Role,
            },
        })
    }
    catch (error) {
        console.error('Login error:', error)
        res.status(500).json({ error: 'Ошибка сервера' })
    }
})

export default router