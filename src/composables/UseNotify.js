import { useQuasar } from 'quasar'

export default function useNotify() {
  const $q = useQuasar()

  const notifySuccess = (message) => {
    $q.notify({
      type: 'positive',
      icon: 'check_circle',
      position: 'top-right',
      timeout: 3000,
      message: message || 'Sucesso!',
    })
  }

  const notifyError = (message) => {
    $q.notify({
      type: 'negative',
      icon: 'error',
      position: 'top-right',
      timeout: 5000,
      message: message || 'Falha!',
    })
  }

  const notifyWarning = (message) => {
    $q.notify({
      type: 'warning',
      icon: 'warning',
      position: 'top-right',
      timeout: 4000,
      message: message || 'Atenção!',
    })
  }

  const notifyInfo = (message) => {
    $q.notify({
      type: 'info',
      icon: 'info',
      position: 'top-right',
      timeout: 3000,
      message: message || 'Notificação!',
    })
  }

  return {
    notifySuccess,
    notifyError,
    notifyWarning,
    notifyInfo,
  }
}
