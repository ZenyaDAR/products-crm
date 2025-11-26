<script setup>
import { computed } from 'vue'
import { useDeliveriesStore } from '@/stores/deliveries'
const deliveriesStore = useDeliveriesStore()
deliveriesStore.fetchDeliveries()
const deliveries = computed(() => deliveriesStore.deliveries)

const formatDate = v => {
  if (!v) return ''
  const [y, m, d] = v.split('T')[0].split('-')
  return `${d}.${m}.${y}`
}
</script>

<template>
  <div class="order-card">
    <div class="row head">
      <div>Номер</div>
      <div>Постачальник</div>
      <div>Дата </div>
      <div>Сума</div>
      <div>Статус</div>
    </div>

    <div class="row" v-for="delivery in deliveries" :key="delivery.DeliveryID">
      <div>#{{ delivery.DeliveryID }}</div>
      <div>№{{ delivery.SupplierID }}</div>
      <div>{{ formatDate(delivery.Date) }}</div>
      <div>{{ Number(delivery.TotalAmount).toFixed(2) }}₴</div>
      <div :class="['status', `status-${delivery.Status}`]">
        {{ delivery.Status }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.order-card {
  background: #fff;
  border: 1px solid #E5E7EB;
  border-radius: 5px;
  padding: 15px;
  width: 100%;
  display: grid;
  gap: 15px;
}

.row {
  display: grid;
  grid-template-columns: auto repeat(4, 1fr);
  align-items: center;
  text-align: center;
  font-family: Montserrat;
  font-size: 16px;
  font-weight: 500;
  color: #000;
}

.head {
  font-weight: 600;
  padding-left: 20px;
  padding-right: 20px;
}

.row:not(.head) {
  padding: 24px 20px;
  border: 1px solid #E5E7EB;
  border-radius: 10px;
  box-shadow: 0 2px 16px 3px rgba(0, 0, 0, 0.06);
  background: #fff;
}

.row div:first-child {
    text-align: left;
    min-width: 70px;
}

.row > *{
    font-family: Montserrat;
    font-size: 16px;
    line-height: 1.1;
    font-weight: 500;
    color: #000;
}
.status{
  font-family: Montserrat;
  font-weight: 500;
  font-size: 15px;
  line-height: 1;
  padding: 4px 5px;
  border-radius: 4px;
  width: fit-content;
  margin: 0 auto;
  text-transform: capitalize;
  min-width: 100px;
}
.status-completed{
  background: #06D6A0;
  color: #FFFFFF;
  border: 1px solid #10B981;
}
.status-draft{
  background: #F59E0B;
  color: #FFFFFF;
  border: 1px solid #F59E0B;
}
</style>
