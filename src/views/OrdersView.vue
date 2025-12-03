<script setup>
import OrdersTable from '@/components/ordersTable.vue'
import OrdersActivity from '@/components/OrdersActivity.vue'
import PredictiveSearch from '@/components/PredictiveSearch.vue'
</script>

<template>
  <main>
    <PredictiveSearch />
    <OrdersTable />
    <OrdersActivity />
  </main>
</template>

<style scoped>
main {
  display: grid;
  grid-template-columns: 2.17fr 1fr;
  gap: 20px;
  width: 100%;
  height: 100%;
  padding: 20px;
}
</style>
