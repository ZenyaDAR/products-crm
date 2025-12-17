<script setup>
import { onMounted, ref } from 'vue'
import { useSalesStore } from '@/stores/sales'

import SalesStats from '@/components/SalesStats.vue'
import SalesRecentTable from '@/components/SalesRecentTable.vue'
import SalesChart from '@/components/SalesChart.vue'
import SalesTopProducts from '@/components/SalesTopProducts.vue'

import SalesAllOrdersModal from '@/components/SalesAllOrders.vue' 

const store = useSalesStore()
const isAllOrdersOpen = ref(false)

onMounted(() => {
  store.fetchSalesData()
})
</script>

<template>
  <main class="sales-page">
    
    <div class="top-section">
       <SalesStats />
    </div>

    <div class="middle-section">
      <div class="table-wrap">
        <SalesRecentTable @open-all="isAllOrdersOpen = true" />
      </div>
      <div class="chart-wrap">
        <SalesChart />
      </div>
    </div>

    <div class="bottom-section">
      <SalesTopProducts />
    </div>
    <SalesAllOrdersModal 
        :isOpen="isAllOrdersOpen" 
        :orders="store.recentOrders"
        @close="isAllOrdersOpen = false"
    />

  </main>
</template>

<style scoped>
.sales-page {
  width: 100%;
  height: 100vh;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-sizing: border-box; 
  overflow: hidden; 
  background: #f9fafb;
}

.top-section { flex-shrink: 0; }

.middle-section {
  flex: 1; 
  min-height: 0; 
  display: grid;
  grid-template-columns: 2fr 1fr; 
  gap: 20px;
}

.table-wrap, .chart-wrap {
  height: 100%;
  min-height: 0; 
  overflow: hidden;
}

.bottom-section { flex-shrink: 0; }

@media (max-width: 1280px) {
  .sales-page { height: auto; overflow-y: auto; }
  .middle-section { grid-template-columns: 1fr; flex: none; height: auto; }
  .table-wrap { height: 500px; }
  .chart-wrap { height: 400px; }
}
</style>