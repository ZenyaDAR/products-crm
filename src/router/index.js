import { createRouter, createWebHistory } from 'vue-router'

import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'deliveries',
      component: () => import('../views/DeliveriesView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/delivery/:id',
      name: 'delivery',
      component: () => import('../views/DeliveriesView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/warehouse',
      name: 'warehouse',
      component: () => import('../views/WarehouseView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/suppliers',
      name: 'suppliers',
      component: () => import('../views/DeliveriesView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/sales',
      name: 'sales',
      component: () => import('../views/SalesView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/suppliers',
      name: 'suppliers',
      component: () => import('../views/SuppliersView.vue')
    },
    {
      path: '/statistics',
      name: 'statistics',
      component: () => import('../views/DeliveriesView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/auth',
      name: 'authorization',
      component: () => import('../views/Authorization.vue'),
      meta: { guestOnly: true }
    },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.token) {
    return { name: 'authorization' }
  }

  if (to.meta.guestOnly && auth.token) {
    return { name: 'home' }
  }
})

export default router
