<template>
  <q-btn flat round dense icon="notifications" class="notification-bell">
    <q-badge v-if="unreadCount > 0" floating rounded color="negative" :label="badgeLabel" />

    <q-menu anchor="bottom right" self="top right" fit @before-show="refresh">
      <div class="notification-menu">
        <div class="notification-menu__header">
          <div class="text-subtitle1 text-weight-medium">Notificações</div>

          <q-btn
            v-if="browserNotifications.supported && !browserNotifications.enabled"
            flat
            dense
            size="sm"
            icon="notifications_active"
            color="primary"
            label="Ativar"
            @click.stop="enableBrowserNotifications"
          >
            <q-tooltip> Ativar notificações do navegador </q-tooltip>
          </q-btn>

          <q-btn
            v-else-if="browserNotifications.supported && browserNotifications.enabled"
            flat
            dense
            size="sm"
            icon="notifications_active"
            color="positive"
            label="Ativadas"
            disable
          >
            <q-tooltip> As notificações do navegador estão ativadas </q-tooltip>
          </q-btn>
        </div>

        <q-banner
          v-if="browserNotifications.supported && browserNotifications.permission === 'denied'"
          dense
          class="notification-menu__permission"
        >
          <template #avatar>
            <q-icon name="notifications_off" />
          </template>

          <div class="text-caption">
            As notificações do navegador estão bloqueadas. Para recebê-las, permita as notificações
            nas configurações do navegador.
          </div>
        </q-banner>

        <NotificationCenter ref="center" @update:count="updateCount" />
      </div>
    </q-menu>
  </q-btn>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

import NotificationCenter from './NotificationCenter.vue'

import UseNotifications from 'src/composables/UseNotifications'
import UseBrowserNotifications from 'src/composables/UseBrowserNotifications'
import useAuthUser from 'src/composables/UseAuthUser'

const center = ref(null)
const unreadCount = ref(0)

const notificationsApi = UseNotifications()
const browserNotifications = UseBrowserNotifications()

const { profile } = useAuthUser()

const userId = computed(() => {
  return profile.value?.id || profile.value?.userId || profile.value?.uid || null
})

const badgeLabel = computed(() => {
  if (unreadCount.value > 99) {
    return '99+'
  }

  return unreadCount.value
})

const updateCount = (count) => {
  unreadCount.value = count
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

  stopWatching = notificationsApi.watchUnread(userId.value, ({ count, added }) => {
    unreadCount.value = count

    for (const notification of added) {
      browserNotifications.notify({
        title: notification.title || 'Nova notificação',
        body: notification.message || '',
        tag: `notification-${notification.id}`,
        data: {
          notificationId: notification.id,
          requestId: notification.requestId || null,
        },
      })
    }
  })
}

const enableBrowserNotifications = async () => {
  await browserNotifications.requestPermission()
}

const refresh = async () => {
  await center.value?.loadNotifications?.()
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
    stopWatching = null
  }
})
</script>

<style scoped>
.notification-bell {
  position: relative;
}

.notification-menu {
  width: 420px;
  max-width: 90vw;
}

.notification-menu__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.notification-menu__permission {
  margin: 8px;
}
</style>
