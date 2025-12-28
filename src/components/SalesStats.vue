<script setup>
import { useSalesStore } from '@/stores/sales'
const store = useSalesStore()

const currentMonth = new Date().toLocaleString('en-US', { month: 'long' })
const capitalizedMonth = currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1)

const datePrev = new Date()
datePrev.setMonth(datePrev.getMonth() - 1)
const lastMonthName = datePrev.toLocaleString('en-US', { month: 'long' })
const capitalizedLastMonth = lastMonthName.charAt(0).toUpperCase() + lastMonthName.slice(1)

const datePrePrev = new Date()
datePrePrev.setMonth(datePrePrev.getMonth() - 2)
const prePrevMonthName = datePrePrev.toLocaleString('en-US', { month: 'long' })
const capitalizedPrePrevMonth = prePrevMonthName.charAt(0).toUpperCase() + prePrevMonthName.slice(1)
</script>

<template>
  <div class="stats-grid">
    <div class="card">
      <div class="title">Total Revenue ({{ capitalizedMonth }})</div>
      <div class="value">{{ store.stats.monthIncome.toLocaleString() }} ₴</div>
      <div :class="['change', store.stats.monthChange >= 0 ? 'positive' : 'negative']">
        {{ store.stats.monthChange > 0 ? '+' : '' }}{{ store.stats.monthChange }}% vs {{ capitalizedLastMonth }}
      </div>
    </div>
    
    <div class="card">
      <div class="title">Total Revenue Today</div>
      <div class="value">{{ store.stats.dailyIncome.toLocaleString() }} ₴</div>
      <div :class="['change', store.stats.dailyIncomeChange >= 0 ? 'positive' : 'negative']">
        {{ store.stats.dailyIncomeChange > 0 ? '+' : '' }}{{ store.stats.dailyIncomeChange }}% vs yesterday
      </div>
    </div>

    <div class="card">
      <div class="title">Total Sales ({{ capitalizedMonth }})</div>
      <div class="value">{{ store.stats.monthSalesCount }}</div>
      <div :class="['change', store.stats.monthSalesChange >= 0 ? 'positive' : 'negative']">
         {{ store.stats.monthSalesChange > 0 ? '+' : '' }}{{ store.stats.monthSalesChange }}% vs {{ capitalizedLastMonth }}
      </div>
    </div>

    <div class="card">
      <div class="title">Total Revenue ({{ capitalizedLastMonth }})</div>
      <div class="value">{{ store.stats.lastMonthIncome.toLocaleString() }} ₴</div>
      
      <div :class="['change', store.stats.lastMonthChange >= 0 ? 'positive' : 'negative']">
         {{ store.stats.lastMonthChange > 0 ? '+' : '' }}{{ store.stats.lastMonthChange }}% vs {{ capitalizedPrePrevMonth }}
      </div>
    </div>

  </div>
</template>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
}

.card {
  background: #fff;
  border: 1px solid #E5E7EB;
  border-radius: 10px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 140px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
}

.title {
  font-family: Montserrat;
  font-size: 13px;
  color: #6B7280;
  margin-bottom: 8px;
}

.value {
  font-family: Montserrat;
  font-size: 28px;
  font-weight: 700;
  color: #2563eb;
}

.change {
  font-family: Montserrat;
  font-size: 13px;
  font-weight: 700;
  margin-top: 8px;
}

.positive { 
  color: #10b981;
}
.negative { 
  color: #ef4444;
}
.neutral { 
  color: #6b7280;
}
</style>