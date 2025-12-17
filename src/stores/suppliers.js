import { defineStore } from 'pinia'
import axios from '@/api/axios'

export const useSuppliersStore = defineStore('suppliers', {
  state: () => ({
    suppliers: [],
    isLoading: false
  }),
  
  actions: {
    async fetchSuppliers() {
      this.isLoading = true
      try {
        const response = await axios.get('/suppliers')
        this.suppliers = response.data
      } catch (error) {
        console.error('Error:', error)
      } finally {
        this.isLoading = false
      }
    },

    async addSupplier(supplierData) {
      try {
        const response = await axios.post('/suppliers', supplierData)
        this.suppliers.unshift(response.data)
        return true
      } catch (error) {
        console.error('Error:', error)
        return false
      }
    },

    async updateSupplier(id, data) {
        try {
            const response = await axios.put(`/suppliers/${id}`, data)
            const updatedItem = response.data
            const index = this.suppliers.findIndex(s => s.SupplierID === id)
            if (index !== -1) {
                this.suppliers[index] = updatedItem
            }
            return true
        } catch (error) {
            console.error('Error updating:', error)
            return false
        }
    },

    async toggleSupplierStatus(id, newStatus) {
        try {
            await axios.patch(`/suppliers/${id}/status`, { status: newStatus })
            
            const supplier = this.suppliers.find(s => s.SupplierID === id)
            if (supplier) {
                supplier.Status = newStatus
            }
            return true
        } catch (error) {
            console.error('Error toggling status:', error)
            return false
        }
    }
  }
})