<template>
  <q-btn flat round dense icon="notifications" class="notification-bell">
    <q-badge v-if="unreadCount > 0" floating rounded color="negative" :label="badgeLabel" />

    <q-menu anchor="bottom right" self="top right" fit @before-show="refresh">
      <div class="notification-menu">
        <div class="notification-menu__header">
          <div class="text-subtitle1 text-weight-medium">Notificações</div>

          <!-- NOTIFICAÇÕES NÃO ATIVADAS -->
          <q-btn
            v-if="browserNotificationSupported && !browserNotificationEnabled"
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

          <!-- NOTIFICAÇÕES ATIVADAS -->
          <q-btn
            v-else-if="browserNotificationSupported && browserNotificationEnabled"
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

        <!-- NAVEGADOR BLOQUEOU AS NOTIFICAÇÕES -->
        <q-banner
          v-if="browserNotificationSupported && browserNotificationPermission === 'denied'"
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

/*
 * =====================================================
 * NOTIFICAÇÕES DO SISTEMA
 * =====================================================
 */
const notificationsApi = UseNotifications()

/*
 * =====================================================
 * NOTIFICAÇÕES DO NAVEGADOR
 * =====================================================
 */
const browserNotifications = UseBrowserNotifications()

const browserNotificationSupported = ref(false)
const browserNotificationPermission = ref('denied')

const browserNotificationEnabled = computed(() => {
  return browserNotificationSupported.value && browserNotificationPermission.value === 'granted'
})

/*
 * =====================================================
 * VERIFICAR PERMISSÃO REAL DO NAVEGADOR
 * =====================================================
 *
 * Esta função consulta diretamente o navegador.
 *
 * Não utiliza estado salvo.
 * Não utiliza localStorage.
 * Não utiliza Firebase.
 * Não depende da conta logada.
 */
const checkBrowserNotificationPermission = () => {
  const supported = typeof window !== 'undefined' && 'Notification' in window

  browserNotificationSupported.value = supported

  if (!supported) {
    browserNotificationPermission.value = 'denied'
    return
  }

  browserNotificationPermission.value = Notification.permission
}

/*
 * =====================================================
 * AUTENTICAÇÃO
 * =====================================================
 */
const { profile } = useAuthUser()

const userId = computed(() => {
  return profile.value?.id || profile.value?.userId || profile.value?.uid || null
})

/*
 * =====================================================
 * BADGE
 * =====================================================
 */
const badgeLabel = computed(() => {
  if (unreadCount.value > 99) {
    return '99+'
  }

  return unreadCount.value
})

const updateCount = (count) => {
  unreadCount.value = count
}

/*
 * =====================================================
 * FIRESTORE
 * =====================================================
 */
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

/*
 * =====================================================
 * ATIVAR NOTIFICAÇÕES
 * =====================================================
 */
const enableBrowserNotifications = async () => {
  const granted = await browserNotifications.requestPermission()

  /*
   * Depois da solicitação, consulta novamente
   * o estado real do navegador.
   */
  checkBrowserNotificationPermission()

  /*
   * Se foi concedido, o botão muda imediatamente
   * para "Ativadas".
   */
  if (granted) {
    browserNotificationPermission.value = 'granted'
  }
}

/*
 * =====================================================
 * ATUALIZAR MENU
 * =====================================================
 */
const refresh = async () => {
  /*
   * PRIMEIRO verifica a permissão real.
   */
  checkBrowserNotificationPermission()

  /*
   * DEPOIS atualiza as notificações do sistema.
   */
  await center.value?.loadNotifications?.()
}

/*
 * =====================================================
 * EVENTOS DO NAVEGADOR
 * =====================================================
 *
 * Caso o usuário altere a permissão nas configurações
 * do navegador e volte para a aplicação.
 */
const handleFocus = () => {
  checkBrowserNotificationPermission()
}

const handleVisibilityChange = () => {
  if (document.visibilityState === 'visible') {
    checkBrowserNotificationPermission()
  }
}

/*
 * =====================================================
 * CICLO DE VIDA
 * =====================================================
 */
onMounted(() => {
  /*
   * Verificação inicial.
   */
  checkBrowserNotificationPermission()

  /*
   * Listener das notificações do Firestore.
   */
  startWatching()

  /*
   * Verifica quando o usuário volta ao navegador.
   */
  window.addEventListener('focus', handleFocus)

  document.addEventListener('visibilitychange', handleVisibilityChange)
})

watch(userId, () => {
  startWatching()
})

onUnmounted(() => {
  if (stopWatching) {
    stopWatching()
    stopWatching = null
  }

  window.removeEventListener('focus', handleFocus)

  document.removeEventListener('visibilitychange', handleVisibilityChange)
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
