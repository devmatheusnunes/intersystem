<template>
  <q-btn flat round dense icon="notifications" class="notification-bell">
    <q-badge v-if="unreadCount > 0" floating rounded color="negative" :label="badgeLabel" />

    <q-menu anchor="bottom right" self="top right" fit @before-show="refresh">
      <NotificationCenter ref="center" @update:count="updateCount" />
    </q-menu>
  </q-btn>
</template>

<script setup>
import { ref, computed } from 'vue'

import NotificationCenter from './NotificationCenter.vue'

const center = ref(null)

const unreadCount = ref(0)

const badgeLabel = computed(() => {
  if (unreadCount.value > 99) {
    return '99+'
  }

  return unreadCount.value
})

const updateCount = (count) => {
  unreadCount.value = count
}

const refresh = () => {
  center.value?.loadNotifications?.()
}
</script>

<style scoped>
.notification-bell {
  position: relative;
}
</style>
