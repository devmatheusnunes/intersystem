import { collection, getDocs, doc, updateDoc } from 'firebase/firestore'
import { db } from 'src/boot/firebase'

import useApi from 'src/composables/UseApi'
import { createRequestModel } from 'src/models/requestModel'
import { REQUEST_STATUS } from 'src/constants/requestStatus'

export default function useRequests() {
  const api = useApi()
  const COLLECTION = 'requestsbuy'

  /* =========================
   * HELPERS
   * ======================= */

  const removeUndefined = (obj) =>
    Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined))

  const getUserId = (user) => user?.id || user?.userId || user?.uid || user?._id || null
  const getUserName = (user) => user?.nome || user?.name || user?.displayName || 'Usuário'
  const getUserEmail = (user) => user?.email || null

  const now = () => new Date()

  const parseDate = (value) => {
    if (!value) return new Date(0)
    if (typeof value?.toDate === 'function') return value.toDate()
    const d = new Date(value)
    return isNaN(d.getTime()) ? new Date(0) : d
  }

  /* =========================
   * HISTORY
   * ======================= */

  const createHistoryEntry = (status, user, observacao = '') =>
    removeUndefined({
      status,
      userId: getUserId(user),
      userName: getUserName(user),
      userEmail: getUserEmail(user),
      observacao,
      createdAt: now(),
    })

  /* =========================
   * REQUEST NUMBER
   * ======================= */

  const generateRequestNumber = async () => {
    const snapshot = await getDocs(collection(db, COLLECTION))
    const next = snapshot.size + 1
    return `REQ-${String(next).padStart(6, '0')}`
  }

  /* =========================
   * GET
   * ======================= */

  const getRequests = async () => await api.list(COLLECTION)
  const getRequestById = async (id) => await api.getById(COLLECTION, id)

  const getRequestsByStatuses = async (statuses = []) => {
    const requests = await getRequests()
    return requests.filter((r) => statuses.includes(r.status))
  }

  const getRequestsByUser = async (userId) => {
    const requests = await getRequests()
    return requests.filter((r) => r.solicitanteId === userId)
  }

  /* =========================
   * CREATE
   * ======================= */

  const createRequest = async ({ requestData, user }) => {
    const requestNumber = await generateRequestNumber()

    const payload = removeUndefined({
      ...createRequestModel(),
      ...requestData,

      requestNumber,
      status: requestData.status,

      solicitante: {
        ...requestData.solicitante,

        id: getUserId(user),
        nome: getUserName(user),
        email: getUserEmail(user),
      },

      createdAt: now(),
      updatedAt: now(),

      historico: [createHistoryEntry(requestData.status, user, 'Solicitação criada')],
    })

    return await api.post(COLLECTION, payload)
  }

  /* =========================
   * UPDATE
   * ======================= */

  const updateRequest = async (id, requestData = {}, user = null) => {
    const ref = doc(db, COLLECTION, id)
    const current = await getRequestById(id)

    let historico = current?.historico || []

    const statusChanged = requestData.status && requestData.status !== current.status

    if (statusChanged && user) {
      historico = [
        ...historico,
        createHistoryEntry(
          requestData.status,
          user,
          `Status alterado de "${current.status}" para "${requestData.status}"`,
        ),
      ]
    }

    const payload = removeUndefined({
      ...requestData,
      historico: requestData.historico || historico,
      updatedAt: now(),
    })

    await updateDoc(ref, payload)
  }

  /* =========================
   * DELETE
   * ======================= */

  const deleteRequest = async (id) => {
    if (!id) throw new Error('ID inválido')
    return await api.remove(COLLECTION, id)
  }

  /* =========================
   * CHANGE STATUS
   * ======================= */

  const changeStatus = async ({ request, newStatus, user, observacao = '', extraData = {} }) => {
    const current = await getRequestById(request.id)

    const historico = [
      ...(current?.historico || []),
      createHistoryEntry(newStatus, user, observacao),
    ]

    return await updateRequest(
      request.id,
      {
        ...extraData,
        status: newStatus,
        historico,
      },
      user,
    )
  }

  /* =========================
   * ACTIONS
   * ======================= */

  const approveRequest = (p) =>
    changeStatus({
      ...p,
      newStatus: REQUEST_STATUS.APPROVED,
    })

  const rejectRequest = (p) =>
    changeStatus({
      ...p,
      newStatus: REQUEST_STATUS.REJECTED,
    })

  const waitRequest = (p) =>
    changeStatus({
      ...p,
      newStatus: REQUEST_STATUS.WAITING,
    })

  const sendToRevision = (p) =>
    changeStatus({
      ...p,
      newStatus: REQUEST_STATUS.REVISION,
    })

  const sendToAnalysis = (p) =>
    changeStatus({
      ...p,
      newStatus: REQUEST_STATUS.PENDING_ANALYSIS,
    })

  const requestReanalysis = ({ request, user, motivo }) =>
    changeStatus({
      request,
      newStatus: REQUEST_STATUS.REANALYSIS,
      user,
      observacao: motivo || 'Solicitou reanálise',
      extraData: {
        reanalises: (request.reanalises || 0) + 1,
        reanalysisRequested: true,

        reanalise: [
          ...(request.reanalise || []),
          {
            justificativa: motivo || '',

            usuarioId: getUserId(user),
            usuarioNome: getUserName(user),

            data: now(),
          },
        ],
      },
    })

  const reinforceRequest = ({ request, user, motivo }) =>
    changeStatus({
      request,
      newStatus: REQUEST_STATUS.WAITING,
      user,
      observacao: motivo || 'Solicitou reforço',
      extraData: {
        reforcos: (request.reforcos || 0) + 1,

        reforco: [
          ...(request.reforco || []),
          {
            justificativa: motivo || '',

            usuarioId: getUserId(user),
            usuarioNome: getUserName(user),

            data: now(),
          },
        ],
      },
    })

  const realizedRequest = (p) =>
    changeStatus({
      ...p,
      newStatus: REQUEST_STATUS.REALIZED,
    })

  const deliveredRequest = (p) =>
    changeStatus({
      ...p,
      newStatus: REQUEST_STATUS.DELIVERED,
    })

  const finishRequest = (p) =>
    changeStatus({
      ...p,
      newStatus: REQUEST_STATUS.FINISHED,
    })

  const duplicateRequest = async ({ request, user }) => {
    const requestNumber = await generateRequestNumber()

    const payload = {
      ...createRequestModel(),

      originalRequestId: request.id,
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

      setorId: request.setorId,
      setorNome: request.setorNome,

      solicitanteId: getUserId(user),
      solicitanteNome: getUserName(user),
      solicitanteEmail: getUserEmail(user),

      status: REQUEST_STATUS.REVISION,

      createdAt: now(),
      updatedAt: now(),

      historico: [createHistoryEntry(REQUEST_STATUS.REVISION, user, 'Solicitação duplicada')],
    }

    return await api.post(COLLECTION, payload)
  }

  return {
    createRequest,
    updateRequest,
    deleteRequest,
    parseDate,

    getRequests,
    getRequestById,
    getRequestsByStatuses,
    getRequestsByUser,

    approveRequest,
    rejectRequest,
    waitRequest,
    sendToRevision,
    sendToAnalysis,

    requestReanalysis,
    reinforceRequest,
    realizedRequest,
    deliveredRequest,
    finishRequest,
    duplicateRequest,

    changeStatus,
    generateRequestNumber,
  }
}
