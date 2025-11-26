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
    }
  }
})
