<script setup>
import { onMounted } from 'vue'
import { useSalesStore } from '@/stores/sales'

import PredictiveSearch from '@/components/PredictiveSearch.vue'
import SalesStats from '@/components/SalesStats.vue'
import SalesRecentTable from '@/components/SalesRecentTable.vue'
import SalesChart from '@/components/SalesChart.vue'
import SalesTopProducts from '@/components/SalesTopProducts.vue'

const store = useSalesStore()

onMounted(() => {
  store.fetchSalesData()
})
</script>

<template>
  <main class="sales-page">
    <div class="search-section">
        <PredictiveSearch />
    </div>

    <SalesStats />

    <div class="middle-section">
      <div class="table-wrap">
        <SalesRecentTable />
      </div>
      <div class="chart-wrap">
        <SalesChart />
      </div>
    </div>

    <div class="bottom-section">
      <SalesTopProducts />
    </div>
  </main>
</template>

<style scoped>
.sales-page {
  width: 100%;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-sizing: border-box; 

  overflow-x: hidden; 
  max-width: 100%;
}

.search-section {
    margin-bottom: 5px;
}

.middle-section {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(0, 1fr); 
  gap: 20px;
  align-items: start;
}

.bottom-section {
  width: 100%;
}
@media (max-width: 1280px) {
  .middle-section {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>