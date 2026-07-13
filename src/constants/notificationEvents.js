/**
 * Eventos de notificações do sistema
 *
 * Cada evento representa uma mudança
 * importante no fluxo da solicitação.
 */

export const NOTIFICATION_EVENTS = {
  REQUEST_CREATED: {
    key: 'REQUEST_CREATED',

    permission: 'requests.menu',

    title: 'Nova solicitação criada',

    message: 'Uma nova solicitação foi criada e aguarda atendimento.',
  },

  REQUEST_BUDGET: {
    key: 'REQUEST_BUDGET',

    permission: 'budget.menu',

    title: 'Solicitação para orçamento',

    message: 'Existe uma solicitação aguardando orçamento.',
  },

  REQUEST_REVISION: {
    key: 'REQUEST_REVISION',

    permission: 'revision.menu',

    title: 'Solicitação para revisão',

    message: 'Existe uma solicitação aguardando revisão.',
  },

  REQUEST_ANALYSIS: {
    key: 'REQUEST_ANALYSIS',

    permission: 'analysis.menu',

    title: 'Solicitação para análise',

    message: 'Existe uma solicitação aguardando análise.',
  },

  REQUEST_PAYMENT: {
    key: 'REQUEST_PAYMENT',

    permission: 'payment.menu',

    title: 'Solicitação para pagamento',

    message: 'Existe uma solicitação aguardando pagamento.',
  },

  REQUEST_TRACKING: {
    key: 'REQUEST_TRACKING',

    permission: 'tracking.menu',

    title: 'Solicitação para rastreio',

    message: 'Existe uma solicitação aguardando acompanhamento de entrega.',
  },

  REQUEST_REANALYSIS: {
    key: 'REQUEST_REANALYSIS',

    permission: 'analysis.menu',

    extraPermission: 'history.reanalyze',

    title: 'Solicitação de reanálise',

    message: 'Uma solicitação foi enviada para reanálise.',
  },

  REQUEST_REINFORCEMENT: {
    key: 'REQUEST_REINFORCEMENT',

    permission: 'analysis.menu',

    extraPermission: 'history.reinforcement',

    title: 'Solicitação urgente de análise',

    message: 'Uma solicitação recebeu reforço de prioridade.',
  },
}

/**
 * Busca evento pelo código
 */
export function getNotificationEvent(event) {
  return Object.values(NOTIFICATION_EVENTS).find((item) => item.key === event)
}
