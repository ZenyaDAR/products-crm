<script setup>
import { useRouter } from 'vue-router'
import IconEdit from './icons/IconEdit.vue'
const router = useRouter()

const props = defineProps({
  deliveries: {
    type: Array,
    required: true,
  },
  activeDelivery: {
    type: Object,
    default: null,
  },
  formatDate: {
    type: Function,
    required: true,
  },
  editDelivery: {
    type: Function,
    required: true,
  },
})

const emit = defineEmits(['update:activeDelivery'])
function changeActiveDelivery(delivery) {
  emit('update:activeDelivery', delivery)
  router.push(`/delivery/${delivery.DeliveryID}`)
}
</script>

<template>
  <div class="order-card">
    <div class="row head">
      <div>№</div>
      <div>Supplier</div>
      <div>Date</div>
      <div>Amount</div>
      <div>Status</div>
    </div>
    <div class="rows">
      <div
        class="row"
        v-for="delivery in props.deliveries"
        :key="delivery.DeliveryID"
        :class="{
          active: props.activeDelivery && delivery.DeliveryID === props.activeDelivery.DeliveryID,
        }"
        @click="changeActiveDelivery(delivery)"
      >
        <div>#{{ delivery.DeliveryID }}</div>
        <div>№{{ delivery.SupplierID }}</div>
        <div>{{ props.formatDate(delivery.Date) }}</div>
        <div>{{ Number(delivery.TotalAmount).toFixed(2) }}₴</div>
        <div :class="['status', `status-${delivery.Status}`]">
          {{ delivery.Status }}
        </div>
        <div>
          <IconEdit class="edit-icon" @click.stop="editDelivery(delivery)" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.order-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 5px;
  width: 100%;
  display: grid;
  gap: 15px;
}

.row {
  display: grid;
  grid-template-columns: auto repeat(4, 1fr) 10px;
  align-items: center;
  text-align: center;
  font-family: Montserrat;
  font-size: 16px;
  font-weight: 500;
  color: #000;
}

.head {
  padding-left: 35px;
  padding-right: 35px;
  padding-top: 20px;
}
.head > * {
  font-weight: 600 !important;
}

.rows {
  overflow-y: auto;
  overflow-x: visible;
  display: grid;
  gap: 15px;
  padding: 10px 15px 15px;
  scrollbar-width: none;
}
.rows::-webkit-scrollbar {
  display: none;
}

.row:not(.head) {
  padding: 24px 20px;
  border: 3px solid transparent;
  outline: 1px solid #e5e7eb;
  border-radius: 10px;
  box-shadow: 0 2px 16px 3px rgba(0, 0, 0, 0.06);
  background: #fff;
  cursor: pointer;
}

.row div:first-child {
  text-align: left;
  min-width: 70px;
}

.row > * {
  font-family: Montserrat;
  font-size: 16px;
  line-height: 1.1;
  font-weight: 500;
  color: #000;
}
.row.active {
  border: 3px solid #2563eb;
  outline: 1px solid transparent;
}
.status {
  font-family: Montserrat;
  font-weight: 500;
  font-size: 15px;
  line-height: 1;
  padding: 4px 5px;
  border-radius: 4px;
  width: fit-content;
  margin: 0 auto;
  text-transform: capitalize;
  min-width: 100px;
}
.status-completed {
  background: #06d6a0;
  color: #ffffff;
  border: 1px solid #10b981;
}
.status-pending {
  background: #f59e0b;
  color: #ffffff;
  border: 1px solid #f59e0b;
}
.status-canceled {
  background: #ef4444;
  color: #ffffff;
  border: 1px solid #ef4444;
}
.status-draft {
  background: #6b7280;
  color: #ffffff;
  border: 1px solid #6b7280;
}
.icon-edit {
  width: 20px;
  height: 20px;
}
.edit-icon:hover {
  cursor: pointer;
  opacity: 0.8;
}
</style>
