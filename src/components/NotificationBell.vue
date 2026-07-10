<template>
  <div>
    <q-btn flat round dense icon="notifications" color="white">
      <q-tooltip> Notificações </q-tooltip>

      <q-badge v-if="count > 0" floating rounded color="negative" class="notification-badge">
        {{ count > 99 ? '99+' : count }}
      </q-badge>
    </q-btn>

    <q-menu anchor="bottom right" self="top right" :offset="[0, 8]">
      <q-card class="notification-card">
        <!-- Cabeçalho -->
        <q-card-section class="row items-center">
          <div>
            <div class="text-subtitle1 text-weight-bold">Notificações</div>

            <div class="text-caption text-grey-7">
              {{ count }}
              {{ count === 1 ? 'notificação' : 'notificações' }}
            </div>
          </div>

          <q-space />

          <q-btn
            v-if="notifications.length"
            flat
            dense
            round
            color="negative"
            icon="delete_sweep"
            @click="confirmClear"
          >
            <q-tooltip> Limpar notificações </q-tooltip>
          </q-btn>
        </q-card-section>

        <q-separator />

        <!-- Lista -->
        <q-list separator class="notification-list">
          <q-item
            v-for="item in notifications"
            :key="item.id"
            clickable
            class="notification-item"
            @click="openNotification(item)"
          >
            <q-item-section avatar>
              <q-avatar :color="item.color || 'primary'" text-color="white">
                <q-icon :name="item.icon || 'notifications'" />
              </q-avatar>
            </q-item-section>

            <q-item-section>
              <q-item-label class="text-weight-medium">
                {{ item.title }}
              </q-item-label>

              <q-item-label caption lines="2">
                {{ item.message }}
              </q-item-label>

              <q-item-label caption class="text-grey-6 q-mt-xs">
                {{ formatDate(item.createdAt) }}
              </q-item-label>
            </q-item-section>
          </q-item>

          <!-- Sem notificações -->

          <div v-if="!notifications.length" class="empty-state">
            <q-icon name="notifications_none" size="54px" color="grey-5" />

            <div class="text-subtitle2 q-mt-md">Nenhuma notificação</div>

            <div class="text-caption text-grey-6 q-mt-xs">Você está em dia.</div>
          </div>
        </q-list>
      </q-card>
    </q-menu>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

import useNotifications from 'src/composables/UseNotifications.js'

const router = useRouter()
const $q = useQuasar()

const { subscribeNotifications, removeNotification, removeAllNotifications } = useNotifications()

/* ==========================================================
 * STATE
 * ========================================================== */

const menu = ref(false)

const notifications = ref([])

const unsubscribe = ref(null)

const opening = ref(false)

const loadingClear = ref(false)

/* ==========================================================
 * COMPUTED
 * ========================================================== */

const count = computed(() => notifications.value.length)

/* ==========================================================
 * CICLO DE VIDA
 * ========================================================== */

onMounted(() => {
  unsubscribe.value = subscribeNotifications((items) => {
    notifications.value = items
  })
})

onBeforeUnmount(() => {
  if (typeof unsubscribe.value === 'function') {
    unsubscribe.value()
  }
})

/* ==========================================================
 * ABRIR NOTIFICAÇÃO
 * ========================================================== */

const openNotification = async (notification) => {
  if (opening.value) return

  opening.value = true

  try {
    menu.value = false

    if (notification.route) {
      await router.push(notification.route)
    }

    await removeNotification(notification.id)
  } catch (err) {
    console.error('Erro ao abrir notificação:', err)
  } finally {
    opening.value = false
  }
}

/* ==========================================================
 * LIMPAR TODAS
 * ========================================================== */

const confirmClear = () => {
  $q.dialog({
    title: 'Limpar notificações',
    message: 'Deseja remover todas as notificações?',
    persistent: true,

    ok: {
      color: 'negative',
      label: 'Limpar',
    },

    cancel: {
      color: 'grey',
      flat: true,
      label: 'Cancelar',
    },
  }).onOk(async () => {
    await clearAll()
  })
}

const clearAll = async () => {
  if (loadingClear.value) return

  loadingClear.value = true

  try {
    await removeAllNotifications()

    menu.value = false
  } catch (err) {
    console.error('Erro ao limpar notificações:', err)
  } finally {
    loadingClear.value = false
  }
}

/* ==========================================================
 * DATA
 * ========================================================== */

const formatDate = (value) => {
  if (!value) return ''

  try {
    const date = typeof value?.toDate === 'function' ? value.toDate() : new Date(value)

    const diff = Date.now() - date.getTime()

    const minutes = Math.floor(diff / 60000)

    if (minutes < 1) {
      return 'Agora'
    }

    if (minutes < 60) {
      return `Há ${minutes} min`
    }

    const hours = Math.floor(minutes / 60)

    if (hours < 24) {
      return `Há ${hours} h`
    }

    const days = Math.floor(hours / 24)

    if (days === 1) {
      return 'Ontem'
    }

    if (days < 7) {
      return `Há ${days} dias`
    }

    return date.toLocaleDateString('pt-BR')
  } catch {
    return ''
  }
}
</script>

<style scoped>
/* ==========================================================
 * CARD
 * ========================================================== */

.notification-card {
  width: 400px;
  max-width: 95vw;
  border-radius: 16px;
  overflow: hidden;
}

/* ==========================================================
 * LISTA
 * ========================================================== */

.notification-list {
  max-height: 450px;
  overflow-y: auto;
}

.notification-item {
  transition:
    background 0.25s ease,
    transform 0.2s ease;
  cursor: pointer;
}

.notification-item:hover {
  background: rgba(25, 118, 210, 0.05);
}

.notification-item:active {
  transform: scale(0.99);
}

/* ==========================================================
 * BADGE
 * ========================================================== */

.notification-badge {
  animation: pulse 1.4s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.15);
  }

  100% {
    transform: scale(1);
  }
}

/* ==========================================================
 * EMPTY STATE
 * ========================================================== */

.empty-state {
  padding: 36px 24px;
  text-align: center;
  color: #9e9e9e;
}

/* ==========================================================
 * SCROLLBAR
 * ========================================================== */

.notification-list::-webkit-scrollbar {
  width: 8px;
}

.notification-list::-webkit-scrollbar-track {
  background: transparent;
}

.notification-list::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.18);
  border-radius: 20px;
}

.notification-list::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.35);
}

/* ==========================================================
 * RESPONSIVO
 * ========================================================== */

@media (max-width: 768px) {
  .notification-card {
    width: 95vw;
    max-width: 95vw;
  }

  .notification-list {
    max-height: 65vh;
  }
}

@media (max-width: 480px) {
  .notification-card {
    width: 100vw;
    max-width: 100vw;
    border-radius: 0;
  }

  .notification-list {
    max-height: calc(100vh - 120px);
  }

  .empty-state {
    padding: 48px 20px;
  }
}
</style>
