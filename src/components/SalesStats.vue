<script setup>
import { useSalesStore } from '@/stores/sales'
const store = useSalesStore()

const currentMonth = new Date().toLocaleString('uk-UA', { month: 'long' })
const capitalizedMonth = currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1)
</script>

<template>
  <div class="stats-grid">
    
    <div class="card">
      <div class="title">Загальний дохід ({{ capitalizedMonth }})</div>
      <div class="value">{{ store.stats.monthIncome.toLocaleString() }} грн</div>
      <div :class="['change', store.stats.monthChange >= 0 ? 'positive' : 'negative']">
        {{ store.stats.monthChange > 0 ? '+' : '' }}{{ store.stats.monthChange }}% за минулий місяць
      </div>
    </div>
    
    <div class="card">
      <div class="title">Загальний дохід за сьогодні</div>
      <div class="value">{{ store.stats.dailyIncome.toLocaleString() }} грн</div>
      <div :class="['change', store.stats.dailyIncomeChange >= 0 ? 'positive' : 'negative']">
        {{ store.stats.dailyIncomeChange > 0 ? '+' : '' }}{{ store.stats.dailyIncomeChange }}% за вчора
      </div>
    </div>

    <div class="card">
      <div class="title">Кількість продажів ({{ capitalizedMonth }})</div>
      <div class="value">{{ store.stats.monthSalesCount }}</div>
      
      <div :class="['change', store.stats.monthSalesChange >= 0 ? 'positive' : 'negative']">
         {{ store.stats.monthSalesChange > 0 ? '+' : '' }}{{ store.stats.monthSalesChange }}% до минулого місяця
      </div>
    </div>

    <div class="card">
      <div class="title">Найпопулярніший товар за сьогодні</div>
      <div class="sub-value">{{ store.stats.topProductToday }}</div>
      <div class="count">{{ store.stats.topProductCount }} шт</div>
    </div>
  </div>
</template>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
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
  font-size: 24px;
  font-weight: 700;
  color: #111827;
}

.sub-value {
  font-family: Montserrat;
  font-size: 15px;
  font-weight: 600;
  color: #111827;
  line-height: 1.2;
}

.change {
  font-family: Montserrat;
  font-size: 13px;
  font-weight: 700;
  margin-top: 8px;
}

.positive { color: #10B981; }
.negative { color: #EF4444; }
.neutral { color: #9CA3AF; }

.count {
    font-size: 13px;
    font-weight: 700;
    color: #3f94ea;
    margin-top: 5px;
}
</style>