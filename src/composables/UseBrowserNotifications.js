import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

export default function UseBrowserNotifications() {
  const router = useRouter()

  const supported = ref(typeof window !== 'undefined' && 'Notification' in window)

  const permission = ref(supported.value ? Notification.permission : 'denied')

  const enabled = computed(() => {
    return supported.value && permission.value === 'granted'
  })

  const requestPermission = async () => {
    if (!supported.value) {
      return false
    }

    if (Notification.permission === 'granted') {
      permission.value = 'granted'
      return true
    }

    if (Notification.permission === 'denied') {
      permission.value = 'denied'
      return false
    }

    try {
      const result = await Notification.requestPermission()

      permission.value = result

      return result === 'granted'
    } catch (error) {
      console.error('Erro ao solicitar permissão para notificações:', error)

      permission.value = Notification.permission

      return false
    }
  }

  const notify = ({
    title,
    body = '',
    icon = '/icons/icon-192x192.png',
    tag = 'system-notification',
    data = {},
  }) => {
    if (!supported.value) {
      return null
    }

    if (Notification.permission !== 'granted') {
      return null
    }

    const notification = new Notification(title, {
      body,
      icon,
      tag,
      data,
    })

    notification.onclick = async () => {
      window.focus()

      if (!data.requestId) {
        return
      }

      try {
        await router.push({
          path: `/app/buy/details/${data.requestId}`,
        })

        notification.close()
      } catch (error) {
        console.error('Erro ao navegar para a solicitação:', error)
      }
    }

    return notification
  }

  return {
    supported,
    permission,
    enabled,
    requestPermission,
    notify,
  }
}
