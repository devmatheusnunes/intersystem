<template>
  <q-card flat class="notification-center">
    <!-- HEADER -->
    <q-card-section class="row items-center justify-between">
      <div>
        <div class="text-h6">Notificações</div>

        <div class="text-caption text-grey-7">
          {{ unreadCount }}
          não lidas
        </div>
      </div>

      <q-btn flat round dense icon="refresh" @click="loadNotifications">
        <q-tooltip> Atualizar </q-tooltip>
      </q-btn>
    </q-card-section>

    <q-separator />

    <!-- LISTA -->

    <q-scroll-area style="height: 420px">
      <template v-if="notifications.length">
        <NotificationItem
          v-for="notification in notifications"
          :key="notification.id"
          :notification="notification"
          @click="openNotification"
        />
      </template>

      <div v-else class="column flex-center q-pa-xl text-grey">
        <q-icon name="notifications_off" size="56px" />

        <div class="text-subtitle1 q-mt-md">Nenhuma notificação</div>

        <div class="text-caption">Você está em dia 😊</div>
      </div>
    </q-scroll-area>

    <q-separator />

    <!-- FOOTER -->

    <q-card-actions align="between">
      <q-btn
        flat
        color="primary"
        icon="done_all"
        label="Marcar todas"
        :disable="!unreadCount"
        @click="markAll"
      />

      <q-btn
        flat
        color="negative"
        icon="delete_sweep"
        label="Limpar"
        :disable="!notifications.length"
        @click="clearAll"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

import { useRouter } from 'vue-router'

import NotificationItem from './NotificationItem.vue'

import UseNotifications from 'src/composables/UseNotifications'

import useAuthUser from 'src/composables/UseAuthUser'

const router = useRouter()

const notificationsApi = UseNotifications()

const { profile } = useAuthUser()

const notifications = ref([])

const loading = ref(false)

const unreadCount = computed(() => notifications.value.filter((item) => !item.read).length)

const userId = computed(() => profile.value?.id || profile.value?.userId || profile.value?.uid)

const emit = defineEmits(['update:count'])

const loadNotifications = async () => {
  if (!userId.value) return

  loading.value = true

  try {
    notifications.value = await notificationsApi.getLatest(userId.value, 20)
  } finally {
    loading.value = false
  }

  emit('update:count', unreadCount.value)
}

const openNotification = async (notification) => {
  if (!notification.read) {
    await notificationsApi.markAsRead(notification.id)

    notification.read = true
  }

  if (notification.requestId) {
    router.push(`/app/buy/details/${notification.requestId}`)
  }

  emit('update:count', unreadCount.value)
}

const markAll = async () => {
  await notificationsApi.markAllAsRead(userId.value)

  notifications.value.forEach((item) => {
    item.read = true
  })

  emit('update:count', unreadCount.value)
}

const clearAll = async () => {
  await notificationsApi.clearAllNotifications(userId.value)

  notifications.value = []

  emit('update:count', 0)
}

defineExpose({
  loadNotifications,
})

onMounted(async () => {
  await loadNotifications()
})
</script>

<style scoped>
.notification-center {
  width: 430px;
  max-width: 95vw;
}
</style>
