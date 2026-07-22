<template>
  <q-page class="page-container q-pa-md">
    <!-- LOADING -->
    <div v-if="loading" class="row justify-center q-mt-xl">
      <q-spinner color="primary" size="50px" />
    </div>

    <div v-else-if="request">
      <!-- HEADER -->
      <q-card flat bordered class="q-mb-lg header-card">
        <q-card-section class="row items-center justify-between">
          <div>
            <div class="text-overline text-grey-7">Pagamento da Solicitação</div>

            <div class="text-h5 text-weight-bold">#{{ request.requestNumber }}</div>

            <div class="text-caption text-grey-6">
              Criado em {{ formatDate(request.createdAt) }}
            </div>
          </div>

          <q-chip
            :color="getStatusColor(request.status)"
            text-color="white"
            size="lg"
            class="text-weight-bold"
          >
            {{ request.status }}
          </q-chip>
        </q-card-section>
      </q-card>

      <!-- KPIs -->
      <div class="row q-col-gutter-md q-mb-lg">
        <div v-for="item in summary" :key="item.label" class="col-12 col-sm-6 col-md-3">
          <q-card flat bordered class="summary-card">
            <q-card-section>
              <div class="row items-center q-gutter-sm">
                <q-icon :name="item.icon" size="20px" color="primary" />

                <div class="text-caption text-grey-7">
                  {{ item.label }}
                </div>
              </div>

              <div class="text-subtitle1 text-weight-bold q-mt-xs">
                {{ item.value }}
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- PRODUTO -->
      <q-card flat bordered class="q-mb-md section-card">
        <q-card-section>
          <div class="section-title">Produto</div>

          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-input dense filled readonly label="Título" :model-value="request.produto.titulo" />
            </div>

            <div class="col-12 col-md-6">
              <q-input
                dense
                filled
                readonly
                label="Categoria"
                :model-value="request.produto.categoria"
              />
            </div>

            <div class="col-12 col-md-4">
              <q-input
                dense
                filled
                readonly
                label="Quantidade"
                :model-value="request.produto.quantidade"
              />
            </div>

            <div class="col-12 col-md-8">
              <q-input
                dense
                filled
                readonly
                label="Fornecedor"
                :model-value="request.produto.fornecedor || '-'"
              />
            </div>

            <div class="col-12">
              <q-input
                dense
                filled
                readonly
                autogrow
                type="textarea"
                label="Descrição"
                :model-value="request.produto.descricao"
              />
            </div>

            <!-- PREVIEW -->
            <div class="col-12">
              <div
                v-if="linkPreview"
                class="link-preview q-mb-sm"
                @click="openProduct(linkPreview.url)"
              >
                <img v-if="linkPreview.image" :src="linkPreview.image" class="preview-image" />

                <div v-else class="preview-image placeholder">
                  <q-icon name="image" size="28px" color="grey-5" />
                </div>

                <div class="preview-content">
                  <div class="preview-title">
                    {{ linkPreview.title || 'Produto' }}
                  </div>

                  <div class="preview-domain">
                    {{ linkPreview.domain }}
                  </div>
                </div>
              </div>

              <q-input
                dense
                filled
                readonly
                label="Produto URL"
                :model-value="request.produto.produtoUrl"
              >
                <template #append>
                  <q-icon
                    v-if="request.produto.produtoUrl"
                    name="open_in_new"
                    class="cursor-pointer"
                    @click="openProduct(request.produto.produtoUrl)"
                  />
                </template>
              </q-input>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- SOLICITANTE -->
      <q-card flat bordered class="q-mb-md section-card">
        <q-card-section>
          <div class="section-title">Solicitante</div>

          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-4">
              <q-input dense filled readonly label="Nome" :model-value="request.solicitante.nome" />
            </div>

            <div class="col-12 col-md-4">
              <q-input
                dense
                filled
                readonly
                label="Email"
                :model-value="request.solicitante.email"
              />
            </div>

            <div class="col-12 col-md-4">
              <q-input
                dense
                filled
                readonly
                label="Setor"
                :model-value="request.solicitante.setorNome"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- FINANCEIRO -->
      <q-card flat bordered class="q-mb-md section-card">
        <q-card-section>
          <div class="section-title">Financeiro</div>

          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-4">
              <q-input
                dense
                filled
                readonly
                label="Valor Unitário"
                :model-value="formatCurrency(request.financeiro.valorUnitario)"
              />
            </div>

            <div class="col-12 col-md-4">
              <q-input
                dense
                filled
                readonly
                label="Valor Total"
                :model-value="formatCurrency(request.financeiro.valorTotal)"
              />
            </div>

            <div class="col-12 col-md-4">
              <q-input
                dense
                filled
                readonly
                label="Forma de Pagamento"
                :model-value="request.pagamento.formaPagamento || 'Não informada'"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>
      <!-- JUSTIFICATIVA DA SOLICITAÇÃO -->
      <q-card flat bordered class="q-mb-md section-card">
        <q-card-section>
          <div class="section-title">Justificativa da Solicitação</div>

          <div class="justificativa-box">
            {{ request.solicitacao.justificativa || 'Não informada' }}
          </div>
        </q-card-section>
      </q-card>

      <!-- OBSERVAÇÃO DA REVISÃO -->
      <q-card v-if="request.revisao?.justificativa" flat bordered class="q-mb-md section-card">
        <q-card-section>
          <div class="section-title">Observação da Revisão</div>

          <div class="review-box">
            {{ request.revisao.justificativa }}
          </div>

          <div class="text-caption text-grey-7 q-mt-sm">
            Revisado por
            <strong>{{ request.revisao.usuarioNome }}</strong>

            <span v-if="request.revisao.data"> • {{ formatDate(request.revisao.data) }} </span>
          </div>
        </q-card-section>
      </q-card>

      <!-- JUSTIFICATIVA DA ANÁLISE -->
      <q-card v-if="request.analise?.justificativa" flat bordered class="q-mb-md section-card">
        <q-card-section>
          <div class="section-title text-orange">Justificativa da Análise</div>

          <div class="analysis-box">
            {{ request.analise.justificativa }}
          </div>

          <div class="text-caption text-grey-7 q-mt-sm">
            Analisado por
            <strong>{{ request.analise.usuarioNome }}</strong>

            <span v-if="request.analise.data"> • {{ formatDate(request.analise.data) }} </span>
          </div>
        </q-card-section>
      </q-card>

      <!-- PAGAMENTO -->
      <q-card flat bordered class="q-mb-md section-card">
        <q-card-section>
          <div class="section-title">Pagamento</div>

          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-input
                v-model.number="saldoPagamento"
                dense
                filled
                type="number"
                label="Valor Pago *"
                prefix="R$"
              />
            </div>

            <div class="col-12 col-md-6">
              <q-select
                v-model="formaPagamento"
                dense
                filled
                emit-value
                map-options
                label="Forma de Pagamento *"
                :options="paymentOptions"
              />
            </div>

            <q-input
              class="col-12 col-md-12"
              v-model="detalhePagamento"
              dense
              filled
              label="Detalhes do pagamento"
            />
          </div>
        </q-card-section> </q-card
      >,

      <!-- OBSERVAÇÃO DO FINANCEIRO -->
      <q-card flat bordered class="q-mb-md section-card">
        <q-card-section>
          <div class="section-title">Observação do Financeiro</div>

          <q-input
            v-model="observacao"
            outlined
            autogrow
            type="textarea"
            label="Observação *"
            :error="observacaoError"
            error-message="Campo obrigatório"
          />
        </q-card-section>
      </q-card>

      <!-- BOTÕES -->
      <div class="row justify-end q-gutter-sm q-mt-lg">
        <q-btn outline color="grey-8" icon="arrow_back" label="Voltar" @click="goBack" />

        <q-btn
          color="primary"
          icon="payments"
          label="Finalizar Pagamento"
          @click="handleFinishPayment"
        />
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import useRequests from 'src/composables/UseRequests'
import useAuthUser from 'src/composables/UseAuthUser'
import useSystemLog from 'src/composables/UseSystemLog'
import UseNotifications from 'src/composables/UseNotifications'

