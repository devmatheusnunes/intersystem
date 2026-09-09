import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

import { useRouter } from 'vue-router'

export default function UseBrowserNotifications() {
  const router = useRouter()

  const supported = ref(typeof window !== 'undefined' && 'Notification' in window)

  const permission = ref('denied')

  let permissionStatus = null

  /*
   * =====================================================
   * VERIFICAR PERMISSÃO REAL DO NAVEGADOR
   * =====================================================
   */
  const checkPermission = () => {
    if (!supported.value) {
      permission.value = 'denied'
      return permission.value
    }

    permission.value = Notification.permission

    return permission.value
  }

  /*
   * =====================================================
   * ESTADO DAS NOTIFICAÇÕES
   * =====================================================
   *
   * Só consideramos ativada quando o navegador
   * realmente informa "granted".
   */
  const enabled = computed(() => {
    return supported.value && permission.value === 'granted'
  })

  /*
   * =====================================================
   * OBSERVAR ALTERAÇÃO DA PERMISSÃO
   * =====================================================
   */
  const watchPermission = async () => {
    if (!supported.value) {
      return
    }

    /*
     * Primeira verificação.
     */
    checkPermission()

    /*
     * Alguns navegadores suportam a Permissions API.
     *
     * Isso permite detectar quando o usuário altera
     * a permissão nas configurações do navegador.
     */
    if (typeof navigator !== 'undefined' && navigator.permissions && navigator.permissions.query) {
      try {
        permissionStatus = await navigator.permissions.query({
          name: 'notifications',
        })

        permission.value = permissionStatus.state

        permissionStatus.onchange = () => {
          checkPermission()
        }
      } catch (error) {
        /*
         * Alguns navegadores podem não permitir
         * a consulta de "notifications".
         *
         * Nesse caso continuamos utilizando
         * Notification.permission.
         */
        console.warn('Não foi possível observar a permissão das notificações:', error)
      }
    }
  }

  /*
   * =====================================================
   * SOLICITAR PERMISSÃO
   * =====================================================
   */
  const requestPermission = async () => {
    /*
     * Sempre verifica o estado real antes de fazer
     * qualquer coisa.
     */
    checkPermission()

    if (!supported.value) {
      return false
    }

    /*
     * Já está permitido.
     */
    if (permission.value === 'granted') {
      return true
    }

    /*
     * O navegador bloqueou.
     *
     * Nesse estado o site não consegue abrir
     * novamente o diálogo de permissão.
     */
    if (permission.value === 'denied') {
      return false
    }

    try {
      const result = await Notification.requestPermission()

      permission.value = result

      return result === 'granted'
    } catch (error) {
      console.error('Erro ao solicitar permissão para notificações:', error)

      checkPermission()

      return false
    }
  }

  /*
   * =====================================================
   * NOTIFICAÇÃO
   * =====================================================
   */
  const notify = ({
    title,
    body = '',
    icon = '/icons/icon-192x192.png',
    tag = 'system-notification',
    data = {},
  }) => {
    /*
     * Antes de disparar, verifica novamente
     * a permissão REAL do navegador.
     *
     * Isso evita utilizar um estado antigo.
     */
    checkPermission()

    if (!enabled.value) {
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
        notification.close()
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

  /*
   * =====================================================
   * QUANDO A JANELA VOLTA AO FOCO
   * =====================================================
   *
   * Útil quando o usuário vai até as configurações
   * do navegador, altera a permissão e volta para o
   * sistema.
   */
  const handleFocus = () => {
    checkPermission()
  }

  /*
   * =====================================================
   * QUANDO A ABA VOLTA A FICAR VISÍVEL
   * =====================================================
   */
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      checkPermission()
    }
  }

  onMounted(() => {
    checkPermission()
    watchPermission()

    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibilityChange)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('focus', handleFocus)

    document.removeEventListener('visibilitychange', handleVisibilityChange)

    if (permissionStatus) {
      permissionStatus.onchange = null
      permissionStatus = null
    }
  })

  return {
    supported,
    permission,
    enabled,
    checkPermission,
    requestPermission,
    notify,
  }
}
