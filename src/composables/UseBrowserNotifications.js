import { ref } from 'vue'

export default function UseBrowserNotifications() {
  const supported = ref(typeof window !== 'undefined' && 'Notification' in window)

  const permission = ref(supported.value ? Notification.permission : 'denied')

  const requestPermission = async () => {
    if (!supported.value) {
      return false
    }

    const result = await Notification.requestPermission()

    permission.value = result

    return result === 'granted'
  }

  const notify = ({
    title,
    body,
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

    notification.onclick = () => {
      window.focus()

      if (data.requestId) {
        window.location.href = `/app/buy/details/${data.requestId}`
      }
    }

    return notification
  }

  return {
    supported,
    permission,
    requestPermission,
    notify,
  }
}
