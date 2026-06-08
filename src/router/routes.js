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
      },
      {
        path: 'buy/analysis',
        name: 'buy-analysis',
        component: () => import('pages/buy/AnalysisPage.vue'),
      },
      {
        path: 'buy/budget',
        name: 'buy-budget',
        component: () => import('pages/buy/BudgetPage.vue'),
      },
      {
        path: 'buy/history',
        name: 'buy-history',
        component: () => import('pages/buy/HistoryPage.vue'),
      },
      {
        path: 'buy/requests',
        name: 'buy-requests',
        component: () => import('pages/buy/RequestsPage.vue'),
      },
      {
        path: 'buy/new-request',
        name: 'buy-new-request',
        component: () => import('pages/buy/NewRequestPage.vue'),
      },
      {
        path: 'buy/edit-request/:id?',
        name: 'buy-edit-request',
        component: () => import('pages/buy/NewRequestPage.vue'),
      },
      {
        path: 'buy/payment',
        name: 'buy-payment',
        component: () => import('pages/buy/PaymentPage.vue'),
      },

      {
        path: 'settings/departments',
        name: 'settings-departments',
        component: () => import('pages/settings/DepartmentsPage.vue'),
      },
      {
        path: 'settings/logs',
        name: 'settings-logs',
        component: () => import('pages/settings/LogsPage.vue'),
      },
      {
        path: 'settings/roles',
        name: 'settings-roles',
        component: () => import('pages/settings/RolesPage.vue'),
      },
      {
        path: 'settings/users',
        name: 'settings-users',
        component: () => import('pages/settings/UsersPage.vue'),
      },
      {
        path: 'settings/new-perfil',
        name: 'settings-new-perfil',
        component: () => import('pages/settings/PerfilPage.vue'),
      },
      {
        path: 'settings/edit-perfil/:id?',
        name: 'settings-edit-perfil',
        component: () => import('pages/settings/PerfilPage.vue'),
      },
    ],
  },

  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
