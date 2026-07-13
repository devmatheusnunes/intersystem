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
      return `A solicitação ${request.requestNumber} foi criada.`
    },
  },

  REQUEST_BUDGET: {
    key: 'REQUEST_BUDGET',

    permissions: ['budget.menu'],

    priority: 'normal',

    channels: ['system'],

    title: 'Solicitação para orçamento',

    buildMessage(request) {
      return `A solicitação ${request.requestNumber} aguarda orçamento.`
    },
  },

  REQUEST_REVISION: {
    key: 'REQUEST_REVISION',

    permissions: ['revision.menu'],

    priority: 'normal',

    channels: ['system'],

    title: 'Solicitação para revisão',

    buildMessage(request) {
      return `A solicitação ${request.requestNumber} aguarda revisão.`
    },
  },

  REQUEST_ANALYSIS: {
    key: 'REQUEST_ANALYSIS',

    permissions: ['analysis.menu'],

    priority: 'normal',

    channels: ['system'],

    title: 'Solicitação para análise',

    buildMessage(request) {
      return `A solicitação ${request.requestNumber} aguarda análise.`
    },
  },

  REQUEST_PAYMENT: {
    key: 'REQUEST_PAYMENT',

    permissions: ['payment.menu'],

    priority: 'normal',

    channels: ['system'],

    title: 'Solicitação para pagamento',

    buildMessage(request) {
      return `A solicitação ${request.requestNumber} aguarda pagamento.`
    },
  },

  REQUEST_TRACKING: {
    key: 'REQUEST_TRACKING',

    permissions: ['tracking.menu'],

    priority: 'normal',

    channels: ['system'],

    title: 'Solicitação para rastreio',

    buildMessage(request) {
      return `A solicitação ${request.requestNumber} está em acompanhamento de entrega.`
    },
  },

  REQUEST_REANALYSIS: {
    key: 'REQUEST_REANALYSIS',

    permissions: ['analysis.menu', 'history.reanalyze'],

    priority: 'high',

    channels: ['system'],

    title: 'Solicitação de reanálise',

    buildMessage(request) {
      return `A solicitação ${request.requestNumber} foi enviada para reanálise.`
    },
  },

  REQUEST_REINFORCEMENT: {
    key: 'REQUEST_REINFORCEMENT',

    permissions: ['analysis.menu', 'history.reinforcement'],

    priority: 'urgent',

    channels: ['system'],

    title: 'Solicitação urgente de análise',

    buildMessage(request) {
      return `A solicitação ${request.requestNumber} recebeu prioridade de análise.`
    },
  },
}

/**
 * Retorna um evento de notificação.
 */
export function getNotificationEvent(event) {
  return NOTIFICATION_EVENTS[event] || null
}
