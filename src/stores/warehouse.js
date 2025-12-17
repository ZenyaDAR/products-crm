import { defineStore } from 'pinia'
import axios from '@/api/axios'

export const useWarehouseStore = defineStore('warehouse', {
  state: () => ({
    products: [],
    stats: {
      totalValue: 0,
      totalPositions: 0,
      lowStockCount: 0,
      lastReplenishment: null
    },
    categories: [],
    loading: false
  }),

  actions: {
    async fetchInventory(filters = {}) {
      this.loading = true
      try {
        const params = new URLSearchParams()
        if (filters.category) params.append('category', filters.category)
        if (filters.status) params.append('status', filters.status)

        const { data } = await axios.get(`/warehouse/inventory?${params.toString()}`)
        if (data.success) {
          this.products = data.products
        }
      } catch (error) {
        console.error('Failed to fetch inventory:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchStats() {
      try {
        const { data } = await axios.get('/warehouse/stats')
        if (data.success) {
          this.stats = data.stats
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error)
        throw error
      }
    },

    async fetchCategories() {
      try {
        const { data } = await axios.get('/warehouse/categories')
        if (data.success) {
          this.categories = data.categories
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error)
        throw error
      }
    },

    async updateProduct(sku, payload) {
      try {
        const { data } = await axios.put(`/warehouse/products/${sku}`, payload)
        return data
      } catch (error) {
        console.error('Failed to update product:', error)
        throw error
      }
    },

    async createProduct(payload) {
      try {
        const { data } = await axios.post('/warehouse/products', payload)
        return data
      } catch (error) {
        console.error('Failed to create product:', error)
        throw error
      }
    },

    async deleteProduct(sku) {
      try {
        const { data } = await axios.delete(`/warehouse/products/${sku}`)
        return data
      } catch (error) {
        console.error('Failed to delete product:', error)
        throw error
      }
    }
  }
})


