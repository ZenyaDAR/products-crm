<script setup>
import { useSalesStore } from '@/stores/sales'
const store = useSalesStore()

const formatDate = (dateInput) => {
  if (!dateInput) return ''
  const date = new Date(dateInput)
  if (isNaN(date)) return dateInput
  return date.toLocaleDateString('uk-UA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const formatPrice = (value) => {
  const num = Number(value)
  if (isNaN(num)) return '0.00'
  return num.toFixed(2)
}
</script>

<template>
  <div class="orders-container">
    <div class="header-title">
      <h3>Останні замовлення</h3>
    </div>
    
    <div class="table-scroll">
      <div class="table-content">
        <div class="row head">
          <div>№</div>
          <div>Дата</div>
          <div class="head-client">Клієнт</div>
          <div>К-сть</div>
          <div>Сума</div>
          <div>Статус</div>
        </div>

        <div v-if="store.recentOrders.length === 0" class="no-data">
          Замовлень поки немає
        </div>

        <div class="row" v-for="order in store.recentOrders" :key="order.id">
          <div class="id-col">#{{ order.id }}</div>
          <div>{{ formatDate(order.date) }}</div>
          <div class="client-col">{{ order.client || 'Невідомий' }}</div>
          <div>{{ order.quantity || 0 }}</div>
          <div>{{ formatPrice(order.sum) }}₴</div>
          <div>
            <div :class="['status', `status-${order.status ? order.status.toLowerCase() : 'completed'}`]">
              {{ order.status || 'Completed' }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.orders-container {
  background: #fff;
  border: 1px solid #E5E7EB;
  border-radius: 5px;
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 100%; 
  overflow: hidden; 
}

h3 {
    font-family: Montserrat;
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 5px;
    padding-left: 10px;
}

.table-scroll {
  overflow-x: auto;
  width: 100%;
  padding-bottom: 5px;
}

.table-content {
  min-width: 700px; 
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.row {
  display: grid;
  grid-template-columns: 40px 100px 1fr 80px 120px 140px; 
  align-items: center;
  text-align: center;
  font-family: Montserrat;
  font-size: 15px;
  font-weight: 500;
  color: #000;
  padding: 0 10px;
}

.head {
  font-weight: 600;
  color: #6B7280;
  font-size: 14px;
}

.head-client {
    text-align: left;
    padding-left: 120px; 
}

.row:not(.head) {
  padding: 20px 10px;
  border: 1px solid #E5E7EB;
  border-radius: 10px;
  box-shadow: 0 2px 16px 3px rgba(0, 0, 0, 0.06);
  background: #fff;
  transition: transform 0.2s;
}

.row:not(.head):hover {
    transform: translateY(-2px);
}

.id-col { text-align: left; font-weight: 600; padding-left: 10px; }

.client-col {
    text-align: left;
    padding-left: 80px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.status {
  font-family: Montserrat;
  font-weight: 600;
  font-size: 13px;
  padding: 6px 0;
  border-radius: 6px;
  width: 100px;
  margin: 0 auto;
  text-transform: capitalize;
  text-align: center;
  display: flex;
  justify-content: center;
}

.status-completed { background: #06D6A0; color: #FFFFFF; border: 1px solid #10B981; }
.status-draft { background: #F59E0B; color: #FFFFFF; border: 1px solid #F59E0B; }

.no-data {
  text-align: center;
  padding: 20px;
  color: #9CA3AF;
  font-family: Montserrat;
}
</style>