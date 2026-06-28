<template>
  <q-page class="page-container q-pa-md">
    <div v-if="loading" class="row justify-center q-mt-xl">
      <q-spinner color="primary" size="50px" />
    </div>

    <div v-else-if="request">
      <!-- HEADER -->
      <q-card flat bordered class="q-mb-lg header-card">
        <q-card-section class="row items-center justify-between">
          <div>
            <div class="text-overline text-grey-7">
              {{ isBudget ? 'Orçamento' : 'Revisão' }}
            </div>

            <div class="text-h5 text-weight-bold">#{{ request.requestNumber }}</div>

            <div class="text-caption text-grey-6">
              Criado em {{ formatDate(request.createdAt) }}
            </div>
          </div>

          <q-chip color="primary" text-color="white" size="lg" class="text-weight-bold">
            {{ request.status }}
          </q-chip>
        </q-card-section>
      </q-card>

      <!-- PRODUTO -->
      <q-card flat bordered class="q-mb-md section-card">
        <q-card-section>
          <div class="section-title">Produto</div>

          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-input dense filled readonly label="Título" :model-value="request.titulo" />
            </div>

            <div class="col-12 col-md-6">
              <q-input dense filled readonly label="Categoria" :model-value="request.categoria" />
            </div>

            <div class="col-12 col-md-4">
              <q-input dense filled readonly label="Quantidade" :model-value="request.quantidade" />
            </div>

            <div class="col-12">
              <q-input
                dense
                filled
                readonly
                type="textarea"
                autogrow
                label="Descrição"
                :model-value="request.descricao"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- JUSTIFICATIVA -->
      <q-card flat bordered class="q-mb-md section-card">
        <q-card-section>
          <div class="section-title">Justificativa</div>

          <div class="justificativa-box">
            {{ request.justificativa || 'Não informada' }}
          </div>
        </q-card-section>
      </q-card>

      <!-- FINANCEIRO -->
      <q-card flat bordered class="q-mb-md section-card">
        <q-card-section>
          <div class="section-title">Orçamento</div>

          <div class="row q-col-gutter-md">
            <div class="col-12">
              <q-input dense filled label="URL do Produto *" v-model="form.produtoUrl" />
            </div>

            <div class="col-12 col-md-6">
              <q-input
                dense
                filled
                type="number"
                label="Valor Unitário *"
                v-model.number="form.valorUnitario"
              />
            </div>

            <div class="col-12 col-md-6">
              <q-input dense filled readonly label="Valor Total" :model-value="formattedTotal" />
            </div>

            <div class="col-12">
              <q-input
                dense
                filled
                type="textarea"
                autogrow
                label="Forma de Pagamento *"
                v-model="form.formaPagamento"
              />
            </div>

            <div v-if="!isBudget" class="col-12">
              <q-input
                dense
                filled
                type="textarea"
                autogrow
                label="Observação"
                v-model="form.observacao"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- ACTIONS -->
      <div class="row justify-end q-gutter-sm">
        <q-btn outline color="negative" label="Cancelar" @click="goBack" />

        <q-btn
          color="primary"
          unelevated
          :label="isBudget ? 'Enviar para Revisão' : 'Salvar Revisão'"
          @click="save"
        />
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import useRequests from 'src/composables/UseRequests'
import useAuthUser from 'src/composables/UseAuthUser'
import useSystemLog from 'src/composables/UseSystemLog'

import { REQUEST_STATUS } from 'src/constants/requestStatus'

const returnRoute = computed(() => {
  return isBudget.value ? '/app/buy/budget' : '/app/buy/revision'
})

// ROUTER
const route = useRoute()
const router = useRouter()

// COMPOSABLES
const { getRequestById, changeStatus } = useRequests()
const { user } = useAuthUser()
const { addLog } = useSystemLog()

// STATE
const loading = ref(true)
const request = ref(null)

// MODE
const mode = computed(() => route.query.mode || 'budget')
const isBudget = computed(() => mode.value === 'budget')

// FORM
const form = ref({
  produtoUrl: '',
  valorUnitario: 0,
  valorTotal: 0,
  formaPagamento: '',
  observacao: '',
})

// =========================
// HELPERS
// =========================

watch(
  () => [form.value.valorUnitario, request.value?.quantidade],
  () => {
    form.value.valorTotal =
      Number(form.value.valorUnitario || 0) * Number(request.value?.quantidade || 0)
  },
  { immediate: true },
)

// =========================
// LOAD
// =========================
onMounted(async () => {
  try {
    const data = await getRequestById(route.params.id)

    if (!data) throw new Error('Solicitação não encontrada')

    request.value = data

    form.value = {
      produtoUrl: data.produtoUrl || '',
      valorUnitario: data.valorUnitario || 0,
      valorTotal: data.valorTotal || 0,
      formaPagamento: data.formaPagamento || '',
      observacao: '',
    }
  } catch (err) {
    console.error(err)
    alert('Erro ao carregar')
  } finally {
    loading.value = false
  }
})

// =========================
// SAVE
// =========================
const save = async () => {
  try {
    if (!form.value.produtoUrl) throw new Error('Informe a URL')
    if (!form.value.valorUnitario) throw new Error('Informe o valor')
    if (!form.value.formaPagamento) throw new Error('Informe pagamento')

    if (!request.value?.id) throw new Error('ID inválido')

    const before = structuredClone(request.value)

    const newStatus = isBudget.value ? REQUEST_STATUS.REVISION : REQUEST_STATUS.PENDING_ANALYSIS

    const payload = {
      produtoUrl: form.value.produtoUrl,
      valorUnitario: Number(form.value.valorUnitario),
      valorTotal: Number(form.value.valorTotal),
      formaPagamento: form.value.formaPagamento,
      status: newStatus,
    }

    const observacao = isBudget.value
      ? 'Orçamento enviado para revisão'
      : form.value.observacao || 'Revisão realizada'

    await changeStatus({
      request: request.value,
      newStatus,
      user: user.value,
      observacao,
      extraData: payload,
    })

    const after = {
      ...before,
      ...payload,
    }

    await addLog({
      module: 'Solicitações',
      action: isBudget.value ? 'BUDGET' : 'REVIEW',
      description: isBudget.value
        ? `Realizou o orçamento da solicitação ${request.value.requestNumber}`
        : `Realizou a revisão da solicitação ${request.value.requestNumber}`,
      documentId: request.value.id,
      before,
      after,
    })

    router.push(returnRoute.value)
  } catch (err) {
    console.error('Erro ao salvar:', err)
    alert(err.message || 'Erro ao salvar')
  }
}

// =========================
// NAV
// =========================
const goBack = () => {
  router.back()
}

// =========================
// FORMAT DATE
// =========================
const formatDate = (value) => {
  if (!value) return '-'

  const date = typeof value?.toDate === 'function' ? value.toDate() : new Date(value)

  return isNaN(date.getTime()) ? '-' : date.toLocaleString('pt-BR')
}

// =========================
// TOTAL FORMATADO
// =========================
const formattedTotal = computed(() => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(form.value.valorTotal || 0))
})
</script>

<style scoped>
.page-container {
  max-width: 1100px;
  margin: 0 auto;
}

.header-card {
  border-radius: 14px;
  background: #f9fafb;
}

.section-card {
  border-radius: 14px;
}

.section-title {
  font-size: 14px;
  font-weight: 700;
  color: #374151;
  margin-bottom: 16px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.justificativa-box {
  background: #f3f4f6;
  padding: 16px;
  border-radius: 10px;
  font-size: 14px;
  color: #374151;
}
</style>
