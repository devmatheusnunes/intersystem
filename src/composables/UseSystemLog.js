import useApi from './UseApi.js'
import useAuthUser from './UseAuthUser.js'

export default function useSystemLog() {
  const api = useApi()

  const { profile } = useAuthUser()

  const addLog = async ({ module, action, description, metadata = {} }) => {
    await api.post('logs', {
      userId: profile.value?.id,
      userName: profile.value?.nome,
      module,
      action,
      description,
      metadata,
      createdAt: new Date(),
    })
  }

  return {
    addLog,
  }
}
