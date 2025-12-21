import { createRouter, createWebHistory } from 'vue-router'

import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/deliveries',
      name: 'deliveries',
      component: () => import('../views/DeliveriesView.vue'),
      meta: { requiresAuth: true, requiredRole: 'admin' }
    },
    {
      path: '/delivery/:id',
      name: 'delivery',
      component: () => import('../views/DeliveriesView.vue'),
      meta: { requiresAuth: true, requiredRole: 'admin' }
    },
    {
      path: '/',
      name: 'warehouse',
      component: () => import('../views/WarehouseView.vue'),
      meta: { requiresAuth: true, allowedRoles: ['admin', 'manager'] }
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
      component: () => import('../views/SuppliersView.vue'),
      meta: { requiresAuth: true, requiredRole: 'admin' }
    },
    {
      path: '/employees',
      name: 'employees',
      component: () => import('../views/EmployeesView.vue'),
      meta: { requiresAuth: true, requiredRole: 'admin' }
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
    return { name: 'warehouse' }
  }

  // Check role-based access
  if (to.meta.requiredRole && auth.user?.role !== to.meta.requiredRole) {
    return { name: 'warehouse' } // Redirect to default page if no permission
  }

  if (to.meta.allowedRoles && !to.meta.allowedRoles.includes(auth.user?.role)) {
    return { name: 'warehouse' } // Redirect to default page if no permission
  }
})

export default router
