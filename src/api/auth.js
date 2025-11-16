const API_BASE_URL = '/api/auth'

export const login = async (userLogin, password) => {
    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ login: userLogin, password }),
        })

        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.error || 'Ошибка авторизации')
        }

        return data
    }
    catch (error) {
        throw error
    }
}

