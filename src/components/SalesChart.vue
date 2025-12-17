<script setup>
import { computed } from 'vue'
import {
  Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale
} from 'chart.js'
import { Bar } from 'vue-chartjs'
import { useSalesStore } from '@/stores/sales'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)
const store = useSalesStore()

const chartData = computed(() => ({
    labels: store.chartData.labels,
    datasets: store.chartData.datasets
}))

const options = {
  responsive: true,
  maintainAspectRatio: false, 
  plugins: { legend: { display: false } },
  scales: {
      y: { beginAtZero: true }
  }
}
</script>

<template>
  <div class="chart-container">
    <h3>Sales Overview</h3>
    <div class="chart-wrapper">
      <Bar :data="chartData" :options="options" />
    </div>
  </div>
</template>

<style scoped>
.chart-container {
  background: #fff;
  border: 1px solid #E5E7EB;
  border-radius: 5px;
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden; 
  width: 100%;
  box-sizing: border-box;
}

h3 {
  font-family: Montserrat;
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 15px;
  margin-top: 0;
}

.chart-wrapper {
  flex: 1;
  position: relative;
  width: 100%;
  min-height: 0;
}
</style>