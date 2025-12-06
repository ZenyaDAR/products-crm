<script setup>
const props = defineProps({
  title: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <div class="page-toolbar">
    <div class="left">
      <slot name="left" />
    </div>
    <div class="center">
      <h1 v-if="props.title">{{ props.title }}</h1>
      <slot />
    </div>
    <div class="right">
      <slot name="right" />
    </div>
  </div>
</template>

<style scoped>
.page-toolbar {
  grid-column: 1 / 3;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
}
.left,
.right {
  display: flex;
  align-items: center;
  gap: 10px;
}
.center h1 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #111827;
}
</style>
