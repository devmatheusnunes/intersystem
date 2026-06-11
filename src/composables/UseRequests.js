import { collection, getDocs } from 'firebase/firestore'
import { db } from 'src/boot/firebase'

import useApi from 'src/composables/UseApi'

import { createRequestModel } from 'src/models/requestModel'

import { REQUEST_STATUS } from 'src/constants/requestStatus'

export default function useRequests() {
  const api = useApi()

  const COLLECTION = 'requestsbuy'

  const generateRequestNumber = async () => {
    const snapshot = await getDocs(collection(db, COLLECTION))

    const nextNumber = snapshot.size + 1

    return `REQ-${String(nextNumber).padStart(6, '0')}`
  }

  const createHistoryEntry = (status, usuarioId, usuarioNome, observacao = '') => ({
    status,
    usuarioId,
    usuarioNome,
    observacao,
    data: new Date(),
  })

  const getRequests = async () => {
    return await api.list(COLLECTION)
  }

  const getRequestById = async (id) => {
    return await api.getById(COLLECTION, id)
  }

  const getRequestsByStatus = async (status) => {
    const requests = await getRequests()

    return requests.filter((request) => request.status === status)
  }

  const getRequestsByStatuses = async (statuses = []) => {
    const requests = await getRequests()

    return requests.filter((request) => statuses.includes(request.status))
  }

  const getRequestsByUser = async (userId) => {
    const requests = await getRequests()

    return requests.filter((request) => request.solicitanteId === userId)
  }

  const createRequest = async ({ requestData, user }) => {
    const requestNumber = await generateRequestNumber()

    const initialStatus = requestData.isEletronico ? REQUEST_STATUS.BUDGET : REQUEST_STATUS.REVISION

    const payload = {
      ...createRequestModel(),

      ...requestData,

      requestNumber,

      status: initialStatus,

      solicitanteId: user.userId,

      solicitanteNome: user.nome,

      solicitanteEmail: user.email,

      createdAt: new Date(),

      updatedAt: new Date(),

      historico: [createHistoryEntry(initialStatus, user.userId, user.nome, 'Solicitação criada')],
    }

    return await api.post(COLLECTION, payload)
  }

  const updateRequest = async (id, data) => {
    return await api.update(COLLECTION, id, {
      ...data,
      updatedAt: new Date(),
    })
  }

  const deleteRequest = async (id) => {
    return await api.remove(COLLECTION, id)
  }

  const changeStatus = async ({ request, newStatus, user, observacao = '', extraData = {} }) => {
    const historico = [
      ...(request.historico || []),

      createHistoryEntry(newStatus, user.userId, user.nome, observacao),
    ]

    return await updateRequest(request.id, {
      ...extraData,

      status: newStatus,

      historico,
    })
  }

  const approveRequest = async ({ request, user, observacao = '' }) => {
    return await changeStatus({
      request,

      newStatus: REQUEST_STATUS.APPROVED,

      user,

      observacao,

      extraData: {
        analise: {
          decisao: REQUEST_STATUS.APPROVED,

          observacao,

          usuarioId: user.userId,

          usuarioNome: user.nome,

          data: new Date(),
        },
      },
    })
  }

  const rejectRequest = async ({ request, user, observacao = '' }) => {
    return await changeStatus({
      request,

      newStatus: REQUEST_STATUS.REJECTED,

      user,

      observacao,

      extraData: {
        jaFoiIndeferido: true,

        analise: {
          decisao: REQUEST_STATUS.REJECTED,

          observacao,

          usuarioId: user.userId,

          usuarioNome: user.nome,

          data: new Date(),
        },
      },
    })
  }

  const waitRequest = async ({ request, user, observacao = '' }) => {
    return await changeStatus({
      request,

      newStatus: REQUEST_STATUS.WAITING,

      user,

      observacao,
    })
  }

  const sendToRevision = async ({ request, user, observacao = '' }) => {
    return await changeStatus({
      request,

      newStatus: REQUEST_STATUS.REVISION,

      user,

      observacao,
    })
  }

  const sendToAnalysis = async ({ request, user, observacao = '' }) => {
    return await changeStatus({
      request,

      newStatus: REQUEST_STATUS.PENDING_ANALYSIS,

      user,

      observacao,
    })
  }

  const requestReanalysis = async ({ request, user, motivo }) => {
    return await changeStatus({
      request,

      newStatus: REQUEST_STATUS.PENDING_ANALYSIS,

      user,

      observacao: 'Solicitada reanálise',

      extraData: {
        reanalises: (request.reanalises || 0) + 1,

        reanalise: {
          motivo,

          usuarioId: user.userId,

          usuarioNome: user.nome,

          data: new Date(),
        },
      },
    })
  }

  const reinforceRequest = async ({ request }) => {
    return await updateRequest(request.id, {
      prioridadeAnalise: true,

      prioridadeData: new Date(),
    })
  }

  const finishRequest = async ({ request, user }) => {
    return await changeStatus({
      request,

      newStatus: REQUEST_STATUS.FINISHED,

      user,

      observacao: 'Pedido finalizado',

      extraData: {
        pagamento: {
          ...request.pagamento,

          comprado: true,

          dataCompra: new Date(),

          usuarioId: user.userId,

          usuarioNome: user.nome,
        },
      },
    })
  }

  const duplicateRequest = async ({ request, user }) => {
    const requestNumber = await generateRequestNumber()

    const initialStatus = request.isEletronico ? REQUEST_STATUS.BUDGET : REQUEST_STATUS.REVISION

    const payload = {
      ...createRequestModel(),

      requestNumber,

      titulo: request.titulo,

      descricao: request.descricao,

      categoria: request.categoria,

      justificativa: request.justificativa,

      quantidade: request.quantidade,

      produtoUrl: request.produtoUrl,

      fornecedor: request.fornecedor,

      valorUnitario: request.valorUnitario,

      valorTotal: request.valorTotal,

      observacoes: request.observacoes,

      isEletronico: request.isEletronico,

      setorId: request.setorId,

      setorNome: request.setorNome,

      solicitanteId: user.userId,

      solicitanteNome: user.nome,

      solicitanteEmail: user.email,

      status: initialStatus,

      createdAt: new Date(),

      updatedAt: new Date(),

      historico: [
        createHistoryEntry(initialStatus, user.userId, user.nome, 'Solicitação recriada'),
      ],
    }

    return await api.post(COLLECTION, payload)
  }

  return {
    createRequest,

    updateRequest,

    deleteRequest,

    getRequests,

    getRequestById,

    getRequestsByStatus,

    getRequestsByStatuses,

    getRequestsByUser,

    approveRequest,

    rejectRequest,

    waitRequest,

    sendToRevision,

    sendToAnalysis,

    requestReanalysis,

    reinforceRequest,

    finishRequest,

    duplicateRequest,

    changeStatus,

    generateRequestNumber,
  }
}
