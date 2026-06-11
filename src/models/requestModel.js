export const createRequestModel = () => ({
  requestNumber: '',

  // Será definido pelo createRequest()
  status: null,

  // Define o fluxo da solicitação
  isEletronico: false,

  prioridadeAnalise: false,

  jaFoiIndeferido: false,

  reanalises: 0,

  solicitanteId: '',

  solicitanteNome: '',

  solicitanteEmail: '',

  setorId: '',

  setorNome: '',

  titulo: '',

  descricao: '',

  categoria: '',

  justificativa: '',

  quantidade: 1,

  produtoUrl: '',

  fornecedor: '',

  valorUnitario: 0,

  valorTotal: 0,

  revisao: {
    observacao: '',
    usuarioId: '',
    usuarioNome: '',
    data: null
  },

  analise: {
    decisao: null,
    observacao: '',
    usuarioId: '',
    usuarioNome: '',
    data: null
  },

  reanalise: {
    motivo: '',
    usuarioId: '',
    usuarioNome: '',
    data: null
  },

  pagamento: {
    comprado: false,
    dataCompra: null,
    usuarioId: '',
    usuarioNome: ''
  },

  comprovantes: [],

  historico: [],

  createdAt: null,

  updatedAt: null
})
