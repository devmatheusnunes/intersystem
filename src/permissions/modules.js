export const SYSTEM_MODULES = [
  {
    title: 'Dashboard',
    permissions: [
      {
        label: 'Exibir Menu',
        value: 'dashboard.menu',
      },
      {
        label: 'Visualizar',
        value: 'dashboard.view',
      },
    ],
  },

  {
    title: 'Solicitações',
    permissions: [
      {
        label: 'Exibir Menu',
        value: 'requests.menu',
      },
      {
        label: 'Visualizar',
        value: 'requests.view',
      },
      {
        label: 'Criar',
        value: 'requests.create',
      },
      {
        label: 'Editar',
        value: 'requests.edit',
      },
      {
        label: 'Excluir',
        value: 'requests.delete',
      },
    ],
  },

  {
    title: 'Análises',
    permissions: [
      {
        label: 'Exibir Menu',
        value: 'analysis.menu',
      },
      {
        label: 'Visualizar',
        value: 'analysis.view',
      },
      {
        label: 'Deferir',
        value: 'analysis.defer',
      },
      {
        label: 'Indeferir',
        value: 'analysis.indefer',
      },
      {
        label: 'Em Espera',
        value: 'analysis.wait',
      },
      {
        label: 'Enviar p/ Orçamento',
        value: 'analysis.send_budget',
      },
    ],
  },

  {
    title: 'Orçamentos',
    permissions: [
      {
        label: 'Exibir Menu',
        value: 'budget.menu',
      },
      {
        label: 'Visualizar',
        value: 'budget.view',
      },
      {
        label: 'Editar',
        value: 'budget.edit',
      },
      {
        label: 'Finalizar',
        value: 'budget.finish',
      },
    ],
  },

  {
    title: 'Usuários',
    permissions: [
      {
        label: 'Exibir Menu',
        value: 'users.menu',
      },
      {
        label: 'Visualizar',
        value: 'users.view',
      },
      {
        label: 'Criar',
        value: 'users.create',
      },
      {
        label: 'Editar',
        value: 'users.edit',
      },
      {
        label: 'Excluir',
        value: 'users.delete',
      },
    ],
  },

  {
    title: 'Setores',
    permissions: [
      {
        label: 'Exibir Menu',
        value: 'departments.menu',
      },
      {
        label: 'Visualizar',
        value: 'departments.view',
      },
      {
        label: 'Criar',
        value: 'departments.create',
      },
      {
        label: 'Editar',
        value: 'departments.edit',
      },
      {
        label: 'Excluir',
        value: 'departments.delete',
      },
    ],
  },

  {
    title: 'Tipos de Usuários',
    permissions: [
      {
        label: 'Exibir Menu',
        value: 'roles.menu',
      },
      {
        label: 'Visualizar',
        value: 'roles.view',
      },
      {
        label: 'Criar',
        value: 'roles.create',
      },
      {
        label: 'Editar',
        value: 'roles.edit',
      },
      {
        label: 'Excluir',
        value: 'roles.delete',
      },
    ],
  },

  {
    title: 'Logs',
    permissions: [
      {
        label: 'Exibir Menu',
        value: 'logs.menu',
      },
      {
        label: 'Visualizar',
        value: 'logs.view',
      },
    ],
  },
]
