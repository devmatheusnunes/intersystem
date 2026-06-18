import { collection, getDocs, doc, updateDoc } from 'firebase/firestore'
import { db } from 'src/boot/firebase'

import useApi from 'src/composables/UseApi'
import { createRequestModel } from 'src/models/requestModel'
import { REQUEST_STATUS } from 'src/constants/requestStatus'

export default function useRequests() {
  const api = useApi()
  const COLLECTION = 'requestsbuy'

  /* =========================================================
   * 🧠 HELPERS (ANTI BUG)
   * ======================================================= */

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

  /* =========================================================
   * 🧾 HISTÓRICO PADRÃO
   * ======================================================= */

  const createHistoryEntry = (status, user, observacao = '') =>
    removeUndefined({
      status,
      userId: getUserId(user),
      userName: getUserName(user),
      userEmail: getUserEmail(user),
      observacao,
      createdAt: now(),
    })

  /* =========================================================
   * 🔢 REQUEST NUMBER
   * ======================================================= */

  const generateRequestNumber = async () => {
    const snapshot = await getDocs(collection(db, COLLECTION))
    const next = snapshot.size + 1
    return `REQ-${String(next).padStart(6, '0')}`
  }

  /* =========================================================
   * 📥 GET
   * ======================================================= */

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

  /* =========================================================
   * ➕ CREATE
   * ======================================================= */

  const createRequest = async ({ requestData, user }) => {
    const requestNumber = await generateRequestNumber()

    const payload = removeUndefined({
      ...createRequestModel(),
      ...requestData,

      requestNumber,

      status: requestData.status,

      solicitanteId: getUserId(user),
      solicitanteNome: getUserName(user),
      solicitanteEmail: getUserEmail(user),

      createdAt: now(),
      updatedAt: now(),

      historico: [createHistoryEntry(requestData.status, user, 'Solicitação criada')],
    })

    return await api.post(COLLECTION, payload)
  }

  /* =========================================================
   * 🔄 UPDATE (SAFE)
   * ======================================================= */

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

  /* =========================================================
   * 🔁 DELETE  (CORE)
   * ======================================================= */

  const deleteRequest = async (id) => {
    if (!id) throw new Error('ID inválido')

    return await api.remove(COLLECTION, id)
  }

  /* =========================================================
   * 🔁 CHANGE STATUS (CORE)
   * ======================================================= */

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

  /* =========================================================
   * ✅ ACTIONS
   * ======================================================= */

  const approveRequest = async ({ request, user, observacao = '' }) =>
    changeStatus({
      request,
      newStatus: REQUEST_STATUS.APPROVED,
      user,
      observacao,
      extraData: {
        analise: {
          decisao: REQUEST_STATUS.APPROVED,
          analyzedAt: now(),
          analyzedBy: getUserId(user),
          analyzedByName: getUserName(user),
          observacao,
        },
      },
    })

  const rejectRequest = async ({ request, user, observacao = '' }) =>
    changeStatus({
      request,
      newStatus: REQUEST_STATUS.REJECTED,
      user,
      observacao,
      extraData: {
        jaFoiIndeferido: true,
        analise: {
          decisao: REQUEST_STATUS.REJECTED,
          analyzedAt: now(),
          analyzedBy: getUserId(user),
          analyzedByName: getUserName(user),
          observacao,
        },
      },
    })

  const waitRequest = async ({ request, user, observacao = '' }) =>
    changeStatus({
      request,
      newStatus: REQUEST_STATUS.WAITING,
      user,
      observacao,
    })

  const sendToRevision = async ({ request, user, observacao = '' }) =>
    changeStatus({
      request,
      newStatus: REQUEST_STATUS.REVISION,
      user,
      observacao,
    })

  const sendToAnalysis = async ({ request, user, observacao = '' }) =>
    changeStatus({
      request,
      newStatus: REQUEST_STATUS.PENDING_ANALYSIS,
      user,
      observacao,
    })

  /* =========================================================
   * 🔥 REANÁLISE
   * ======================================================= */

  const requestReanalysis = async ({ request, user, motivo }) =>
    changeStatus({
      request,
      newStatus: REQUEST_STATUS.REANALYSIS,
      user,
      observacao: 'Solicitada reanálise',
      extraData: {
        reanalises: (request.reanalises || 0) + 1,
        reanalysisRequested: true,
        reanalysisRequestedAt: now(),
        reanalise: {
          motivo,
          usuarioId: getUserId(user),
          usuarioNome: getUserName(user),
          data: now(),
        },
      },
    })

  /* =========================================================
   * 🚨 REFORÇO (CORRIGIDO)
   * ======================================================= */

  const reinforceRequest = async ({ request, user }) =>
    changeStatus({
      request,
      newStatus: REQUEST_STATUS.WAITING,
      user,
      observacao: 'Solicitação marcada como URGENTE',
      extraData: {
        reforco: true,
        reforcoAt: now(),
        reforcadoPor: getUserId(user),
        reforcadoPorNome: getUserName(user),
      },
    })

  /* =========================================================
   * 🏁 FINALIZAR
   * ======================================================= */

  const finishRequest = async ({ request, user }) =>
    changeStatus({
      request,
      newStatus: REQUEST_STATUS.FINISHED,
      user,
      observacao: 'Pedido finalizado',
      extraData: {
        pagamento: {
          ...request.pagamento,
          comprado: true,
          dataCompra: now(),
          usuarioId: getUserId(user),
          usuarioNome: getUserName(user),
        },
      },
    })

  /* =========================================================
   * 📄 DUPLICAR
   * ======================================================= */

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

  /* ========================================================= */

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
    finishRequest,
    duplicateRequest,

    changeStatus,
    generateRequestNumber,
  }
}
