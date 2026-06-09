const routes = [
  {
    path: '/',
    component: () => import('layouts/AuthLayout.vue'),
    children: [
      {
        path: '',
        name: 'login',
        component: () => import('pages/auth/LoginPage.vue'),
      },
    ],
  },

  {
    path: '/app',
    component: () => import('layouts/MainLayout.vue'),
    meta: {
      requiresAuth: true,
    },
    children: [
      {
        path: '',
        name: 'dashboard',
        component: () => import('pages/IndexPage.vue'),
        meta: {
          permission: 'dashboard.view',
        },
      },


      // =========================
      // ANÁLISE
      // =========================

      {
        path: 'buy/analysis',
        name: 'buy-analysis',
        component: () => import('pages/buy/AnalysisPage.vue'),
        meta: {
          permission: 'analysis.view',
        },
      },

      // =========================
      // ORÇAMENTOS
      // =========================

      {
        path: 'buy/budget',
        name: 'buy-budget',
        component: () => import('pages/buy/BudgetPage.vue'),
        meta: {
          permission: 'budget.view',
        },
      },

      // =========================
      // HISTÓRICO
      // =========================

      {
        path: 'buy/history',
        name: 'buy-history',
        component: () => import('pages/buy/HistoryPage.vue'),
        meta: {
          permission: 'requests.view',
        },
      },

      // =========================
      // SOLICITAÇÕES
      // =========================

      {
        path: 'buy/requests',
        name: 'buy-requests',
        component: () => import('pages/buy/RequestsPage.vue'),
        meta: {
          permission: 'requests.view',
        },
      },

      {
        path: 'buy/new-request',
        name: 'buy-new-request',
        component: () => import('pages/buy/NewRequestPage.vue'),
        meta: {
          permission: 'requests.create',
        },
      },

      {
        path: 'buy/edit-request/:id?',
        name: 'buy-edit-request',
        component: () => import('pages/buy/NewRequestPage.vue'),
        meta: {
          permission: 'requests.edit',
        },
      },

      // =========================
      // PAGAMENTOS
      // =========================

      {
        path: 'buy/payment',
        name: 'buy-payment',
        component: () => import('pages/buy/PaymentPage.vue'),
        meta: {
          permission: 'budget.finish',
        },
      },

      // =========================
      // SETORES
      // =========================

      {
        path: 'settings/departments',
        name: 'settings-departments',
        component: () => import('pages/settings/DepartmentsPage.vue'),
        meta: {
          permission: 'departments.view',
        },
      },

      // =========================
      // LOGS
      // =========================

      {
        path: 'settings/logs',
        name: 'settings-logs',
        component: () => import('pages/settings/LogsPage.vue'),
        meta: {
          permission: 'logs.view',
        },
      },

      // =========================
      // TIPOS DE USUÁRIO
      // =========================

      {
        path: 'settings/roles',
        name: 'settings-roles',
        component: () => import('pages/settings/RolesPage.vue'),
        meta: {
          permission: 'roles.view',
        },
      },

      {
        path: 'settings/new-role',
        name: 'settings-new-role',
        component: () => import('pages/settings/RegisterRolesPage.vue'),
        meta: {
          permission: 'roles.create',
        },
      },

      {
        path: 'settings/edit-role/:id?',
        name: 'settings-edit-role',
        component: () => import('pages/settings/RegisterRolesPage.vue'),
        meta: {
          permission: 'roles.edit',
        },
      },

      // =========================
      // USUÁRIOS
      // =========================

      {
        path: 'settings/users',
        name: 'settings-users',
        component: () => import('pages/settings/UsersPage.vue'),
        meta: {
          permission: 'users.view',
        },
      },

      {
        path: 'settings/new-perfil',
        name: 'settings-new-perfil',
        component: () => import('pages/settings/PerfilPage.vue'),
        meta: {
          permission: 'users.create',
        },
      },

      {
        path: 'settings/edit-perfil/:id?',
        name: 'settings-edit-perfil',
        component: () => import('pages/settings/PerfilPage.vue'),
        meta: {
          permission: 'users.edit',
        },
      },
    ],


  },

  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
