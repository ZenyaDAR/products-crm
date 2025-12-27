<script setup>
import { useSalesStore } from '@/stores/sales'
const store = useSalesStore()

defineEmits(['open-all'])

const formatDate = (dateInput) => {
  if (!dateInput) return ''
  const date = new Date(dateInput)
  if (isNaN(date)) return dateInput
  return date.toLocaleDateString('en-GB', {
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
    <div class="header-row">
      <h3>Recent Sales</h3>
      <button class="view-all-btn" @click="$emit('open-all')">
        All Sales &rarr;
      </button>
    </div>
    
    <div class="table-content">
        <div class="row head">
            <div>№</div>
            <div>Date</div>
            <div class="align-left">Customer</div>
            <div>Amount</div>
            <div>Status</div>
        </div>

        <div class="rows-scroll">
            <div v-if="store.recentOrders.length === 0" class="no-data">
                No sales yet
            </div>

            <div class="row" v-for="order in store.recentOrders" :key="order.id">
                <div class="id-col">#{{ order.id }}</div>
                <div>{{ formatDate(order.date) }}</div>
                <div class="client-col align-left" :title="order.client">
                    {{ order.client || 'Unknown' }}
                </div>
                <div>{{ formatPrice(order.sum) }}₴</div>
                
                <div class="status-col">
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
  width: 100%; 
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 15px 0 0 0; 
  overflow: hidden; 
}

.header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 20px 15px 20px;
}

h3 {
    font-family: Montserrat;
    font-size: 18px;
    font-weight: 600;
    margin: 0;
}

.view-all-btn {
    background: transparent;
    border: none;
    color: #2563eb; 
    font-family: Montserrat;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: color 0.2s;
}

.view-all-btn:hover {
    color: #1d4ed8; 
    text-decoration: underline;
}

.table-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 0 15px 15px 15px;
    overflow: hidden; 
}

.row {
  display: grid;
  grid-template-columns: 35px minmax(0, 1fr) minmax(0, 2fr) minmax(0, 1fr) 100px;
  align-items: center;
  text-align: center;
  font-family: Montserrat;
  font-size: 15px;
  font-weight: 400;
  color: #000;
  padding: 0 5px;
  gap: 2px;      
}

.row > div {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 0; 
}

.head {
  padding-bottom: 10px;
  border-bottom: 1px solid transparent;
  padding-left: 15px;
  padding-right: 15px;
}

.head > div {
  font-weight: 600 !important;
  color: #6B7280;
  font-size: 13px;
}

.rows-scroll {
    overflow-y: auto;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 5px;
    scrollbar-width: none; 
}
.rows-scroll::-webkit-scrollbar { 
  display: none; 
}

.row:not(.head) {
  padding: 15px 5px;
  border: 3px solid transparent; 
  outline: 1px solid #e5e7eb;
  border-radius: 10px;
  box-shadow: 0 2px 16px 3px rgba(0, 0, 0, 0.06);
  background: #fff;
  transition: transform 0.2s;
  cursor: pointer;
}

.row:not(.head):hover {
    transform: translateY(-2px);
    outline-color: #3B82F6;
}

.align-left { 
  text-align: left; 
}

.id-col { 
  font-weight: 400; 
  text-align: left; 
  padding-left: 5px; 
}

.client-col { 
  font-weight: 400; 
}

.status-col { 
  display: flex; 
  justify-content: center; 
}

.status {
  font-family: Montserrat;
  font-weight: 600;
  font-size: 13px; 
  padding: 4px 12px;
  border-radius: 6px;
  width: 100%;
  text-transform: capitalize;
  text-align: center;
  white-space: nowrap;
  color: #ffffff;
}

.status-completed { 
    background-color: #10b981; 
    border: none; 
}

.no-data { 
  text-align: center; 
  padding: 20px; 
  color: #9CA3AF; 
  font-family: Montserrat; 
}
</style>
