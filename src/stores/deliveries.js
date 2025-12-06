import { defineStore } from 'pinia'
import axios from '@/api/axios'

export const useDeliveriesStore = defineStore('deliveries', {
  state: () => ({
    deliveries: []
  }),

  actions: {
    async fetchDeliveries() {
      const { data } = await axios.get('/deliveries')
      if (data.success) {
        this.deliveries = data.deliveries
        return this.deliveries
      } else {
        throw new Error('Failed to fetch deliveries')
      }
    },
    async getDelivery(deliveryId) {
      const { data } = await axios.get(`/deliveries/${deliveryId}`)
      if (data.success) {
        this.delivery = data.delivery
        return this.delivery
      } else {
        throw new Error('Failed to fetch delivery')
      }
    },
    async createDelivery(payload) {
      const { data } = await axios.post('/deliveries', payload)
      if (data.success) {
        await this.fetchDeliveries()
        return data.delivery
      }
      throw new Error(data.error || 'Failed to create delivery')
    },
    async updateDelivery(deliveryId, payload) {
      const { data } = await axios.put(`/deliveries/${deliveryId}`, payload)
      if (data.success) {
        await this.fetchDeliveries()
        return data.delivery
      }
      throw new Error(data.error || 'Failed to update delivery')
    },
    async getAvailableProducts(deliveryId) {
      const { data } = await axios.get(`/deliveries/${deliveryId}/available-products`)
      if (data.success) {
        return data.products
      }
      return []
    },
    async getSuppliers() {
      const { data } = await axios.get('/deliveries/suppliers')
      if (data.success) return data.suppliers
      return []
    },
    async getSupplierProducts(supplierId) {
      const { data } = await axios.get(`/deliveries/suppliers/${supplierId}/products`)
      if (data.success) return data.products
      return []
    }
  }
})
