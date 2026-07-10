export const createRoleModel = () => ({
  id: null,

  nome: '',
  descricao: '',

  ativo: true,

  userId: '',

  permissions: [],

  /*
   |--------------------------------------------------------------------------
   | Visibilidade de Dados
   |--------------------------------------------------------------------------
   | all
   | own
   | sector
   | selected_sectors
   |--------------------------------------------------------------------------
   */
  visibilityType: 'own',

  visibleSectors: [],

  /*
   |--------------------------------------------------------------------------
   | Permissões de Notificação
   |--------------------------------------------------------------------------
   | Define quais notificações esta Role poderá receber.
   |--------------------------------------------------------------------------
   */
  notificationPermissions: [],

  /*
   |--------------------------------------------------------------------------
   | Configuração das notificações
   |--------------------------------------------------------------------------
   */
  notificationSettings: {
    enabled: true,

    database: true,
    whatsapp: false,
    email: false,
    push: false,
  },

  createdAt: null,
  updatedAt: null,
})
