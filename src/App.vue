<script setup>
import { RouterView } from 'vue-router'
import AsideBar from '@/components/AsideBar.vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
</script>

<template>
  <AsideBar v-if="authStore.token" />
  <RouterView />
</template>

<style>
body {
  font-family: 'Montserrat', sans-serif;
}
#app {
  display: flex;
  background: #f9fafb;
  color: #000000;
}
/* Buttons */
.primary-btn,
.secondary-btn,
.ghost-btn {
  font-family: Montserrat, sans-serif;
  border: 1px solid transparent;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.primary-btn {
  background: #2563eb;
  color: #ffffff;
  padding: 10px 16px;
}

.primary-btn:hover {
  background: #1d4ed8;
}

.primary-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.secondary-btn {
  background: #ffffff;
  color: #111827;
  border-color: #e5e7eb;
  padding: 9px 14px;
}

.secondary-btn:hover {
  border-color: #2563eb;
  color: #2563eb;
}

.ghost-btn {
  background: transparent;
  color: #6b7280;
  padding: 6px 8px;
  border-color: transparent;
  font-size: 20px;
}

.ghost-btn:hover {
  color: #ef4444;
}
</style>
