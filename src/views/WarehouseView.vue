<script setup>
import { onMounted, ref, computed } from 'vue'
import { useWarehouseStore } from '@/stores/warehouse'
import { useDeliveriesStore } from '@/stores/deliveries'
import PageToolbar from '@/components/PageToolbar.vue'

const warehouseStore = useWarehouseStore()
const deliveriesStore = useDeliveriesStore()

const selectedCategory = ref('all')
const selectedStatus = ref('all')
const searchQuery = ref('')

const isCreateModalOpen = ref(false)
const isEditModalOpen = ref(false)

const editingProduct = ref(null)
const isSaving = ref(false)
const errorMessage = ref('')

const suppliers = ref([])

const createForm = ref({
  name: '',
  sku: '',
  category: '',
  unit: 'kg',
  purchasePrice: 0,
  retailPrice: 0,
  supplier: null,
  brand: '',
  minStock: 0,
})

const editForm = ref({
  purchasePrice: '',
  retailPrice: '',
})

const formatDate = (dateString) => {
  if (!dateString) return 'No data'
  try {
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}.${month}.${year}`
  } catch (e) {
    return dateString
  }
}

const formatCurrency = (value) => {
  const num = Number(value)
  if (isNaN(num)) return '0.00₴'
  return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '₴'
}

const getStatusBadge = (status) => {
  const badges = {
    in_stock: { label: 'In Stock', class: 'status-in-stock' },
    low_stock: { label: 'Low Stock', class: 'status-low-stock' },
    out_of_stock: { label: 'Out of Stock', class: 'status-out-of-stock' },
  }
  return badges[status] || { label: status, class: '' }
}

const statusOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: 'in_stock', label: 'In Stock' },
  { value: 'low_stock', label: 'Low Stock' },
  { value: 'out_of_stock', label: 'Out of Stock' },
]

const categoryOptions = computed(() => {
  return [
    { value: 'all', label: 'All Categories' },
    ...warehouseStore.categories.map((cat) => ({ value: cat, label: cat })),
  ]
})

const filteredProducts = computed(() => {
  let result = [...warehouseStore.products]

  // Apply category filter
  if (selectedCategory.value !== 'all') {
    result = result.filter((product) => product.Category === selectedCategory.value)
  }

  // Apply status filter
  if (selectedStatus.value !== 'all') {
    result = result.filter((product) => product.StockStatus === selectedStatus.value)
  }

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter((product) => {
      const nameMatch = product.ProductName.toLowerCase().includes(query)
      const skuMatch = product.SKU.toLowerCase().includes(query)
      const categoryMatch = product.Category.toLowerCase().includes(query)
      const supplierMatch = product.Supplier.toLowerCase().includes(query)
      return nameMatch || skuMatch || categoryMatch || supplierMatch
    })
  }

  return result
})

const loadData = async () => {
  await Promise.all([
    warehouseStore.fetchStats(),
    warehouseStore.fetchCategories(),
    warehouseStore.fetchInventory({
      category: selectedCategory.value,
      status: selectedStatus.value,
    }),
  ])
}

// Note: Filtering is now handled by computed property filteredProducts
// No need to fetch data on filter change

const openCreateModal = async () => {
  resetCreateForm()
  suppliers.value = await deliveriesStore.getSuppliers()
  isCreateModalOpen.value = true
}

const closeCreateModal = () => {
  isCreateModalOpen.value = false
  resetCreateForm()
}

const resetCreateForm = () => {
  createForm.value = {
    name: '',
    sku: '',
    category: '',
    unit: 'kg',
    purchasePrice: 0,
    retailPrice: 0,
    supplier: null,
    brand: '',
    minStock: 0,
  }
  errorMessage.value = ''
}

const submitCreate = async () => {
  if (
    !createForm.value.name ||
    !createForm.value.sku ||
    !createForm.value.category ||
    createForm.value.supplier === null ||
    createForm.value.supplier === ''
  ) {
    errorMessage.value = 'Please fill in all required fields'
    return
  }

  isSaving.value = true
  errorMessage.value = ''

  try {
    await warehouseStore.createProduct(createForm.value)
    await loadData()
    closeCreateModal()
  } catch (error) {
    errorMessage.value = error.response?.data?.error || 'Failed to create product'
  } finally {
    isSaving.value = false
  }
}

const openEditModal = (product) => {
  editingProduct.value = product
  editForm.value = {
    purchasePrice: product.PurchasePrice,
    retailPrice: product.RetailPrice,
  }
  errorMessage.value = ''
  isEditModalOpen.value = true
}

const closeEditModal = () => {
  isEditModalOpen.value = false
  editingProduct.value = null
  resetEditForm()
}

const resetEditForm = () => {
  editForm.value = {
    purchasePrice: '',
    retailPrice: '',
  }
  errorMessage.value = ''
}

const submitEdit = async () => {
  if (!editingProduct.value) return

  isSaving.value = true
  errorMessage.value = ''

  try {
    await warehouseStore.updateProduct(editingProduct.value.SKU, editForm.value)
    await loadData()
    closeEditModal()
  } catch (error) {
    errorMessage.value = error.response?.data?.error || 'Failed to update product'
  } finally {
    isSaving.value = false
  }
}

const deleteProduct = async (product) => {
  if (!confirm(`Are you sure you want to delete "${product.ProductName}"?`)) {
    return
  }
  try {
    await warehouseStore.deleteProduct(product.SKU)
    await loadData()
  } catch (error) {
    alert('Failed to delete product')
  }
}

onMounted(async () => {
  await loadData()
})
</script>

<template>
  <main>
    <PageToolbar>
      <template #left>
        <h1 class="page-title">Warehouse</h1>
      </template>
      <template #center>
        <div class="search-container">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by name, SKU, category or supplier..."
            class="search-input"
          />
        </div>
      </template>
      <template #right>
        <div class="toolbar-actions">
          <button class="primary-btn" @click="openCreateModal">+ Add Product</button>
        </div>
      </template>
    </PageToolbar>

    <!-- Summary Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Total Warehouse Value</div>
        <div class="stat-value stat-blue">
          {{ formatCurrency(warehouseStore.stats.totalValue) }}
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Total Items</div>
        <div class="stat-value stat-blue">{{ warehouseStore.stats.totalPositions }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Low Stock Items</div>
        <div class="stat-value stat-red">{{ warehouseStore.stats.lowStockCount }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Last Replenishment</div>
        <div class="stat-value stat-green">
          {{ formatDate(warehouseStore.stats.lastReplenishment) }}
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters">
      <select v-model="selectedCategory" class="filter-select">
        <option v-for="option in categoryOptions" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
      <select v-model="selectedStatus" class="filter-select">
        <option v-for="option in statusOptions" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
    </div>

    <!-- Data Table -->
    <div class="table-container">
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>Product Name</th>
              <th>SKU</th>
              <th>Category</th>
              <th>Supplier</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Purchase Price</th>
              <th>Sale Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="warehouseStore.loading">
              <td colspan="8" class="text-center">Loading...</td>
            </tr>
            <tr v-else-if="filteredProducts.length === 0">
              <td colspan="9" class="text-center">
                <span v-if="searchQuery">No products match your search.</span>
                <span v-else>No products found</span>
              </td>
            </tr>
            <tr v-else v-for="product in filteredProducts" :key="product.SKU">
              <td class="product-name">{{ product.ProductName }}</td>
              <td>{{ product.SKU }}</td>
              <td>{{ product.Category }}</td>
              <td>{{ product.Supplier }}</td>
              <td>{{ Number(product.StockQuantity).toFixed(2) }} {{ product.Unit }}</td>
              <td>
                <span :class="['badge', getStatusBadge(product.StockStatus).class]">
                  {{ getStatusBadge(product.StockStatus).label }}
                </span>
              </td>
              <td>{{ formatCurrency(product.PurchasePrice) }}</td>
              <td>{{ formatCurrency(product.RetailPrice) }}</td>
              <td class="actions-wrapper">
                <div class="actions">
                  <button class="icon-btn" @click="openEditModal(product)" title="Edit">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M11.333 2.00004C11.5081 1.82494 11.716 1.68605 11.9447 1.59129C12.1735 1.49653 12.4187 1.44775 12.6663 1.44775C12.914 1.44775 13.1592 1.49653 13.3879 1.59129C13.6167 1.68605 13.8246 1.82494 13.9997 2.00004C14.1748 2.17513 14.3137 2.383 14.4084 2.61178C14.5032 2.84055 14.552 3.08575 14.552 3.33337C14.552 3.58099 14.5032 3.82619 14.4084 4.05497C14.3137 4.28374 14.1748 4.49161 13.9997 4.66671L5.33301 13.3334L1.33301 14.6667L2.66634 10.6667L11.333 2.00004Z"
                        stroke="currentColor"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </button>
                  <button
                    class="icon-btn icon-btn-delete"
                    @click="deleteProduct(product)"
                    title="Delete"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M2 4H3.33333H14"
                        stroke="currentColor"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M5.33301 4.00004V2.66671C5.33301 2.31309 5.47348 1.97395 5.72353 1.7239C5.97358 1.47385 6.31272 1.33337 6.66634 1.33337H9.33301C9.68663 1.33337 10.0258 1.47385 10.2758 1.7239C10.5259 1.97395 10.6663 2.31309 10.6663 2.66671V4.00004M12.6663 4.00004V13.3334C12.6663 13.687 12.5259 14.0261 12.2758 14.2762C12.0258 14.5262 11.6866 14.6667 11.333 14.6667H4.66634C4.31272 14.6667 3.97358 14.5262 3.72353 14.2762C3.47348 14.0261 3.33301 13.687 3.33301 13.3334V4.00004H12.6663Z"
                        stroke="currentColor"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </main>

  <!-- Create Product Modal -->
  <transition name="fade">
    <div v-if="isCreateModalOpen" class="modal-overlay" @click.self="closeCreateModal">
      <form class="modal-card" @submit.prevent="submitCreate">
        <header class="modal-header">
          <div>
            <h2>Add New Product</h2>
          </div>
          <button type="button" class="ghost-btn" @click="closeCreateModal">✕</button>
        </header>

        <div class="modal-body">
          <div class="form-grid">
            <label class="field">
              <span>Product Name <span class="required">*</span></span>
              <input v-model="createForm.name" type="text" placeholder="Enter name" required />
            </label>
            <label class="field">
              <span>SKU <span class="required">*</span></span>
              <input v-model="createForm.sku" type="text" placeholder="Enter SKU" required />
            </label>
          </div>

          <div class="form-grid">
            <label class="field">
              <span>Category <span class="required">*</span></span>
              <select name="" id="" v-model="createForm.category" required>
                <option value="" disabled selected>Select category</option>
                <option
                  v-for="category in warehouseStore.categories"
                  :key="category"
                  :value="category"
                >
                  {{ category }}
                </option>
              </select>
            </label>
            <label class="field">
              <span>Brand</span>
              <input v-model="createForm.brand" type="text" placeholder="Enter brand" />
            </label>
          </div>
          <div class="form-grid">
            <label class="field">
              <span>Min Stock</span>
              <input v-model="createForm.minStock" type="number" placeholder="Enter min stock" />
            </label>
            <label class="field">
              <span>Unit <span class="required">*</span></span>
              <select v-model="createForm.unit" required>
                <option value="kg">kg</option>
                <option value="g">g</option>
                <option value="l">l</option>
                <option value="ml">ml</option>
                <option value="pcs">pcs</option>
              </select>
            </label>
          </div>

          <div class="form-grid">
            <label class="field">
              <span>Purchase Price</span>
              <input
                v-model.number="createForm.purchasePrice"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
              />
            </label>
            <label class="field">
              <span>Retail Price</span>
              <input
                v-model.number="createForm.retailPrice"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
              />
            </label>
          </div>

          <label class="field">
            <span>Supplier <span class="required">*</span></span>
            <select v-model="createForm.supplier" required>
              <option value="" disabled>Select supplier</option>
              <option
                v-for="supplier in suppliers"
                :key="supplier.SupplierID"
                :value="supplier.SupplierID"
              >
                {{ supplier.Name }}
              </option>
            </select>
          </label>
        </div>

        <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>

        <footer class="modal-footer">
          <button type="button" class="secondary-btn" @click="closeCreateModal">Cancel</button>
          <button type="submit" class="primary-btn" :disabled="isSaving">
            {{ isSaving ? 'Saving...' : 'Add Product' }}
          </button>
        </footer>
      </form>
    </div>
  </transition>

  <!-- Edit Product Modal -->
  <transition name="fade">
    <div v-if="isEditModalOpen" class="modal-overlay" @click.self="closeEditModal">
      <form class="modal-card" @submit.prevent="submitEdit">
        <header class="modal-header">
          <div>
            <p class="modal-subtitle">{{ editingProduct?.ProductName }}</p>
            <h2>Edit Product</h2>
          </div>
          <button type="button" class="ghost-btn" @click="closeEditModal">✕</button>
        </header>

        <div class="modal-body">
          <div class="form-grid">
            <label class="field">
              <span>Purchase Price</span>
              <input
                v-model.number="editForm.purchasePrice"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
              />
            </label>
            <label class="field">
              <span>Retail Price</span>
              <input
                v-model.number="editForm.retailPrice"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
              />
            </label>
          </div>
        </div>

        <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>

        <footer class="modal-footer">
          <button type="button" class="secondary-btn" @click="closeEditModal">Cancel</button>
          <button type="submit" class="primary-btn" :disabled="isSaving">
            {{ isSaving ? 'Saving...' : 'Save Changes' }}
          </button>
        </footer>
      </form>
    </div>
  </transition>
</template>

<style scoped>
main {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  background: #f9fafb;
  height: 100vh;
  box-sizing: border-box;
  overflow: hidden;
  width: 100%;
  flex: 1;
  min-width: 0;
}

.page-title {
  font-family: Montserrat, sans-serif;
  font-size: 24px;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  flex-shrink: 0;
}

.stat-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-label {
  font-family: Montserrat, sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
}

.stat-value {
  font-family: Montserrat, sans-serif;
  font-size: 32px;
  font-weight: 700;
  line-height: 1.2;
}

.stat-blue {
  color: #2563eb;
}

.stat-red {
  color: #ef476f;
}

.stat-green {
  color: #10b981;
}

/* Filters */
.filters {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-shrink: 0;
}

.search-container {
  flex: 1;
  display: flex;
  justify-content: center;
  max-width: 400px;
}

.search-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-family: Montserrat, sans-serif;
  font-size: 14px;
  background: #fff;
  outline: none;
  transition: all 0.2s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.search-input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
}

.search-input::placeholder {
  color: #9ca3af;
}

.filter-select {
  font-family: Montserrat, sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #111827;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 10px 14px;
  cursor: pointer;
  outline: none;
  transition: border-color 0.2s ease;
}

.filter-select:hover {
  border-color: #2563eb;
}

.filter-select:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
}

/* Table */
.table-container {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  width: 100%;
}

/* Table Wrapper */
.table-wrapper {
  flex: 1;
  overflow-y: auto;
  width: 100%;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.table-wrapper::-webkit-scrollbar {
  display: none;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-family: Montserrat, sans-serif;
}

.data-table thead {
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 0;
  z-index: 10;
}

.data-table th {
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
  text-align: left;
  padding: 14px 16px;
  white-space: nowrap;
  background: #f9fafb;
}

.data-table td {
  font-size: 14px;
  font-weight: 500;
  color: #111827;
  padding: 14px 16px;
  border-bottom: 1px solid #e5e7eb;
  min-height: 58px;
}

.data-table tbody tr:last-child td {
  border-bottom: none;
}

.data-table tbody tr:hover {
  background: #f9fafb;
}

.product-name {
  font-weight: 600;
}

.text-center {
  text-align: center;
  color: #6b7280;
  padding: 32px;
}

/* Badge */
.badge {
  display: inline-block;
  font-size: 13px;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 6px;
  white-space: nowrap;
}

.status-in-stock {
  background: #10b981;
  color: #ffffff;
}

.status-low-stock {
  background: #f59e0b;
  color: #ffffff;
}

.status-out-of-stock {
  background: #ef4444;
  color: #ffffff;
}

/* Actions */
.actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.icon-btn {
  background: transparent;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.icon-btn:hover {
  background: #f3f4f6;
  color: #2563eb;
}

.icon-btn-delete:hover {
  background: #fee2e2;
  color: #ef4444;
}

/* Modals */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(17, 24, 39, 0.45);
  display: grid;
  place-items: center;
  padding: 20px;
  z-index: 50;
}

.modal-card {
  background: #ffffff;
  width: min(700px, 95vw);
  max-height: 90vh;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
  padding: 18px 20px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  font-family: Montserrat, sans-serif;
  font-size: 20px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.modal-subtitle {
  font-family: Montserrat, sans-serif;
  margin: 0 0 4px;
  font-size: 13px;
  color: #6b7280;
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 20px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}

/* Form */
.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-family: Montserrat, sans-serif;
  font-size: 14px;
  color: #111827;
}

.field .required {
  color: #ef4444;
}

.field input,
.field select {
  font-family: Montserrat, sans-serif;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 14px;
  color: #111827;
  background: #ffffff;
  outline: none;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.field input:focus,
.field select:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
}

.field input::placeholder {
  color: #9ca3af;
}

.error-text {
  font-family: Montserrat, sans-serif;
  color: #ef4444;
  font-size: 14px;
  margin: 0 20px 8px;
}

.muted {
  font-family: Montserrat, sans-serif;
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.toolbar-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

@media (max-width: 900px) {
  .filters {
    flex-direction: column;
    align-items: stretch;
  }
  .search-container {
    max-width: 100%;
  }
}

@media (max-width: 768px) {
  .search-container {
    max-width: 200px;
  }
}
</style>
