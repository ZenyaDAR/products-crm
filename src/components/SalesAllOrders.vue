<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  isOpen: Boolean,
  orders: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close'])

const searchQuery = ref('')
const dateFrom = ref('')
const dateTo = ref('')

const filteredOrders = computed(() => {
  return props.orders.filter(order => {
    const query = searchQuery.value.toLowerCase()
    const matchesSearch = 
      order.client.toLowerCase().includes(query) || 
      String(order.id).includes(query)

    if (!matchesSearch) return false

    if (!order.date) return false
    const orderDateStr = new Date(order.date).toISOString().split('T')[0]

    if (dateFrom.value && orderDateStr < dateFrom.value) return false
    if (dateTo.value && orderDateStr > dateTo.value) return false

    return true
  })
})

const filteredSum = computed(() => {
    return filteredOrders.value.reduce((acc, order) => acc + Number(order.sum), 0)
})

const resetFilters = () => {
    searchQuery.value = ''
    dateFrom.value = ''
    dateTo.value = ''
}

const formatDate = (dateInput) => {
  if (!dateInput) return ''
  return new Date(dateInput).toLocaleDateString('en-GB', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  })
}

const formatPrice = (val) => Number(val).toFixed(2)
</script>

<template>
  <transition name="fade">
    <div v-if="isOpen" class="modal-overlay" @click.self="emit('close')">
      <div class="modal-card">
        
        <header class="modal-header">
          <h2>All Sales</h2>
          <button class="close-btn" @click="emit('close')">✕</button>
        </header>

        <div class="filters-container">
            <div class="search-row">
                <input 
                    v-model="searchQuery" 
                    type="text" 
                    placeholder="Search by customer or ID..." 
                    class="search-input"
                />
            </div>
            
            <div class="dates-row">
                <div class="date-group">
                    <label>From:</label>
                    <input type="date" v-model="dateFrom" class="date-input">
                </div>
                <div class="date-group">
                    <label>To:</label>
                    <input type="date" v-model="dateTo" class="date-input">
                </div>
                
                <button 
                    v-if="dateFrom || dateTo || searchQuery" 
                    class="reset-btn" 
                    @click="resetFilters"
                >
                    Reset filters
                </button>
            </div>
        </div>

        <div class="modal-body custom-scroll">
            <table class="full-table">
                <thead>
                    <tr>
                        <th style="width: 60px">№</th>
                        <th style="width: 100px">Date</th>
                        <th>Customer</th>
                        <th style="width: 100px">Amount</th>
                        <th style="width: 100px">Status</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="order in filteredOrders" :key="order.id">
                        <td>#{{ order.id }}</td>
                        <td>{{ formatDate(order.date) }}</td>
                        <td>{{ order.client || 'Unknown' }}</td>
                        <td class="price">{{ formatPrice(order.sum) }}₴</td>
                        <td>
                            <span class="status-badge">Completed</span>
                        </td>
                    </tr>
                    <tr v-if="filteredOrders.length === 0">
                        <td colspan="5" class="no-results">
                            No results found
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <footer class="modal-footer">
          <div class="count-info">
             <span>Found: <b>{{ filteredOrders.length }}</b></span>
             <span class="separator">•</span>
             <span>Total: <b>{{ formatPrice(filteredSum) }}₴</b></span>
          </div>

          <button class="primary-btn" @click="emit('close')">Close</button>
        </footer>

      </div>
    </div>
  </transition>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(17, 24, 39, 0.5);
  backdrop-filter: blur(2px);
  display: grid;
  place-items: center;
  z-index: 100;
  padding: 20px;
}

.modal-card {
  background: #fff;
  width: 100%;
  max-width: 800px;
  height: 80vh;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid #E5E7EB;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #F9FAFB;
}

.modal-header h2 {
  margin: 0;
  font-family: Montserrat;
  font-size: 20px;
  font-weight: 600;
  color: #111827;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #6B7280;
}

.filters-container {
    padding: 15px 20px;
    border-bottom: 1px solid #E5E7EB;
    display: flex;
    flex-direction: column;
    gap: 12px;
    background: #fff;
}

.search-input {
    width: 100%;
    padding: 10px 15px;
    border: 1px solid #D1D5DB;
    border-radius: 8px;
    font-family: Montserrat;
    font-size: 14px;
    outline: none;
}
.search-input:focus {
    border-color: #3B82F6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.dates-row {
    display: flex;
    gap: 20px;
    align-items: center;
}

.date-group {
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: Montserrat;
    font-size: 14px;
    color: #374151;
}

.date-input {
    padding: 8px 10px;
    border: 1px solid #D1D5DB;
    border-radius: 6px;
    font-family: Montserrat;
    font-size: 13px;
    outline: none;
    color: #111827;
}
.date-input:focus {
    border-color: #3B82F6;
}

.reset-btn {
    margin-left: auto;
    background: none;
    border: none;
    color: #EF4444;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    font-family: Montserrat;
}
.reset-btn:hover {
    text-decoration: underline;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}

.full-table {
    width: 100%;
    border-collapse: collapse;
    font-family: Montserrat;
    font-size: 14px;
}

.full-table th {
    text-align: left;
    padding: 12px 20px;
    background: #F9FAFB;
    color: #111827;
    font-weight: 600;
    font-size: 13px;
    position: sticky;
    top: 0;
    border-bottom: 1px solid #E5E7EB;
    z-index: 10;
}

.full-table td {
    padding: 12px 20px;
    border-bottom: 1px solid #F3F4F6;
    color: #1F2937;
    font-weight: 400;
}

.full-table tr:hover { 
  background: #F9FAFB; 
}

.price { 
  font-weight: 600; 
}

.status-badge {
    font-family: Montserrat;
    display: inline-block;
    background-color: #10b981;
    color: #ffffff;
    padding: 4px 12px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 600;
    text-align: center;
}

.modal-footer {
  padding: 15px 20px;
  border-top: 1px solid #E5E7EB;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #F9FAFB;
}

.count-info {
    font-size: 14px;
    color: #6B7280;
    font-family: Montserrat;
    display: flex;
    align-items: center;
    gap: 8px;
}

.count-info b {
    color: #111827;
}

.separator {
    color: #D1D5DB;
    font-size: 16px;
}

.no-results { 
  text-align: center; padding: 30px; color: #9CA3AF; 
}

.fade-enter-active, .fade-leave-active { 
  transition: opacity 0.2s; 
}
.fade-enter-from, .fade-leave-to { 
  opacity: 0; 
}
</style>