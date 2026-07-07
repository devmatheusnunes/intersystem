export function createRequestModel() {
  return {
    /* =========================================================
     * IDENTIFICAÇÃO
     * ======================================================= */
    requestNumber: '',
    status: '',

    /* =========================================================
     * PRODUTO
     * ======================================================= */

    produto: {
      titulo: '',
      categoria: '',
      descricao: '',
      fornecedor: '',
      produtoUrl: '',
      quantidade: 1,
    },

    /* =========================================================
     * SOLICITANTE
     * ======================================================= */

    solicitante: {
      id: '',
      nome: '',
      email: '',
      setorId: '',
      setorNome: '',
    },

    /* =========================================================
     * FINANCEIRO
     * ======================================================= */

    financeiro: {
      valorUnitario: 0,
      valorTotal: 0,
      valorComprado: 0,
    },

    /* =========================================================
     * SOLICITAÇÃO
     * ======================================================= */

    solicitacao: {
      justificativa: '',

      createdAt: null,
      updatedAt: null,

      usuarioId: '',
      usuarioNome: '',
    },

    /* =========================================================
     * ORÇAMENTO
     * ======================================================= */

    orcamento: {
      data: null,

      usuarioId: '',
      usuarioNome: '',
    },

    /* =========================================================
     * REVISÃO
     * ======================================================= */

    revisao: {
      justificativa: '',

      data: null,

      usuarioId: '',
      usuarioNome: '',
    },

    /* =========================================================
     * ANÁLISE
     * ======================================================= */

    analise: {
      justificativa: '',

      decisao: '',

      data: null,

      usuarioId: '',
      usuarioNome: '',
    },

    /* =========================================================
     * PAGAMENTO
     * ======================================================= */

    pagamento: {
      justificativa: '',

      formaPagamento: '',
      detalhePagemento: '',

      data: null,

      usuarioId: '',
      usuarioNome: '',
    },

    /* =========================================================
     * ENTREGA
     * ======================================================= */

    entrega: {
      data: null,

      usuarioId: '',
      usuarioNome: '',
    },

    /* =========================================================
     * FINALIZAÇÃO
     * ======================================================= */

    finalizacao: {
      data: null,

      usuarioId: '',
      usuarioNome: '',
    },

    /* =========================================================
     * REANÁLISES
     * ======================================================= */

    reanalises: [],

    /*
      {
        data,
        justificativa,
        usuarioId,
        usuarioNome
      }
    */

    /* =========================================================
     * REFORÇOS
     * ======================================================= */

    reforcos: [],

    /*
      {
        data,
        justificativa,
        usuarioId,
        usuarioNome
      }
    */

    /* =========================================================
     * HISTÓRICO
     * ======================================================= */

    historico: [],

    /*
      {
        action,
        status,
        observacao,

        usuarioId,
        usuarioNome,
        userEmail,

        createdAt
      }
    */
  }
}
