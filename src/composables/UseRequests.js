import { collection, getDocs } from 'firebase/firestore'
import { db } from 'src/boot/firebase'

import useApi from 'src/composables/UseApi'

import { createRequestModel } from 'src/models/requestModel'

import { REQUEST_STATUS } from 'src/constants/requestStatus'

export default function useRequests() {
  const api = useApi()

  const COLLECTION = 'requestsbuy'

  const getUserId = (user) => user?.userId || user?.uid || ''

  const getUserName = (user) => user?.nome || user?.displayName || user?.email || 'Usuário'

  const getUserEmail = (user) => user?.email || ''

  const generateRequestNumber = async () => {
    const snapshot = await getDocs(collection(db, COLLECTION))

    const nextNumber = snapshot.size + 1

    return `REQ-${String(nextNumber).padStart(6, '0')}`
  }

  const createHistoryEntry = (status, usuarioId, usuarioNome, observacao = '') => ({
    status,
    usuarioId: usuarioId || '',
    usuarioNome: usuarioNome || '',
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

      solicitanteId: getUserId(user),

      solicitanteNome: getUserName(user),

      solicitanteEmail: getUserEmail(user),

      createdAt: new Date(),

      updatedAt: new Date(),

      historico: [
        createHistoryEntry(initialStatus, getUserId(user), getUserName(user), 'Solicitação criada'),
      ],
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

      createHistoryEntry(newStatus, getUserId(user), getUserName(user), observacao),
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

          analyzedAt: new Date(),

          analyzedBy: getUserId(user),

          analyzedByName: getUserName(user),

          analysisObservation: observacao,

          observacao,

          usuarioId: getUserId(user),

          usuarioNome: getUserName(user),

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

        analyzedAt: new Date(),

        analyzedBy: getUserId(user),

        analyzedByName: getUserName(user),

        analysisObservation: observacao,

        analise: {
          decisao: REQUEST_STATUS.REJECTED,

          observacao,

          usuarioId: getUserId(user),

          usuarioNome: getUserName(user),

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

      extraData: {
        analyzedAt: new Date(),

        analyzedBy: getUserId(user),

        analyzedByName: getUserName(user),

        analysisObservation: observacao,
      },
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

      newStatus: REQUEST_STATUS.REANALYSIS,

      user,

      observacao: 'Solicitada reanálise',

      extraData: {
        reanalises: (request.reanalises || 0) + 1,

        reanalysisRequested: true,

        reanalysisRequestedAt: new Date(),

        reanalise: {
          motivo,

          usuarioId: getUserId(user),

          usuarioNome: getUserName(user),

          data: new Date(),
        },
      },
    })
  }

  const reinforceRequest = async ({ request, user }) => {
    return await changeStatus({
      request,

      newStatus: REQUEST_STATUS.PENDING_ANALYSIS,

      user,

      observacao: 'Solicitado reforço de análise',

      extraData: {
        prioridadeAnalise: true,

        prioridadeData: new Date(),
      },
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

          usuarioId: getUserId(user),

          usuarioNome: getUserName(user),
        },
      },
    })
  }

  const duplicateRequest = async ({ request, user }) => {
    const requestNumber = await generateRequestNumber()

    const initialStatus = REQUEST_STATUS.REVISION

    const payload = {
      originalRequestId: request.id,
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

      observacoes: request.observacoes || '',

      isEletronico: request.isEletronico,

      setorId: request.setorId,

      setorNome: request.setorNome,

      solicitanteId: getUserId(user),

      solicitanteNome: getUserName(user),

      solicitanteEmail: getUserEmail(user),

      status: initialStatus,

      createdAt: new Date(),

      updatedAt: new Date(),

      historico: [
        createHistoryEntry(
          initialStatus,
          getUserId(user),
          getUserName(user),
          'Solicitação recriada',
        ),
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
