export const SYSTEM_PROFILES = {
  ADMIN: {
    nome: 'Administrador',
    permissions: ['*'],
  },

  REQUESTER: {
    nome: 'Solicitante',
    permissions: ['dashboard.view', 'requests.*'],
  },

  ANALYST: {
    nome: 'Analista',
    permissions: ['dashboard.view', 'requests.view', 'analysis.*'],
  },
}