import { REQUEST_STATUS } from 'src/constants/requestStatus'

const route = useRoute()
const router = useRouter()

const { realizedRequest, getRequestById } = useRequests()
const { addLog } = useSystemLog()
const notifications = UseNotifications()
const { profile } = useAuthUser()

/* ======================================================
 * STATE
====================================================== */

const loading = ref(true)
const request = ref(null)

const saldoPagamento = ref(0)
const formaPagamento = ref('')
const detalhePagamento = ref('')

const observacao = ref('')
const observacaoError = ref(false)

const linkPreview = ref(null)

/* ======================================================
 * LOAD
====================================================== */

onMounted(async () => {
  loading.value = true

  try {
    const data = await getRequestById(route.params.id)

    request.value = data

    saldoPagamento.value = data?.financeiro?.valorComprado || 0

    formaPagamento.value = data?.pagamento?.formaPagamento || ''

    observacao.value = data?.pagamento?.justificativa || ''

    const produtoUrl = data?.produto?.produtoUrl

    if (produtoUrl) {
      await fetchPreview(produtoUrl)
    }
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
})

/* ======================================================
 * KPIs
====================================================== */

const summary = computed(() => [
  {
    label: 'Criado em',
    value: formatDate(request.value?.createdAt),
    icon: 'event',
  },
  {
    label: 'Atualizado em',
    value: formatDate(request.value?.updatedAt),
    icon: 'update',
  },
  {
    label: 'Valor Total',
    value: formatCurrency(request.value?.financeiro?.valorTotal),
    icon: 'payments',
  },
  {
    label: 'Quantidade',
    value: request.value?.produto?.quantidade || 0,
    icon: 'inventory_2',
  },
])

/* ======================================================
 * PREVIEW PRODUTO
====================================================== */

const fetchPreview = async (url) => {
  try {
    const safeUrl = url.startsWith('http') ? url : `https://${url}`

    const res = await fetch(`https://jsonlink.io/api/extract?url=${encodeURIComponent(safeUrl)}`)

    const data = await res.json()

    linkPreview.value = {
      title: data.title || '',
      image: data.images?.[0] || '',
      domain: new URL(safeUrl).hostname,
      url: safeUrl,
    }
  } catch (err) {
    console.error(err)
    linkPreview.value = null
  }
}

/* ======================================================
 * OPÇÕES DE PAGAMENTO
====================================================== */
const paymentOptions = [
  {
    label: 'Pix',
    value: 'Pix',
  },
  {
    label: 'Boleto Bancário',
    value: 'Boleto Bancário',
  },
  {
    label: 'Cartão de Crédito',
    value: 'Cartão de Crédito',
  },
  {
    label: 'Cartão de Débito',
    value: 'Cartão de Débito',
  },
  {
    label: 'Transferência Bancária',
    value: 'Transferência Bancária',
  },
  {
    label: 'TED',
    value: 'TED',
  },
  {
    label: 'DOC',
    value: 'DOC',
  },
  {
    label: 'Dinheiro',
    value: 'Dinheiro',
  },
  {
    label: 'Cheque',
    value: 'Cheque',
  },
  {
    label: 'Faturado',
    value: 'Faturado',
  },
  {
    label: 'Outro',
    value: 'Outro',
  },
]

/* ======================================================
 * HELPERS
====================================================== */

const analyst = computed(() => ({
  id: profile.value?.userId || profile.value?.id || '',
  nome: profile.value?.nome || profile.value?.displayName || '',
  email: profile.value?.email || '',
}))

const validate = () => {
  observacaoError.value = !observacao.value.trim()
  return !observacaoError.value
}

const goBack = () => {
  router.push('/app/buy/payment')
}

const openProduct = (url) => {
  if (!url) return

  const safeUrl = url.startsWith('http') ? url : `https://${url}`

  window.open(safeUrl, '_blank')
}

/* ======================================================
 * FORMATADORES
====================================================== */

const formatCurrency = (value) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(value || 0))

