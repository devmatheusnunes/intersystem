import { SYSTEM_MODULES } from './modules'

export const getSidebarItems = (permissions = []) => {
  return SYSTEM_MODULES.filter((module) => {
    if (!module.showInMenu) return false

    return permissions.includes(`${module.key}.menu`)
  }).sort((a, b) => a.order - b.order)
}
