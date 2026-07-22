<template>
  <q-item clickable v-ripple class="notification-item" @click="$emit('click', notification)">
    <q-item-section avatar>
      <q-avatar :color="iconColor" text-color="white" size="42px">
        <q-icon :name="icon" size="22px" />
      </q-avatar>
    </q-item-section>

    <q-item-section>
      <q-item-label class="text-weight-medium">
        {{ notification.title }}
      </q-item-label>

      <q-item-label caption lines="2" class="text-grey-8 q-mt-xs">
        {{ notification.message }}
      </q-item-label>

      <div class="row items-center justify-between q-mt-sm">
        <span class="text-caption text-grey-6">
          {{ formattedDate }}
        </span>

        <q-badge v-if="!notification.read" rounded color="primary" />
      </div>
    </q-item-section>
  </q-item>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  notification: {
    type: Object,
    required: true,
  },
})

defineEmits(['click'])

const EVENT_ICONS = {
  REQUEST_CREATED: 'description',

  REQUEST_BUDGET: 'attach_money',
  REQUEST_BUDGETED: 'price_check',

  REQUEST_REVISION: 'fact_check',
  REQUEST_REVIEWED: 'rule',

  REQUEST_ANALYSIS: 'analytics',

  REQUEST_APPROVED: 'check_circle',
  REQUEST_REJECTED: 'cancel',
  REQUEST_WAITING: 'schedule',

  REQUEST_PAYMENT: 'payments',
  REQUEST_REALIZED: 'paid',

  REQUEST_TRACKING: 'local_shipping',
  REQUEST_DELIVERED: 'inventory_2',

  REQUEST_FINISHED: 'task_alt',

  REQUEST_REANALYSIS: 'refresh',

  REQUEST_REINFORCEMENT: 'priority_high',
}

const PRIORITY_COLORS = {
  normal: 'primary',

  high: 'orange',

  urgent: 'negative',
}

const icon = computed(() => {
  return EVENT_ICONS[props.notification.type] || 'notifications'
})

const iconColor = computed(() => {
  return PRIORITY_COLORS[props.notification.priority] || 'primary'
})

const formattedDate = computed(() => {
  const value = props.notification.createdAt

  if (!value) return '-'

  const date = typeof value?.toDate === 'function' ? value.toDate() : new Date(value)

  if (isNaN(date.getTime())) {
    return '-'
  }

  const now = new Date()

  const diff = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diff < 60) {
    return 'Agora'
  }

  if (diff < 3600) {
    return `Há ${Math.floor(diff / 60)} min`
  }

  if (diff < 86400) {
    return `Há ${Math.floor(diff / 3600)} h`
  }

  return date.toLocaleString('pt-BR')
})
</script>

<style scoped>
.notification-item {
  min-width: 340px;
  max-width: 420px;
  padding: 14px 12px;
  transition: background 0.2s;
}

.notification-item:hover {
  background: rgba(0, 0, 0, 0.04);
}
</style>
