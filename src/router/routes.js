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

      // =====================
      // COMPRAS
      // =====================

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

      {
        path: 'buy/details/:id?',
        name: 'buy-details',
        component: () => import('pages/buy/DetailsPage.vue'),
        meta: {
          permission: 'requests.view',
        },
      },

      {
        path: 'buy/history',
        name: 'buy-history',
        component: () => import('pages/buy/HistoryPage.vue'),
        meta: {
          permission: 'requests.view',
        },
      },

      {
        path: 'buy/budget',
        name: 'buy-budget',
        component: () => import('pages/buy/BudgetPage.vue'),
        meta: {
          permission: 'budget.view',
        },
      },

      {
        path: 'buy/budgetdetail/:id',
        name: 'buy-budgetdetail',
        component: () => import('pages/buy/BudgetReviewPage.vue'),
        meta: {
          permission: 'budget.view',
        },
      },

      {
        path: 'buy/revision',
        name: 'buy-revision',
        component: () => import('pages/buy/RevisionPage.vue'),
        meta: {
          permission: 'revision.view',
        },
      },

      {
        path: 'buy/revisiondetail/:id',
        name: 'buy-revisiondetail',
        component: () => import('pages/buy/BudgetReviewPage.vue'),
        meta: {
          permission: 'revision.view',
        },
      },

      {
        path: 'buy/analysis',
        name: 'buy-analysis',
        component: () => import('pages/buy/AnalysisPage.vue'),
        meta: {
          permission: 'analysis.view',
        },
      },

      {
        path: 'buy/analysisdetail/:id',
        name: 'buy-analysisdetail',
        component: () => import('pages/buy/AnalysisDetailsPage.vue'),
        meta: {
          permission: 'analysis.view',
        },
      },

      {
        path: 'buy/payment',
        name: 'buy-payment',
        component: () => import('pages/buy/PaymentPage.vue'),
        meta: {
          permission: 'budget.finish',
        },
      },

      {
        path: 'buy/paymentdetail/:id',
        name: 'buy-paymentdetail',
        component: () => import('pages/buy/PaymentDetails.vue'),
        meta: {
          permission: 'budget.finish',
        },
      },

      {
        path: 'buy/preferences',
        name: 'buy-preferences',
        component: () => import('pages/buy/SettingsRequestPage.vue'),
        meta: {
          permission: 'budget.finish',
        },
      },

      // =====================
      // CONFIGURAÇÕES
      // =====================

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

      {
        path: 'profile/:id?',
        name: 'profile',
        component: () => import('pages/settings/PerfilPage.vue'),
        meta: {
          requiresAuth: true,
        },
      },

      {
        path: 'settings/departments',
        name: 'settings-departments',
        component: () => import('pages/settings/DepartmentsPage.vue'),
        meta: {
          permission: 'departments.view',
        },
      },

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

      {
        path: 'settings/logs',
        name: 'settings-logs',
        component: () => import('pages/settings/LogsPage.vue'),
        meta: {
          permission: 'logs.view',
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
