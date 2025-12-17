import { defineStore } from 'pinia'
import axios from '@/api/axios'

export const useSalesStore = defineStore('sales', {
  state: () => ({
    isLoading: false,
    stats: {
      monthIncome: 0,
      monthChange: 0,
      dailyIncome: 0,
      dailyIncomeChange: 0,
      
      monthSalesCount: 0,
      monthSalesChange: 0,
      lastMonthIncome: 0, 
      lastMonthChange: 0
    },
    recentOrders: [],
    topProducts: [],
    chartData: {
      labels: [],
      datasets: [{ label: 'Sales (₴)', backgroundColor: '#3B82F6', data: [] }]
    }
  }),
  actions: {
    async fetchSalesData() {
      this.isLoading = true
      try {
        const response = await axios.get('/sales/dashboard')
        const data = response.data
        
        if (data.stats) {
            this.stats = { 
                ...this.stats, 
                ...data.stats
            }
        }
        
        this.recentOrders = data.recentOrders || []
        this.topProducts = data.topProducts || []
        
        if (data.chartData) {
          this.chartData = data.chartData
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        this.isLoading = false
      }
    }
  }
})