const formatDate = (value) => {
  if (!value) return '-'

  try {
    const date = typeof value?.toDate === 'function' ? value.toDate() : new Date(value)

    return isNaN(date.getTime()) ? '-' : date.toLocaleString('pt-BR')
  } catch {
    return '-'
  }
}

const getStatusColor = (status) => {
  switch (status) {
    case REQUEST_STATUS.APPROVED:
      return 'positive'

    case REQUEST_STATUS.REJECTED:
      return 'negative'

    case REQUEST_STATUS.WAITING:
      return 'orange'

    case REQUEST_STATUS.PENDING_PAYMENT:
      return 'primary'

    case REQUEST_STATUS.FINISHED:
      return 'positive'

    default:
      return 'grey'
  }
}
/* ======================================================
 * FINALIZAR PAGAMENTO
====================================================== */

const handleFinishPayment = async () => {
  if (!validate()) return

  try {
    const before = structuredClone(request.value)

    const payload = {
      financeiro: {
        ...request.value.financeiro,

        valorComprado: Number(saldoPagamento.value),
      },

      pagamento: {
        ...request.value.pagamento,

        formaPagamento: formaPagamento.value,

        detalhePagamento: detalhePagamento.value,

        justificativa: observacao.value,

        usuarioId: analyst.value.id,
        usuarioNome: analyst.value.nome,
        usuarioEmail: analyst.value.email,

        data: new Date(),
      },
    }

    await realizedRequest({
      request: request.value,
      user: profile.value,
      observacao: observacao.value,
      extraData: payload,
    })

    const after = structuredClone(before)

    Object.assign(after, payload)

    after.status = REQUEST_STATUS.REALIZED

    after.id = request.value.id
    after.requestNumber = request.value.requestNumber

    await addLog({
      module: 'Solicitações',
      action: 'PAYMENT',
      description: `Finalizou o pagamento da solicitação ${request.value.requestNumber}`,
      documentId: request.value.id,
      before,
      after,
    })

    await notifications.sendEvent({
      event: 'REQUEST_TRACKING',

      request: after,

      actor: profile.value,
    })

    await notifications.sendEvent({
      event: 'REQUEST_REALIZED',

      request: after,

      actor: profile.value,
    })

    router.push('/app/buy/payment')
  } catch (err) {
    console.error(err)
  }
}
</script>

