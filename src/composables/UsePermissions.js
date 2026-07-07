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
    if (!item) {
      return false
    }

    switch (visibilityType.value) {
      case 'all':
        return true

      case 'own':
        return item.userId === profile.value?.id || item.userId === profile.value?.uid

      case 'sector':
        return item.setorId === profile.value?.setorId || item.setor === profile.value?.setor

      case 'selected_sectors':
        return visibleSectors.value.includes(item.setorId || item.setor)

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
