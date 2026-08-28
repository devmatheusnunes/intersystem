<template>
  <q-btn flat round dense icon="notifications" class="notification-bell">
    <q-badge v-if="unreadCount > 0" floating rounded color="negative" :label="badgeLabel" />

    <q-menu anchor="bottom right" self="top right" fit @before-show="refresh">
      <NotificationCenter ref="center" @update:count="updateCount" />
    </q-menu>
  </q-btn>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

import NotificationCenter from './NotificationCenter.vue'

import UseNotifications from 'src/composables/UseNotifications'
import useAuthUser from 'src/composables/UseAuthUser'

const center = ref(null)
const unreadCount = ref(0)

const notificationsApi = UseNotifications()
const { profile } = useAuthUser()

const userId = computed(() => profile.value?.id || profile.value?.userId || profile.value?.uid)

const badgeLabel = computed(() => {
  if (unreadCount.value > 99) {
    return '99+'
  }

  return unreadCount.value
})

const updateCount = (count) => {
  unreadCount.value = count
}

const refresh = async () => {
  await center.value?.loadNotifications?.()
}

let stopWatching = null

const startWatching = () => {
  if (stopWatching) {
    stopWatching()
    stopWatching = null
  }

  if (!userId.value) {
    unreadCount.value = 0
    return
  }

  stopWatching = notificationsApi.watchUnread(userId.value, (count) => {
    unreadCount.value = count
  })
}

onMounted(() => {
  startWatching()
})

watch(userId, () => {
  startWatching()
})

onUnmounted(() => {
  if (stopWatching) {
    stopWatching()
  }
})
</script>

<style scoped>
.notification-bell {
  position: relative;
}
</style>
