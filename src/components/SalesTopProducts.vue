<script setup>
import { computed } from 'vue'
import { useSalesStore } from '@/stores/sales'
const store = useSalesStore()

const maxCount = computed(() => {
    return Math.max(...store.topProducts.map(p => p.count), 1)
})

const getWidth = (count) => {
    return `${(count / maxCount.value) * 100}%`
}
</script>

<template>
  <div class="top-container">
    <h3>Топ {{ store.topProducts.length }} товарів за Сьогодні</h3>
    
    <div class="products-grid">
      <div class="product-card" v-for="(product, index) in store.topProducts" :key="index">
        <div class="rank" :class="{'top-rank': index < 3}">
            {{ index + 1 }}
        </div>

        <div class="info">
            <div class="name-row">
                <span class="name">{{ product.name }}</span>
                <span class="count">{{ product.count }} шт.</span>
            </div>
            <div class="progress-bg">
                <div class="progress-fill" :style="{ width: getWidth(product.count) }"></div>
            </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.top-container {
  background: #fff;
  border: 1px solid #E5E7EB;
  border-radius: 5px;
  padding: 20px;
}

h3 {
  font-family: Montserrat;
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 20px;
}

.products-grid {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.product-card {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 12px;
    border: 1px solid #F3F4F6;
    border-radius: 10px;
    background: #F9FAFB;
    transition: 0.2s;
}

.product-card:hover {
    background: #fff;
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    border-color: #E5E7EB;
}

.rank {
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: #E5E7EB;
    font-weight: 700;
    font-family: Montserrat;
    color: #6B7280;
    font-size: 14px;
}


.top-rank {
    background: #DBEAFE;
    color: #2563EB;
}

.info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.name-row {
    display: flex;
    justify-content: space-between;
    font-family: Montserrat;
    font-size: 14px;
    font-weight: 600;
    color: #1F2937;
}

.count {
    color: #3B82F6;
}

.progress-bg {
    width: 100%;
    height: 6px;
    background: #E5E7EB;
    border-radius: 3px;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    background: #3B82F6;
    border-radius: 3px;
    transition: width 0.5s ease-out;
}
</style>