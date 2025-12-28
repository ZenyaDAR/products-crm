<script setup>
import { computed } from 'vue'

const props = defineProps({
  supplier: Object,
})

const isActive = computed(() => {
  return props.supplier.Status && props.supplier.Status.toLowerCase() === 'active'
})
</script>

<template>
  <div class="card">
    <div class="header">
      <div class="name-section">
        <h3>{{ supplier.Name }}</h3>
        <span class="code">Code: {{ supplier.Code }}</span>
      </div>

      <span :class="['status', isActive ? 'status-active' : 'status-inactive']">
        {{ supplier.Status }}
      </span>
    </div>

    <div class="info-grid">
      <div class="info-item">
        <span class="label">IBAN:</span>
        <span class="value">{{ supplier.IBAN }}</span>
      </div>
      <div class="info-item">
        <span class="label">Phone:</span>
        <span class="value">{{ supplier.Phone }}</span>
      </div>
      <div class="info-item">
        <span class="label">Email:</span>
        <span class="value">{{ supplier.Email }}</span>
      </div>
      <div class="info-item">
        <span class="label">Address:</span>
        <span class="value">{{ supplier.Address }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
  border-color: #3b82f6;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

h3 {
  margin: 0;
  font-family: Montserrat;
  font-size: 16px;
  font-weight: 700;
  color: #111827;
}

.code {
  font-size: 12px;
  color: #9ca3af;
  font-family: Montserrat;
}

.status {
    font-family: Montserrat;
    font-weight: 600;
    font-size: 13px;
    text-transform: capitalize;
    color: #ffffff;
    border-radius: 6px;
    padding: 4px 12px;
    min-width: 80px;
    text-align: center;
}

.status-active { 
    background-color: #10b981; 
    border: none;
}

.status-inactive { 
    background-color: #6b7280; 
    border: none;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.full-width {
  grid-column: 1 / -1;
}

.label {
  font-size: 11px;
  color: #6b7280;
  font-family: Montserrat;
  font-weight: 600;
  text-transform: uppercase;
}

.value {
  font-size: 13px;
  color: #1f2937;
  font-family: Montserrat;
  font-weight: 500;
  word-break: break-word;
}
</style>
