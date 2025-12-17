<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import { useDeliveriesStore } from '@/stores/deliveries'
import DeliveriesTable from '@/components/DeliveriesTable.vue'
import DeliveriesActivity from '@/components/DeliveriesActivity.vue'
import PageToolbar from '@/components/PageToolbar.vue'
import DeliveriesProducts from '@/components/DeliveriesProducts.vue'

const route = useRoute()
const activeDeliveryId = route.params.id

const deliveriesStore = useDeliveriesStore()
const { deliveries } = storeToRefs(deliveriesStore)

const activeDelivery = ref(null)
const fullDelivery = ref(null)

const isEditModalOpen = ref(false)
const editingDeliveryId = ref(null)
const availableProducts = ref([])
const isSavingEdit = ref(false)
const editError = ref('')
const statusOptions = ['draft', 'pending', 'completed', 'canceled']
const editForm = ref({
  status: 'draft',
  items: [],
})

const isCreateModalOpen = ref(false)
const isSavingCreate = ref(false)
const createError = ref('')
const suppliers = ref([])
const supplierProducts = ref([])
const createForm = ref({
  supplierId: '',
  date: new Date().toISOString().split('T')[0],
  items: [],
})

const editable = computed(() => editForm.value.status !== 'completed')
const isCompleted = computed(() => editForm.value.status === 'completed')

const resetEditForm = () => {
  editForm.value = {
    status: fullDelivery.value?.Status || 'draft',
    items: [],
  }
  editError.value = ''
}

const resetCreateForm = () => {
  createForm.value = {
    supplierId: '',
    date: new Date().toISOString().split('T')[0],
    items: [],
  }
  supplierProducts.value = []
  createError.value = ''
}

const loadDeliveryDetails = async (id) => {
  if (!id) return

  const response = await deliveriesStore.getDelivery(id)

  if (response && response.items) {
    fullDelivery.value = response
  }
}

onMounted(async () => {
  await deliveriesStore.fetchDeliveries()
  suppliers.value = await deliveriesStore.getSuppliers()

  if (activeDeliveryId) {
    activeDelivery.value = deliveries.value.find((d) => d.DeliveryID === Number(activeDeliveryId))
  }

  if (!activeDelivery.value && deliveries.value.length > 0) {
    activeDelivery.value = deliveries.value[0]
  }

  if (activeDelivery.value) {
    await loadDeliveryDetails(activeDelivery.value.DeliveryID)
  }
})

watch(activeDelivery, async (newVal) => {
  if (newVal) {
    await loadDeliveryDetails(newVal.DeliveryID)
  }
})

watch(
  () => editForm.value.status,
  (status) => {
    if (status === 'completed') {
      editForm.value.items = []
    }
  },
)

