import { defineStore } from 'pinia'
import axios from '@/api/axios'

export const useEmployeesStore = defineStore('employees', {
    state: () => ({
        employees: [],
        loading: false,
        error: null
    }),

    actions: {
        async fetchEmployees() {
            this.loading = true
            this.error = null
            try {
                const response = await axios.get('/employees')
                this.employees = response.data
            } catch (error) {
                this.error = error.response?.data?.error || 'Failed to fetch employees'
                console.error('Error fetching employees:', error)
            } finally {
                this.loading = false
            }
        },

        async createEmployee(employeeData) {
            try {
                const response = await axios.post('/employees', employeeData)
                this.employees.push(response.data.employee)
                return response.data
            } catch (error) {
                throw new Error(error.response?.data?.error || 'Failed to create employee')
            }
        },

        async updateEmployee(employeeId, employeeData) {
            try {
                const response = await axios.put(`/employees/${employeeId}`, employeeData)
                const index = this.employees.findIndex(emp => emp.EmployeeID === employeeId)
                if (index !== -1) {
                    this.employees[index] = response.data.employee
                }
                return response.data
            } catch (error) {
                throw new Error(error.response?.data?.error || 'Failed to update employee')
            }
        },

        async deleteEmployee(employeeId) {
            try {
                await axios.delete(`/employees/${employeeId}`)
                this.employees = this.employees.filter(emp => emp.EmployeeID !== employeeId)
            } catch (error) {
                throw new Error(error.response?.data?.error || 'Failed to delete employee')
            }
        }
    }
})
