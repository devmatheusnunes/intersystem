import { getNotificationEvent } from 'src/constants/notificationEvents'

/**
 * Resolver usuários que devem receber notificações
 *
 * Entrada:
 *
 * {
 *   event:"REQUEST_ANALYSIS",
 *   request:{...},
 *   users:[]
 * }
 *
 *
 * Retorno:
 *
 * [
 *   usuários elegíveis
 * ]
 *
 */

export function resolveNotificationUsers({
  event,

  request,

  users = [],
}) {
  const notificationEvent = getNotificationEvent(event)

  if (!notificationEvent) {
    console.warn('Evento de notificação inexistente:', event)

    return []
  }

  return users.filter((user) => {
    /**
     * Valida permissão principal
     */
    if (!hasPermission(user, notificationEvent.permission)) {
      return false
    }

    /**
     * Eventos especiais
     * precisam de permissão adicional
     */
    if (
      notificationEvent.extraPermission &&
      !hasPermission(user, notificationEvent.extraPermission)
    ) {
      return false
    }

    /**
     * Validação da visibilidade
     */
    return canReceiveByVisibility(
      user,

      request,
    )
  })
}

/**
 * Verifica se usuário possui permissão
 */
function hasPermission(
  user,

  permission,
) {
  if (!permission) {
    return true
  }

  return user.permissions?.includes(permission)
}

/**
 * Validação de visibilidade
 *
 * Tipos:
 *
 * own
 * sector
 * specific
 * all
 *
 */
export function canReceiveByVisibility(
  user,

  request,
) {
  const visibility = user.visibility

  if (!visibility) {
    return false
  }

  switch (visibility.type) {
    /**
     * Somente meus registros
     */
    case 'own':
      return request.userId === user.id

    /**
     * Meu setor
     */
    case 'sector':
      return request.setor === user.setor

    /**
     * Setores específicos
     */
    case 'specific':
      return visibility.sectors?.includes(request.setor)

    /**
     * Visualizar tudo
     */
    case 'all':
      return true

    default:
      return false
  }
}
