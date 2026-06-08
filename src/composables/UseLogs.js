import useApi from 'src/composables/UseApi'

export default function useLogs() {
  const api = useApi()

  const createLog = async ({ userId, usuario, modulo, acao, descricao, entidadeId = '' }) => {
    await api.post('system_logs', {
      userId,
      usuario,
      modulo,
      acao,
      descricao,
      entidadeId,
      createdAt: new Date(),
    })
  }

  return {
    createLog,
  }
}
