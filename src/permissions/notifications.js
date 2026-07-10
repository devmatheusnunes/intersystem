/* ==========================================================================
 * PERMISSÕES DE NOTIFICAÇÕES
 *
 * Este arquivo define todas as notificações disponíveis no sistema.
 *
 * É utilizado por:
 * - RegisterRolesPage.vue
 * - UsePermissions.js
 * - UseNotifications.js
 *
 * Cada notificação possui:
 *  • id          -> permissão salva na Role
 *  • event       -> evento utilizado pelo sistema
 *  • module      -> módulo do ERP
 *  • label       -> exibido na tela de cadastro de Roles
 *  • description -> ajuda ao administrador
 *  • icon        -> ícone padrão
 *  • color       -> cor padrão da notificação
 * ========================================================================== */

export const NOTIFICATION_PERMISSIONS = {
  REQUESTS_UPDATES: 'requests_updates',

  BUDGET_AVAILABLE: 'budget_available',

  REVISION_AVAILABLE: 'revision_available',

  ANALYSIS_AVAILABLE: 'analysis_available',

  PAYMENT_AVAILABLE: 'payment_available',

  TRACKING_AVAILABLE: 'tracking_available',

  FINISH_AVAILABLE: 'finish_available',

  REANALYSIS_REQUESTED: 'reanalysis_requested',

  REINFORCEMENT_REQUESTED: 'reinforcement_requested',
}

export const NOTIFICATION_EVENTS = {
  REQUEST_UPDATED: 'request.updated',

  BUDGET_AVAILABLE: 'budget.available',

  REVISION_AVAILABLE: 'revision.available',

  ANALYSIS_AVAILABLE: 'analysis.available',

  PAYMENT_AVAILABLE: 'payment.available',

  TRACKING_AVAILABLE: 'tracking.available',

  FINISH_AVAILABLE: 'finish.available',

  REANALYSIS_REQUESTED: 'request.reanalysis',

  REINFORCEMENT_REQUESTED: 'request.reinforcement',
}

const notifications = [
  /* ======================================================
   * SOLICITAÇÕES
   * ====================================================== */
  {
    id: NOTIFICATION_PERMISSIONS.REQUESTS_UPDATES,
    event: NOTIFICATION_EVENTS.REQUEST_UPDATED,

    module: 'Solicitações',

    label: 'Atualização das minhas solicitações',

    description: 'Receber notificações quando uma solicitação criada pelo usuário mudar de status.',

    icon: 'notifications_active',
    color: 'primary',
  },

  /* ======================================================
   * ORÇAMENTO
   * ====================================================== */
  {
    id: NOTIFICATION_PERMISSIONS.BUDGET_AVAILABLE,
    event: NOTIFICATION_EVENTS.BUDGET_AVAILABLE,

    module: 'Orçamento',

    label: 'Solicitações aguardando orçamento',

    description: 'Receber notificações quando houver solicitações disponíveis para orçamento.',

    icon: 'request_quote',
    color: 'blue',
  },

  /* ======================================================
   * REVISÃO
   * ====================================================== */
  {
    id: NOTIFICATION_PERMISSIONS.REVISION_AVAILABLE,
    event: NOTIFICATION_EVENTS.REVISION_AVAILABLE,

    module: 'Revisão',

    label: 'Solicitações aguardando revisão',

    description: 'Receber notificações quando houver solicitações disponíveis para revisão.',

    icon: 'fact_check',
    color: 'purple',
  },

  /* ======================================================
   * ANÁLISE
   * ====================================================== */
  {
    id: NOTIFICATION_PERMISSIONS.ANALYSIS_AVAILABLE,
    event: NOTIFICATION_EVENTS.ANALYSIS_AVAILABLE,

    module: 'Análise',

    label: 'Solicitações aguardando análise',

    description: 'Receber notificações quando houver solicitações disponíveis para análise.',

    icon: 'assignment',
    color: 'orange',
  },

  /* ======================================================
   * PAGAMENTO
   * ====================================================== */
  {
    id: NOTIFICATION_PERMISSIONS.PAYMENT_AVAILABLE,
    event: NOTIFICATION_EVENTS.PAYMENT_AVAILABLE,

    module: 'Pagamento',

    label: 'Solicitações aguardando pagamento',

    description: 'Receber notificações quando houver solicitações disponíveis para pagamento.',

    icon: 'payments',
    color: 'green',
  },

  /* ======================================================
   * RASTREAMENTO
   * ====================================================== */
  {
    id: NOTIFICATION_PERMISSIONS.TRACKING_AVAILABLE,
    event: NOTIFICATION_EVENTS.TRACKING_AVAILABLE,

    module: 'Rastreamento',

    label: 'Solicitações aguardando rastreamento',

    description: 'Receber notificações quando houver solicitações disponíveis para rastreamento.',

    icon: 'local_shipping',
    color: 'teal',
  },

  /* ======================================================
   * FINALIZAÇÃO
   * ====================================================== */
  {
    id: NOTIFICATION_PERMISSIONS.FINISH_AVAILABLE,
    event: NOTIFICATION_EVENTS.FINISH_AVAILABLE,

    module: 'Finalização',

    label: 'Solicitações aguardando finalização',

    description: 'Receber notificações quando houver solicitações disponíveis para finalização.',

    icon: 'task_alt',
    color: 'positive',
  },

  /* ======================================================
   * REANÁLISE
   * ====================================================== */
  {
    id: NOTIFICATION_PERMISSIONS.REANALYSIS_REQUESTED,
    event: NOTIFICATION_EVENTS.REANALYSIS_REQUESTED,

    module: 'Histórico',

    label: 'Solicitações retornadas para reanálise',

    description: 'Receber notificações quando uma solicitação retornar para reanálise.',

    icon: 'restart_alt',
    color: 'warning',
  },

  /* ======================================================
   * REFORÇO
   * ====================================================== */
  {
    id: NOTIFICATION_PERMISSIONS.REINFORCEMENT_REQUESTED,
    event: NOTIFICATION_EVENTS.REINFORCEMENT_REQUESTED,

    module: 'Histórico',

    label: 'Solicitações com reforço de prioridade',

    description: 'Receber notificações quando uma solicitação receber reforço de prioridade.',

    icon: 'priority_high',
    color: 'negative',
  },
]

export default notifications

/* ==========================================================================
 * HELPERS
 * ========================================================================== */

export const getNotificationById = (id) => notifications.find((item) => item.id === id)

export const getNotificationByEvent = (event) => notifications.find((item) => item.event === event)

export const getNotificationsByModule = (module) =>
  notifications.filter((item) => item.module === module)
