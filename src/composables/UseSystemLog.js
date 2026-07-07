import useApi from './UseApi.js'
import useAuthUser from './UseAuthUser.js'

const api = useApi()

export default function useSystemLog() {
  const { profile } = useAuthUser()

  const sanitize = (obj = {}) => {
    const clone = JSON.parse(JSON.stringify(obj))

    delete clone.createdAt
    delete clone.updatedAt

    return clone
  }

  const getChanges = (before = {}, after = {}) => {
    const changes = {}

    const keys = new Set([...Object.keys(before), ...Object.keys(after)])

    keys.forEach((key) => {
      const oldValue = before[key]
      const newValue = after[key]

      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        changes[key] = {
          before: oldValue ?? null,
          after: newValue ?? null,
        }
      }
    })

    return changes
  }

  const addLog = async ({
    module,
    action,
    description,
    documentId = null,
    before = null,
    after = null,
  }) => {
    const p = profile.value || {}

    const beforeData = before ? sanitize(before) : null
    const afterData = after ? sanitize(after) : null

    await api.post('system_logs', {
      module,
      action,
      description,

      documentId,

      user: {
        id: p.userId || '',
        nome: p.nome || '',
        email: p.email || '',
        role: p.role || '',
        roleId: p.roleId || '',
        setor: p.setor || '',
        setorId: p.setorId || '',
      },

      before: beforeData,

      after: afterData,

      changes: beforeData && afterData ? getChanges(beforeData, afterData) : null,

      client: {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        screen: `${window.screen.width}x${window.screen.height}`,
      },

      createdAt: new Date(),
    })
  }

  return {
    addLog,
  }
}
