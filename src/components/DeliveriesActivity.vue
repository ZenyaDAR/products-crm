<script setup>
const { delivery, formatDate, formatTime } = defineProps({
  delivery: {
    type: Object,
    required: true,
  },
  formatDate: {
    type: Function,
    required: true,
  },
  formatTime: {
    type: Function,
    required: true,
  },
})
</script>

<template>
  <div v-if="delivery" class="deliveries-activity">
    <div class="head-info">
      <div>
        <h1>Поставка #{{ delivery.DeliveryID }}</h1>
        <span>{{ delivery.SupplierName }}</span>
      </div>
      <span class="status" :class="'status-' + delivery.Status">
        {{ delivery.Status }}
      </span>
    </div>

    <div class="activity-timeline">
      <h2>Стрічка активності</h2>
     
      <div class="activity-timeline-item completed" v-for="status in delivery?.history">
        <span class="activity-timeline-item-status">{{  status.Status }}</span>
        <div>
          <span class="activity-timeline-item-date"
            >{{ formatDate(status.ChangeDate) }} • {{ formatTime(status.ChangeDate) }}
          </span>
          <span class="activity-timeline-item-changed-by">
            •
            {{ status.ChangedBy.split(' ')[0] + ' ' + status.ChangedBy.split(' ')[1] }}
            ({{ status.EmployeeID }})
          </span>
        </div>
      </div>
      <div class="activity-timeline-item completed">
        <span class="activity-timeline-item-status">Created</span>
        <div>
          <span class="activity-timeline-item-date"
            >{{ formatDate(delivery.Date) }} • {{ formatTime(delivery.Date) }}
          </span>
          <span class="activity-timeline-item-changed-by">
            •
            {{ delivery.EmployeeName.split(' ')[0] + ' ' + delivery.EmployeeName.split(' ')[1] }}
            ({{ delivery.EmployeeID }})
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.deliveries-activity {
  width: 100%;
  height: 100%;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 5px;
  padding: 20px;
  overflow: auto;
  scrollbar-width: none;
}
.deliveries-activity::-webkit-scrollbar {
  display: none;
}
.head-info {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 10px;
  padding-bottom: 15px;
  margin-bottom: 15px;
  border-bottom: 1px solid hwb(220 42% 50% / 0.3);
}
.head-info h1 {
  font-size: 22px;
  font-weight: 500;
  color: #111827;
}
.head-info span:not(.status) {
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
  line-height: 1;
}
.status {
  font-size: 15px;
  font-weight: 500;
  padding: 4px 5px;
  border-radius: 4px;
  width: fit-content;
  text-transform: capitalize;
  line-height: 1;
}
.status-completed {
  background: #06d6a0;
  color: #ffffff;
}
.status-pending {
  background: #f59e0b;
  color: #ffffff;
}
.status-canceled {
  background: #ef4444;
  color: #ffffff;
}
.status-draft {
  background: #6b7280;
  color: #ffffff;
}
.activity-timeline {
  display: flex;
  flex-direction: column;
}
.activity-timeline h2{
  font-size: 15px;
  font-weight: 500;
  color: #111827;
  margin-bottom: 8px;
}
.activity-timeline-item {
  position: relative;
  display: flex;
  flex-direction: column;
  padding-left: 18px;
  margin-bottom: 15px;
}
.activity-timeline-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #06d6a0;
  transform: translateY(-50%);
}
.activity-timeline-item-status {
  font-size: 12px;
  font-weight: 500;
  color: 111827;
  text-transform: capitalize;
}
.activity-timeline-item-status + div {
  font-size: 11px;
  font-weight: 500;
  color: #6b7280;
} 
</style>
