/**
 * Modelo de Notificação do Sistema
 */

export const notificationModel = {
  id: null,

  userId: null,

  type: null,

  title: '',

  message: '',

  // Referência da solicitação
  requestId: null,

  requestNumber: null,

  // Setor relacionado
  sectorId: null,

  // Controle de leitura
  read: false,

  // Canais disponíveis
  channels: {
    system: true,
    whatsapp: false,
    email: false,
  },

  // Informações extras do evento
  metadata: {},

  createdAt: null,

  readAt: null,
}

/**
 * Cria uma nova notificação vazia
 */
export function createNotification(data = {}) {
  return {
    ...notificationModel,

    ...data,

    channels: {
      ...notificationModel.channels,
      ...(data.channels || {}),
    },
  }
}
