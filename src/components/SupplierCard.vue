<script setup>
import { computed } from 'vue'

const props = defineProps({
  supplier: Object
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
            <span class="label">Phone:</span>
            <span class="value">{{ supplier.Phone }}</span>
        </div>
        <div class="info-item">
            <span class="label">Email:</span>
            <span class="value">{{ supplier.Email }}</span>
        </div>
        <div class="info-item full-width">
            <span class="label">Address:</span>
            <span class="value">{{ supplier.Address }}</span>
        </div>
    </div>
  </div>
</template>

<style scoped>
.card {
    background: #fff;
    border: 1px solid #E5E7EB;
    border-radius: 12px;
    padding: 20px;
    transition: transform 0.2s, box-shadow 0.2s;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.card:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 25px rgba(0,0,0,0.08);
    border-color: #3B82F6;
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
    color: #9CA3AF;
    font-family: Montserrat;
}

.status {
    font-size: 11px;
    font-weight: 700;
    padding: 4px 10px;
    border-radius: 20px;
    font-family: Montserrat;
    text-transform: capitalize;
}

.status-active { 
    background: #DCFCE7; 
    color: #166534; 
    border: 1px solid #BBF7D0;
}

.status-inactive { 
    background: #FFEDD5;
    color: #9A3412;
    border: 1px solid #FED7AA;
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
    color: #6B7280;
    font-family: Montserrat;
    font-weight: 600;
    text-transform: uppercase;
}

.value {
    font-size: 13px;
    color: #1F2937;
    font-family: Montserrat;
    font-weight: 500;
    word-break: break-word;
}
</style>