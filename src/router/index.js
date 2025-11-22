import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '../views/HomeView.vue'

import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true }
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
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
