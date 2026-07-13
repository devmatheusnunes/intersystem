import { computed } from 'vue'

import useAuthUser from './UseAuthUser.js'

export default function usePermissions() {
  const { profile } = useAuthUser()

  const permissions = computed(() => {
    return profile.value?.permissions || []
  })

  const visibilityType = computed(() => {
    return profile.value?.visibilityType || 'own'
  })

  const visibleSectors = computed(() => {
    return profile.value?.visibleSectors || []
  })

  const can = (permission) => {
    if (!permission) {
      return false
    }

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

  const cannot = (permission) => {
    return !can(permission)
  }

  const canAny = (items = []) => {
    return items.some((item) => can(item))
  }

  const canAll = (items = []) => {
    return items.every((item) => can(item))
  }

  // Compatibilidade com código antigo
  const hasPermission = (permission) => {
    return can(permission)
  }

  const hasAnyPermission = (items = []) => {
    return canAny(items)
  }

  const hasAllPermissions = (items = []) => {
    return canAll(items)
  }

  const canViewItem = (item) => {
    if (!item || !profile.value) {
      return false
    }

    const requestUserId = item.solicitante?.id
    const requestSectorId = item.solicitante?.setorId
    const requestSectorName = item.solicitante?.setorNome

    const profileUserId = profile.value.id || profile.value.userId || profile.value.uid

    const profileSectorId = profile.value.setorId

    const profileSectorName = profile.value.setorNome || profile.value.setor

    console.log('VISIBILITY CHECK', {
      type: visibilityType.value,

      request: {
        userId: requestUserId,
        sectorId: requestSectorId,
        sectorName: requestSectorName,
      },

      profile: {
        userId: profileUserId,
        sectorId: profileSectorId,
        sectorName: profileSectorName,
      },
    })

    switch (visibilityType.value) {
      case 'all':
        return true

      case 'own':
        return requestUserId === profileUserId

      case 'sector':
        return requestSectorId && profileSectorId && requestSectorId === profileSectorId

      case 'selected_sectors':
        return visibleSectors.value.some((sector) => {
          if (!sector) {
            return false
          }

          if (typeof sector === 'string') {
            return sector === requestSectorId || sector === requestSectorName
          }

          return (
            sector.id === requestSectorId ||
            sector.value === requestSectorId ||
            sector.nome === requestSectorName
          )
        })

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
  }
}
