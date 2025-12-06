<script setup>
import { computed } from 'vue'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from 'chart.js'
import { Bar } from 'vue-chartjs'
import { useSalesStore } from '@/stores/sales'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const store = useSalesStore()

const chartData = computed(() => {
  return {
    labels: store.chartData.labels,
    datasets: store.chartData.datasets
  }
})

const options = {
  responsive: true,
  maintainAspectRatio: false, 
  plugins: {
    legend: { display: false }
  }
}
</script>

<template>
  <div class="chart-container">
    <h3>Динаміка продажів</h3>
    <div class="chart-wrapper">
      <Bar :data="chartData" :options="options" />
    </div>
  </div>
</template>

<style scoped>
.chart-container {
  background: #fff;
  border: 1px solid #E5E7EB;
  border-radius: 10px;
  padding: 20px;
  height: 400px; 
  display: flex;
  flex-direction: column;
  overflow: hidden; 
  width: 100%;
}

h3 {
  font-family: Montserrat;
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 15px;
}

.chart-wrapper {
  flex: 1;
  position: relative;
  width: 100%;
  height: 100%;
}
</style>