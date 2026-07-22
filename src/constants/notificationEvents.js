/**
 * Eventos de notificações do sistema
 *
 * Centraliza todas as notificações possíveis do ERP.
 * Cada evento informa:
 * - permissões necessárias
 * - prioridade
 * - canais suportados
 * - título
 * - mensagem dinâmica
 */

export const NOTIFICATION_EVENTS = {
  REQUEST_CREATED: {
    key: 'REQUEST_CREATED',

    permissions: ['requests.menu'],

    priority: 'normal',

    channels: ['system'],

    title: 'Nova solicitação criada',

    buildMessage(request) {
      return `A solicitação ${request.requestNumber} (${request.produto?.titulo}) foi criada.`
    },
  },

  REQUEST_BUDGET: {
    key: 'REQUEST_BUDGET',

    permissions: ['budget.menu'],

    priority: 'normal',

    channels: ['system'],

    title: 'Solicitação para orçamento',

    buildMessage(request) {
      return `A solicitação ${request.requestNumber} (${request.produto?.titulo}) aguarda orçamento.`
    },
  },

  REQUEST_REVISION: {
    key: 'REQUEST_REVISION',

    permissions: ['revision.menu'],

    priority: 'normal',

    channels: ['system'],

    title: 'Solicitação para revisão',

    buildMessage(request) {
      return `A solicitação ${request.requestNumber} (${request.produto?.titulo}) aguarda revisão.`
    },
  },

  REQUEST_ANALYSIS: {
    key: 'REQUEST_ANALYSIS',

    permissions: ['analysis.menu'],

    priority: 'normal',

    channels: ['system'],

    title: 'Solicitação para análise',

    buildMessage(request) {
      return `A solicitação ${request.requestNumber} (${request.produto?.titulo}) aguarda análise.`
    },
  },

  REQUEST_PAYMENT: {
    key: 'REQUEST_PAYMENT',

    permissions: ['payment.menu'],

    priority: 'normal',

    channels: ['system'],

    title: 'Solicitação para pagamento',

    buildMessage(request) {
      return `A solicitação ${request.requestNumber} (${request.produto?.titulo}) aguarda pagamento.`
    },
  },

  REQUEST_TRACKING: {
    key: 'REQUEST_TRACKING',

    permissions: ['tracking.menu'],

    priority: 'normal',

    channels: ['system'],

    title: 'Solicitação para rastreio',

    buildMessage(request) {
      return `A solicitação ${request.requestNumber} (${request.produto?.titulo}) está em acompanhamento de entrega.`
    },
  },

  REQUEST_REANALYSIS: {
    key: 'REQUEST_REANALYSIS',

    permissions: ['analysis.menu', 'history.reanalyze'],

    priority: 'high',

    channels: ['system'],

    title: 'Solicitação de reanálise',

    buildMessage(request) {
      return `A solicitação ${request.requestNumber} (${request.produto?.titulo}) foi enviada para reanálise.`
    },
  },

  REQUEST_REINFORCEMENT: {
    key: 'REQUEST_REINFORCEMENT',

    permissions: ['analysis.menu', 'history.reinforcement'],

    priority: 'urgent',

    channels: ['system'],

    title: 'Solicitação urgente de análise',

    buildMessage(request) {
      return `A solicitação ${request.requestNumber} (${request.produto?.titulo}) recebeu prioridade de análise.`
    },
  },

  /**
   * =====================================================
   * EVENTOS DE ACOMPANHAMENTO
   *
   * Notificam exclusivamente o solicitante sobre a
   * evolução da sua solicitação.
   * Não utilizam permissions nem notificationResolver.
   * =====================================================
   */

  REQUEST_BUDGETED: {
    key: 'REQUEST_BUDGETED',

    notifyRequester: true,

    priority: 'normal',

    channels: ['system'],

    title: 'Solicitação orçada',

    buildMessage(request) {
      return `Sua solicitação ${request.requestNumber} (${request.produto?.titulo}) foi orçada e enviada para revisão.`
    },
  },

  REQUEST_REVIEWED: {
    key: 'REQUEST_REVIEWED',

    notifyRequester: true,

    priority: 'normal',

    channels: ['system'],

    title: 'Solicitação revisada',

    buildMessage(request) {
      return `Sua solicitação ${request.requestNumber} (${request.produto?.titulo}) foi revisada e enviada para análise.`
    },
  },

  REQUEST_APPROVED: {
    key: 'REQUEST_APPROVED',

    notifyRequester: true,

    priority: 'normal',

    channels: ['system'],

    title: 'Solicitação aprovada',

    buildMessage(request) {
      return `Sua solicitação ${request.requestNumber} (${request.produto?.titulo}) foi aprovada.`
    },
  },

  REQUEST_REJECTED: {
    key: 'REQUEST_REJECTED',

    notifyRequester: true,

    priority: 'high',

    channels: ['system'],

    title: 'Solicitação indeferida',

    buildMessage(request) {
      return `Sua solicitação ${request.requestNumber} (${request.produto?.titulo}) foi indeferida.`
    },
  },

  REQUEST_WAITING: {
    key: 'REQUEST_WAITING',

    notifyRequester: true,

    priority: 'normal',

    channels: ['system'],

    title: 'Solicitação em espera',

    buildMessage(request) {
      return `Sua solicitação ${request.requestNumber} (${request.produto?.titulo}) foi colocada em espera.`
    },
  },

  REQUEST_REALIZED: {
    key: 'REQUEST_REALIZED',

    notifyRequester: true,

    priority: 'normal',

    channels: ['system'],

    title: 'Pedido realizado',

    buildMessage(request) {
      return `O pedido da solicitação ${request.requestNumber} (${request.produto?.titulo}) foi realizado.`
    },
  },

  REQUEST_DELIVERED: {
    key: 'REQUEST_DELIVERED',

    notifyRequester: true,

    priority: 'normal',

    channels: ['system'],

    title: 'Pedido entregue',

    buildMessage(request) {
      return `O pedido da solicitação ${request.requestNumber} (${request.produto?.titulo}) foi entregue.`
    },
  },

  REQUEST_FINISHED: {
    key: 'REQUEST_FINISHED',

    notifyRequester: true,

    priority: 'normal',

    channels: ['system'],

    title: 'Solicitação finalizada',

    buildMessage(request) {
      return `Sua solicitação ${request.requestNumber} (${request.produto?.titulo}) foi finalizada.`
    },
  },
}

/**
 * Retorna um evento de notificação.
 */
export function getNotificationEvent(event) {
  return NOTIFICATION_EVENTS[event] || null
}
