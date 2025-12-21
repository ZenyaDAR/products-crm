<script setup>
import { onMounted, ref, computed } from 'vue'
import { useSuppliersStore } from '@/stores/suppliers'
import SupplierCard from '@/components/SupplierCard.vue'
import SupplierAddModal from '@/components/SupplierAddModal.vue'
import SupplierEditModal from '@/components/SupplierEditModal.vue'

const store = useSuppliersStore()
const isAddModalOpen = ref(false)
const isEditModalOpen = ref(false)
const selectedSupplier = ref(null)
const searchQuery = ref('')

onMounted(() => {
  store.fetchSuppliers()
})

const openEdit = (supplier) => {
  selectedSupplier.value = supplier
  isEditModalOpen.value = true
}

const filteredSuppliers = computed(() => {
  let result = [...store.suppliers]

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter((s) => {
      const nameMatch = s.Name.toLowerCase().includes(query)
      const phoneMatch = s.Phone.toLowerCase().includes(query)
      const addressMatch = s.Address && s.Address.toLowerCase().includes(query)
      return nameMatch || phoneMatch || addressMatch
    })
  }

  return result.sort((a, b) => {
    const statusA = (a.Status || '').toLowerCase()
    const statusB = (b.Status || '').toLowerCase()

    if (statusA === statusB) {
      return b.SupplierID - a.SupplierID
    }

    return statusA === 'active' ? -1 : 1
  })
})
</script>

<template>
  <main class="suppliers-page">
    <div class="page-header">
      <h1>Suppliers</h1>

      <div class="search-container">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by name, phone or city..."
          class="search-input"
        />
      </div>

      <button class="primary-btn" @click="isAddModalOpen = true">+ Add Supplier</button>
    </div>

    <div class="suppliers-grid">
      <SupplierCard
        v-for="s in filteredSuppliers"
        :key="s.SupplierID"
        :supplier="s"
        @click="openEdit(s)"
      />

      <div v-if="filteredSuppliers.length === 0" class="no-data">
        <span v-if="searchQuery">No suppliers match your search.</span>
        <span v-else>No suppliers found. Add the first one!</span>
      </div>
    </div>

    <SupplierAddModal :isOpen="isAddModalOpen" @close="isAddModalOpen = false" />

    <SupplierEditModal
      :isOpen="isEditModalOpen"
      :supplier="selectedSupplier"
      @close="isEditModalOpen = false"
    />
  </main>
</template>

<style scoped>
.suppliers-page {
  width: 100%;
  height: 100vh;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  box-sizing: border-box;
  overflow: hidden;
  background: #f9fafb;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
  gap: 20px;
  padding: 10px 0;
}

h1 {
  margin: 0;
  font-family: Montserrat;
  font-size: 24px;
  font-weight: 700;
  color: #111827;
  white-space: nowrap;
}

.search-container {
  flex: 1;
  display: flex;
  justify-content: center;
}

.search-input {
  width: 100%;
  max-width: 400px;
  padding: 10px 15px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-family: Montserrat;
  font-size: 14px;
  background: #fff;
  outline: none;
  transition: all 0.2s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.search-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
.suppliers-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  overflow-y: auto;
  padding-bottom: 20px;
  padding-top: 10px;
  padding-right: 5px;
  scrollbar-width: none;
}
.suppliers-grid::-webkit-scrollbar {
  display: none;
}

.no-data {
  grid-column: 1 / -1;
  text-align: center;
  color: #9ca3af;
  font-family: Montserrat;
  margin-top: 50px;
}

@media (max-width: 1400px) {
  .suppliers-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 900px) {
  .suppliers-grid {
    grid-template-columns: 1fr;
  }
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }
  .search-input {
    max-width: 100%;
  }
}
</style>
