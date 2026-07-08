import { computed } from 'vue'
import useAuthUser from './UseAuthUser.js'

export default function usePermissions() {
  const { profile } = useAuthUser()

  /* ==========================================================
   * DADOS DO USUÁRIO
   * ========================================================== */

  const permissions = computed(() => profile.value?.permissions || [])

  const visibilityType = computed(() => profile.value?.visibilityType || 'own')

  const visibleSectors = computed(() => profile.value?.visibleSectors || [])

  /* ==========================================================
   * HELPERS
   * ========================================================== */

  const getCurrentUserId = () =>
    profile.value?.userId || profile.value?.id || profile.value?.uid || ''

  const getCurrentSectorId = () => profile.value?.setorId || profile.value?.setor || ''

  const getItemUserId = (item) =>
    item?.solicitante?.usuarioId ||
    item?.solicitante?.userId ||
    item?.usuarioId ||
    item?.userId ||
    item?.createdBy ||
    ''

  const getItemSectorId = (item) => item?.solicitante?.setorId || item?.setorId || item?.setor || ''

  /* ==========================================================
   * PERMISSÕES
   * ========================================================== */

  const can = (permission) => {
    if (!permission) return false

    if (permissions.value.includes('*')) {
      return true
    }

    if (permissions.value.includes(permission)) {
      return true
    }

    const parts = permission.split('.')

    if (parts.length > 1) {
      const wildcard = `${parts[0]}.*`

      if (permissions.value.includes(wildcard)) {
        return true
      }
    }

    return false
  }

  const cannot = (permission) => !can(permission)

  const canAny = (items = []) => items.some((item) => can(item))

  const canAll = (items = []) => items.every((item) => can(item))

  /* ==========================================================
   * COMPATIBILIDADE
   * ========================================================== */

  const hasPermission = can
  const hasAnyPermission = canAny
  const hasAllPermissions = canAll

  /* ==========================================================
   * VISIBILIDADE
   * ========================================================== */

  const canViewItem = (item) => {
    if (!item) return false

    const currentUserId = getCurrentUserId()
    const currentSectorId = getCurrentSectorId()

    const itemUserId = getItemUserId(item)
    const itemSectorId = getItemSectorId(item)

    switch (visibilityType.value) {
      case 'all':
        return true

      case 'own':
        return itemUserId === currentUserId

      case 'sector':
        return itemSectorId === currentSectorId

      case 'selected_sectors':
        return visibleSectors.value.includes(itemSectorId)

      default:
        return false
    }
  }

  return {
    permissions,

    visibilityType,
    visibleSectors,

    can,
    cannot,

    canAny,
    canAll,

    hasPermission,
    hasAnyPermission,
    hasAllPermissions,

    canViewItem,

    getCurrentUserId,
    getCurrentSectorId,
    getItemUserId,
    getItemSectorId,
  }
}
