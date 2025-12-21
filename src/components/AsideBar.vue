<script setup>
import { computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import IconOrders from './icons/IconDeliveries.vue'
import IconWarehouse from './icons/IconWarehouse.vue'
import IconSuppliers from './icons/IconSuppliers.vue'
import IconSales from './icons/IconSales.vue'
import IconEmployees from './icons/IconEmployees.vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const router = useRouter()
const user = authStore.user

const logout = () => {
  authStore.logout()
  router.push('/auth')
}

const dayPart = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good Morning'
  if (hour < 18) return 'Good Afternoon'
  return 'Good Evening'
})

const adminName = computed(() => {
  if (user.fullName.split(' ').length > 1) {
    return user.fullName.split(' ')[1]
  }
  return user.fullName.split(' ')[0]
})
</script>

<template>
  <aside class="aside-bar">
    <div class="aside-bar__logo">{{ adminName }}<br />{{ dayPart }}!</div>
    <div class="aside-bar__menu">
      <RouterLink
        v-if="user.role === 'admin' || user.role === 'manager'"
        to="/"
        :class="{ active: $route.name === 'warehouse' }"
      >
        <IconWarehouse /> Warehouse
      </RouterLink>
      <RouterLink
        v-if="user.role === 'admin'"
        to="/deliveries"
        :class="{ active: $route.name === 'deliveries' || $route.name === 'delivery' }"
      >
        <IconOrders /> Orders
      </RouterLink>
      <RouterLink
        v-if="user.role === 'admin'"
        to="/suppliers"
        :class="{ active: $route.name === 'suppliers' }"
      >
        <IconSuppliers /> Suppliers
      </RouterLink>
      <RouterLink
        v-if="user.role === 'admin' || user.role === 'manager'"
        to="/sales"
        :class="{ active: $route.name === 'sales' }"
      >
        <IconSales /> Sales
      </RouterLink>
      <RouterLink
        v-if="user.role === 'admin'"
        to="/employees"
        :class="{ active: $route.name === 'employees' }"
      >
        <IconEmployees /> Employees
      </RouterLink>
    </div>
    <div class="aside-bar__logout">
      <button class="aside-bar__logout-button" @click="logout">Log Out</button>
    </div>
  </aside>
</template>

<style scoped>
.aside-bar {
  display: flex;
  flex-direction: column;
  width: 226px;
  flex: 0 0 226px;
  min-height: 100vh;
  background-color: #ffffff;
  border-right: 1px solid #e5e7eb;
}

.aside-bar__logo {
  display: flex;
  align-items: center;
  padding: 20px;
  font-family: Montserrat;
  font-weight: 500;
  font-size: 22px;
  letter-spacing: 0;
  line-height: 1.2;
  color: #000000;
  border-bottom: 1px solid #e5e7eb;
}

.aside-bar__menu {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
}
.aside-bar__menu a {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: Montserrat;
  font-size: 15px;
  font-weight: 600;
  line-height: 1;
  color: #111827;
  text-decoration: none;
}
.aside-bar__menu a.active {
  color: #3b82f6;
}
.aside-bar__logout {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: flex-end;
  padding: 20px;
  gap: 10px;
}
.aside-bar__logout-button {
  width: 100%;
  padding: 12px;
  background-color: #ef4444;
  color: #ffffff;
  border: none;
  border-radius: 10px;
  font-family: Montserrat;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.aside-bar__logout-button:hover {
  background-color: #dc2626;
}
</style>