const formatDate = (v) => {
  if (!v) return ''
  try {
    const [y, m, d] = v.split('T')[0].split('-')
    return `${d}.${m}.${y}`
  } catch (e) {
    return v
  }
}
const formatTime = (v) => {
  if (!v) return ''
  const d = new Date(v)
  return d.toLocaleTimeString('uk-UA', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

const addItemRow = () => {
  if (!availableProducts.value.length) return
  editForm.value.items.push({
    SKU: '',
    Quantity: 1,
    PurchasePrice: '',
    ProductName: '',
    Unit: '',
    existing: false,
  })
}

const removeItemRow = (index) => {
  editForm.value.items.splice(index, 1)
}

const addCreateItemRow = () => {
  if (!supplierProducts.value.length) return
  createForm.value.items.push({
    SKU: '',
    Quantity: 1,
    ProductName: '',
    Unit: '',
    PurchasePrice: '',
  })
}

const removeCreateItemRow = (idx) => {
  createForm.value.items.splice(idx, 1)
}

const onProductSelect = (item) => {
  const product = availableProducts.value.find((p) => p.SKU === item.SKU)
  if (product) {
    item.PurchasePrice = Number(product.PurchasePrice)
    item.ProductName = product.Name
    item.Unit = product.Unit
  }
}

const onCreateProductSelect = (item) => {
  const product = supplierProducts.value.find((p) => p.SKU === item.SKU)
  if (product) {
    item.PurchasePrice = Number(product.PurchasePrice)
    item.ProductName = product.Name
    item.Unit = product.Unit
  }
}

const editDelivery = async (delivery) => {
  if (!delivery) return
  editError.value = ''
  editingDeliveryId.value = delivery.DeliveryID
  activeDelivery.value = delivery
  await loadDeliveryDetails(delivery.DeliveryID)
  editForm.value.status = fullDelivery.value?.Status || delivery.Status
  editForm.value.items = (fullDelivery.value?.items || []).map((item) => ({
    DeliveryItemID: item.DeliveryItemID,
    SKU: item.SKU,
    Quantity: Number(item.Quantity),
    PurchasePrice: Number(item.PurchasePrice),
    ProductName: item.ProductName,
    Unit: item.Unit,
    existing: true,
  }))

  try {
    availableProducts.value = await deliveriesStore.getAvailableProducts(delivery.DeliveryID)
  } catch (e) {
    availableProducts.value = []
    editError.value = 'Не вдалося отримати список товарів постачальника'
  }
  isEditModalOpen.value = true
}

const closeEditModal = () => {
  isEditModalOpen.value = false
  resetEditForm()
}

const openCreateModal = () => {
  resetCreateForm()
  isCreateModalOpen.value = true
}

const closeCreateModal = () => {
  isCreateModalOpen.value = false
  resetCreateForm()
}

const submitEdit = async () => {
  if (!editingDeliveryId.value) return
  isSavingEdit.value = true
  editError.value = ''

  try {
    const payload = {
      status: editForm.value.status,
      items: editable.value
        ? editForm.value.items
            .filter((item) => item.SKU && Number(item.Quantity) > 0)
            .map((item) => ({
              DeliveryItemID: item.DeliveryItemID,
              SKU: item.SKU,
              Quantity: Number(item.Quantity),
              PurchasePrice: item.PurchasePrice !== '' ? Number(item.PurchasePrice) : null,
              BatchNumber: item.BatchNumber || null,
              ManufactureDate: item.ManufactureDate || null,
              ExpiryDate: item.ExpiryDate || null,
            }))
        : [],
    }

    const updated = await deliveriesStore.updateDelivery(editingDeliveryId.value, payload)
    if (updated) {
      fullDelivery.value = updated
      await deliveriesStore.fetchDeliveries()
      activeDelivery.value =
        deliveries.value.find((d) => d.DeliveryID === updated.DeliveryID) || updated
      isEditModalOpen.value = false
      resetEditForm()
    }
  } catch (e) {
    editError.value = e?.response?.data?.error || 'Не вдалося оновити поставку'
  } finally {
    isSavingEdit.value = false
  }
}

const onSupplierChange = async () => {
  if (!createForm.value.supplierId) {
    supplierProducts.value = []
    createForm.value.items = []
    return
  }
  supplierProducts.value = await deliveriesStore.getSupplierProducts(createForm.value.supplierId)
  createForm.value.items = []
}

const submitCreate = async () => {
  if (!createForm.value.supplierId) {
    createError.value = 'Оберіть постачальника'
    return
  }
  if (!createForm.value.items.length) {
    createError.value = 'Додайте хоча б один товар'
    return
  }

  isSavingCreate.value = true
  createError.value = ''

  try {
    const payload = {
      supplierId: createForm.value.supplierId,
      date: createForm.value.date,
      items: createForm.value.items
        .filter((item) => item.SKU && Number(item.Quantity) > 0)
        .map((item) => ({
          SKU: item.SKU,
          Quantity: Number(item.Quantity),
        })),
    }

    const created = await deliveriesStore.createDelivery(payload)
    if (created) {
      await deliveriesStore.fetchDeliveries()
      activeDelivery.value =
        deliveries.value.find((d) => d.DeliveryID === created.DeliveryID) || created
      await loadDeliveryDetails(activeDelivery.value.DeliveryID)
      closeCreateModal()
    }
  } catch (e) {
    createError.value = e?.response?.data?.error || 'Не вдалося створити поставку'
  } finally {
    isSavingCreate.value = false
  }
}
</script>

<template>
  <main>
    <PageToolbar>
      <template #left>
        <button class="primary-btn" @click="openCreateModal">+ Додати нову поставку</button>
      </template>
    </PageToolbar>
    <DeliveriesTable
      :deliveries="deliveries"
      :formatDate="formatDate"
      :activeDelivery="activeDelivery"
      @update:activeDelivery="activeDelivery = $event"
      :editDelivery="editDelivery"
    />
    <DeliveriesActivity
      :delivery="fullDelivery"
      :formatDate="formatDate"
      :formatTime="formatTime"
    />
    <DeliveriesProducts :items="fullDelivery?.items" />
  </main>

  <transition name="fade">
    <div v-if="isEditModalOpen" class="modal-overlay" @click.self="closeEditModal">
      <form class="modal-card" @submit.prevent="submitEdit">
        <header class="modal-header">
          <div>
            <p class="modal-subtitle">
              Поставка #{{ fullDelivery?.DeliveryID || editingDeliveryId }}
            </p>
            <h2>Редагування поставки</h2>
          </div>
          <button type="button" class="ghost-btn" @click="closeEditModal">✕</button>
        </header>

        <div class="modal-body">
          <div class="form-grid">
            <label class="field">
              <span>Статус</span>
              <select v-model="editForm.status" :disabled="isCompleted">
                <option v-for="option in statusOptions" :key="option" :value="option">
                  {{ option }}
                </option>
              </select>
            </label>
            <label class="field">
              <span>Постачальник</span>
              <input
                type="text"
                :value="fullDelivery?.SupplierName || fullDelivery?.SupplierID || ''"
                disabled
              />
            </label>
          </div>

          <section class="items-section">
            <div class="section-head">
              <div class="section-title">
                <h3>Товари в поставці</h3>
                <p class="muted">Редагуйте кількість або видаляйте позиції</p>
              </div>
              <button
                v-if="editable && availableProducts.length"
                type="button"
                class="secondary-btn"
                @click="addItemRow"
              >
                + Додати товар
              </button>
            </div>

            <p v-if="isCompleted" class="info-banner">
              Поставка завершена — редагування недоступне.
            </p>

            <div v-if="editForm.items.length" class="items-rows">
              <div
                v-for="(item, idx) in editForm.items"
                :key="item.DeliveryItemID || idx"
                class="item-row"
              >
                <template v-if="item.existing">
                  <div class="item-static">
                    <div class="item-title">{{ item.ProductName }} ({{ item.SKU }})</div>
                    <div class="item-sub">{{ item.PurchasePrice }}₴ / {{ item.Unit }}</div>
                  </div>
                  <label class="field compact">
                    <span>Кількість</span>
                    <input
                      v-model.number="item.Quantity"
                      type="number"
                      min="0"
                      step="1"
                      placeholder="Кількість"
                      required
                      :disabled="isCompleted"
                    />
                  </label>
                  <button
                    type="button"
                    class="ghost-btn"
                    @click="removeItemRow(idx)"
                    :disabled="isCompleted"
                  >
                    Видалити
                  </button>
                </template>

                <template v-else>
                  <label class="field compact">
                    <span>Продукт</span>
                    <select
                      v-model="item.SKU"
                      required
                      @change="onProductSelect(item)"
                      :disabled="isCompleted"
                    >
                      <option value="" disabled>Оберіть продукт</option>
                      <option
                        v-for="product in availableProducts"
                        :key="product.SKU"
                        :value="product.SKU"
                      >
                        {{ product.Name }} ({{ product.SKU }})
                      </option>
                    </select>
                  </label>
                  <div class="item-static">
                    <div class="item-title">
                      {{
                        item.ProductName ? `${item.ProductName} (${item.SKU})` : 'Оберіть продукт'
                      }}
                    </div>
                    <div class="item-sub" v-if="item.PurchasePrice">
                      Ціна закупу: {{ item.PurchasePrice }}₴
                      <span v-if="item.Unit"> / {{ item.Unit }}</span>
                    </div>
                  </div>
                  <label class="field compact">
                    <span>Кількість</span>
                    <input
                      v-model.number="item.Quantity"
                      type="number"
                      min="0"
                      step="1"
                      placeholder="Кількість"
                      required
                      :disabled="isCompleted"
                    />
                  </label>
                  <button
                    type="button"
                    class="ghost-btn"
                    @click="removeItemRow(idx)"
                    :disabled="isCompleted"
                  >
                    Видалити
                  </button>
                </template>
              </div>
            </div>
            <p v-else class="muted">Додайте товари з цього постачальника.</p>
            <p v-if="!availableProducts.length" class="muted">
              Немає доступних активних товарів від цього постачальника.
            </p>
          </section>
        </div>

        <p v-if="editError" class="error-text">{{ editError }}</p>

        <footer class="modal-footer">
          <button type="button" class="secondary-btn" @click="closeEditModal">Скасувати</button>
          <button type="submit" class="primary-btn" :disabled="isSavingEdit">
            {{ isSavingEdit ? 'Збереження...' : 'Зберегти зміни' }}
          </button>
        </footer>
      </form>
    </div>
  </transition>

  <transition name="fade">
    <div v-if="isCreateModalOpen" class="modal-overlay" @click.self="closeCreateModal">
      <form class="modal-card" @submit.prevent="submitCreate">
        <header class="modal-header">
          <div>
            <p class="modal-subtitle">Нова поставка</p>
            <h2>Створення поставки</h2>
          </div>
          <button type="button" class="ghost-btn" @click="closeCreateModal">✕</button>
        </header>

        <div class="modal-body">
          <div class="form-grid">
            <label class="field">
              <span>Постачальник</span>
              <select v-model="createForm.supplierId" @change="onSupplierChange">
                <option value="" disabled>Оберіть постачальника</option>
                <option v-for="s in suppliers" :key="s.SupplierID" :value="s.SupplierID">
                  {{ s.Name }}
                </option>
              </select>
            </label>
            <label class="field">
              <span>Дата</span>
              <input type="date" v-model="createForm.date" disabled />
            </label>
          </div>

          <section class="items-section">
            <div class="section-head">
              <div class="section-title">
                <h3>Товари</h3>
                <p class="muted">Додайте товари постачальника</p>
              </div>
              <button
                v-if="supplierProducts.length"
                type="button"
                class="secondary-btn"
                @click="addCreateItemRow"
              >
                + Додати товар
              </button>
            </div>
            <div v-if="createForm.items.length" class="items-rows">
              <div v-for="(item, idx) in createForm.items" :key="idx" class="item-row">
                <label class="field compact">
                  <span>Продукт</span>
                  <select v-model="item.SKU" required @change="onCreateProductSelect(item)">
                    <option value="" disabled>Оберіть продукт</option>
                    <option
                      v-for="product in supplierProducts"
                      :key="product.SKU"
                      :value="product.SKU"
                    >
                      {{ product.Name }} ({{ product.SKU }})
                    </option>
                  </select>
                </label>
                <div class="item-static">
                  <div class="item-title">
                    {{ item.ProductName ? `${item.ProductName} (${item.SKU})` : 'Оберіть продукт' }}
                  </div>
                  <div class="item-sub" v-if="item.PurchasePrice">
                    Ціна закупу: {{ item.PurchasePrice }}₴
                    <span v-if="item.Unit">/ {{ item.Unit }}</span>
                  </div>
                </div>
                <label class="field compact">
                  <span>Кількість</span>
                  <input
                    v-model.number="item.Quantity"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="Кількість"
                    required
                  />
                </label>
                <button type="button" class="ghost-btn" @click="removeCreateItemRow(idx)">
                  Видалити
                </button>
              </div>
            </div>
            <p v-else class="muted">Оберіть постачальника, щоб додати товари.</p>
            <p v-if="!supplierProducts.length && createForm.supplierId" class="muted">
              Немає активних товарів для цього постачальника.
            </p>
          </section>
        </div>

        <p v-if="createError" class="error-text">{{ createError }}</p>

        <footer class="modal-footer">
          <button type="button" class="secondary-btn" @click="closeCreateModal">Скасувати</button>
          <button type="submit" class="primary-btn" :disabled="isSavingCreate">
            {{ isSavingCreate ? 'Створення...' : 'Створити поставку' }}
          </button>
        </footer>
      </form>
    </div>
  </transition>
</template>

<style scoped>
main {
  display: grid;
  grid-template-columns: 2.17fr 1fr;
  grid-template-rows: min-content 400px auto;
  gap: 20px;
  width: 100%;
  height: 100%;
  padding: 20px;
  height: 100vh;
}

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
  width: min(1100px, 95vw);
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
  font-size: 20px;
  font-weight: 600;
  color: #111827;
  margin: 2px 0 0;
}
.modal-subtitle {
  margin: 0;
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
  font-size: 14px;
  color: #111827;
}
.field input,
.field select {
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
.items-section {
  margin-top: 12px;
  padding: 14px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #f9fafb;
}
.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 12px;
}
.section-title h3 {
  margin: 0;
}
.section-title .muted {
  margin: 2px 0 0;
}
.section-head h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}
.items-rows {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.item-row {
  display: grid;
  grid-template-columns: repeat(6, minmax(120px, 1fr)) auto;
  gap: 8px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 10px;
}
.item-static {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.item-title {
  font-weight: 600;
  color: #111827;
}
.item-sub {
  font-size: 13px;
  color: #6b7280;
}
.info-banner {
  margin: 0 0 10px;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #f59e0b;
  background: #fff7ed;
  color: #92400e;
  font-size: 14px;
  font-weight: 600;
}
.item-row select,
.item-row input {
  width: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 8px 10px;
  font-size: 13px;
  color: #111827;
  outline: none;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}
.item-row select:focus,
.item-row input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.12);
}
.primary-btn,
.secondary-btn,
.ghost-btn {
  font-family: Montserrat;
  border: 1px solid transparent;
  border-radius: 8px;
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
}
.ghost-btn:hover {
  color: #ef4444;
}
.muted {
  font-size: 13px;
  color: #6b7280;
  margin: 6px 0 0;
}
.error-text {
  color: #ef4444;
  font-size: 14px;
  margin: 0 20px 8px;
}
</style>
