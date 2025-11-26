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
#app{
  display: flex;
  background: #F9FAFB;
  color: #000000;
}
</style>