<style scoped>
.page-container {
  max-width: 1200px;
  margin: 0 auto;
}

/* ======================================================
   HEADER
====================================================== */

.header-card {
  border-radius: 16px;
  background: #fafafa;
}

/* ======================================================
   KPI
====================================================== */

.summary-card {
  border-radius: 14px;
  transition: all 0.2s ease;
}

.summary-card:hover {
  transform: translateY(-2px);
}

/* ======================================================
   CARDS
====================================================== */

.section-card {
  border-radius: 14px;
}

.section-title {
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 16px;
}

/* ======================================================
   LINK PREVIEW
====================================================== */

.link-preview {
  display: flex;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: 0.2s;
  max-width: 560px;
}

.link-preview:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.preview-image {
  width: 120px;
  height: 120px;
  object-fit: cover;
}

.preview-image.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
}

.preview-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 14px;
}

.preview-title {
  font-size: 15px;
  font-weight: 600;
}

.preview-domain {
  margin-top: 6px;
  font-size: 12px;
  color: #757575;
}

/* ======================================================
   BLOCOS
====================================================== */

.justificativa-box,
.review-box,
.analysis-box {
  padding: 18px;
  border-radius: 10px;
  white-space: pre-wrap;
  line-height: 1.7;
  font-size: 14px;
}

.justificativa-box {
  background: #f3f4f6;
}

.review-box {
  background: #e3f2fd;
  border-left: 5px solid #1976d2;
}

.analysis-box {
  background: #fff8e1;
  border-left: 5px solid #ff9800;
}

/* ======================================================
   INPUTS
====================================================== */

:deep(.q-field--filled .q-field__control) {
  border-radius: 10px;
}

:deep(.q-field--outlined .q-field__control) {
  border-radius: 10px;
}

/* ======================================================
   BOTÕES
====================================================== */

.row.justify-end .q-btn {
  min-width: 180px;
}

/* ======================================================
   RESPONSIVO
====================================================== */

@media (max-width: 1024px) {
  .page-container {
    padding: 18px;
  }
}

@media (max-width: 768px) {
  .page-container {
    padding: 12px;
  }

  .section-title {
    font-size: 13px;
  }

  .preview-image {
    width: 90px;
    height: 90px;
  }

  .preview-title {
    font-size: 14px;
  }

  .row.justify-end {
    flex-direction: column;
  }

  .row.justify-end .q-btn {
    width: 100%;
    min-width: auto;
  }
}

@media (max-width: 480px) {
  .header-card .text-h5 {
    font-size: 22px;
  }

  .summary-card {
    text-align: center;
  }

  .preview-image {
    width: 72px;
    height: 72px;
  }

  .preview-content {
    padding: 10px;
  }

  .preview-title {
    font-size: 13px;
  }

  .justificativa-box,
  .review-box,
  .analysis-box {
    padding: 14px;
    font-size: 13px;
  }
}
</style>
