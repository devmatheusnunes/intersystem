import { getNotificationEvent } from 'src/constants/notificationEvents'

/**
 * Resolve os usuários que devem receber uma notificação.
 *
 * users:
 * [
 *   {
 *     roleId,
 *     setorId,
 *     userId,
 *     ...
 *   }
 * ]
 *
 * roles:
 * {
 *   roleId: {
 *     permissions: [],
 *     visibilityType,
 *     visibleSectors
 *   }
 * }
 */
export function resolveNotificationUsers({ event, request, users = [], roles = {} }) {
  const notificationEvent = getNotificationEvent(event)

  if (!notificationEvent) {
    console.warn(`Evento de notificação "${event}" não encontrado.`)
    return []
  }

  return users.filter((user) => {
    const role = roles[user.roleId]

    if (!role || !role.ativo) {
      return false
    }

    if (!hasPermissions(role, notificationEvent.permissions)) {
      return false
    }

    return canReceiveByVisibility({
      user,
      role,
      request,
    })
  })
}

/**
 * Verifica se a Role possui todas as permissões
 * exigidas pelo evento.
 */
function hasPermissions(role, requiredPermissions = []) {
  if (!requiredPermissions.length) {
    return true
  }

  const rolePermissions = role.permissions || []

  return requiredPermissions.every((permission) => rolePermissions.includes(permission))
}

/**
 * Verifica se o usuário pode receber
 * notificações conforme a visibilidade da Role.
 */
export function canReceiveByVisibility({ user, role, request }) {
  switch (role.visibilityType) {
    /**
     * Apenas solicitações do próprio usuário.
     */
    case 'own':
      return request.solicitante.id === user.id

    /**
     * Solicitações do mesmo setor.
     */
    case 'sector':
      return request.solicitante.setorId === user.setorId

    /**
     * Apenas setores selecionados.
     */
    case 'selected_sectors':
      return (role.visibleSectors || []).includes(request.solicitante.setorId)

    /**
     * Todas as solicitações.
     */
    case 'all':
      return true

    default:
      return false
  }
}
