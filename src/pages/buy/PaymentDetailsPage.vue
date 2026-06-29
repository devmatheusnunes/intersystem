<template>
  <q-page class="page-container q-pa-md">
    <!-- HEADER -->
    <q-card flat bordered class="q-mb-lg header-card">
      <q-card-section class="row items-center justify-between">
        <div>
          <div class="text-overline text-grey-7">Pagamento</div>

          <div class="text-h5 text-weight-bold">#{{ form.requestNumber || '---' }}</div>

          <div class="text-caption text-grey-6">Finalize a compra da solicitação</div>
        </div>

        <q-chip color="positive" text-color="white" size="lg"> Deferido </q-chip>
      </q-card-section>
    </q-card>

    <q-form ref="formRef" @submit="save" greedy>
      <!-- DADOS DO PRODUTO -->
      <q-card flat bordered class="q-mb-md section-card">
        <q-card-section>
          <div class="section-title">Produto</div>

          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-input filled dense v-model="form.titulo" label="Título" readonly />
            </div>

            <div class="col-12 col-md-6">
              <q-input filled dense v-model="form.setorNome" label="Setor" readonly />
            </div>

            <div class="col-12">
              <q-input
                filled
                dense
                v-model="form.descricao"
                type="textarea"
                label="Descrição"
                readonly
              />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- PAGAMENTO -->
      <q-card flat bordered class="q-mb-md section-card">
        <q-card-section>
          <div class="section-title">Pagamento</div>

          <div class="row q-col-gutter-md">
            <!-- VALOR UNITÁRIO (EDITÁVEL) -->
            <div class="col-12 col-md-4">
              <q-input
                dense
                filled
                v-model.number="form.valorUnitario"
                type="number"
                label="Valor Unitário *"
                :rules="[requiredNumber('o valor unitário')]"
              />
            </div>

            <!-- QUANTIDADE -->
            <div class="col-12 col-md-4">
              <q-input dense filled v-model.number="form.quantidade" label="Quantidade" readonly />
            </div>

            <!-- TOTAL -->
            <div class="col-12 col-md-4">
              <q-input
                dense
                filled
                :model-value="formatCurrency(form.valorTotal)"
                label="Valor Total"
                readonly
              />
            </div>

            <!-- FORMA PAGAMENTO -->
            <div class="col-12 col-md-6">
              <q-input
                dense
                filled
                v-model="form.formaPagamento"
                label="Forma de Pagamento *"
                placeholder="Ex: PIX, Cartão, Boleto..."
                :rules="[required('a forma de pagamento')]"
              />
            </div>

            <!-- OBSERVAÇÃO -->
            <div class="col-12">
              <q-input
                dense
                filled
                v-model="form.observacaoPagamento"
                type="textarea"
                autogrow
                label="Observação *"
                :rules="[required('a observação')]"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- ACTIONS -->
      <div class="row justify-end q-gutter-sm">
        <q-btn flat color="grey-7" label="Cancelar" @click="goBack" />
        <q-btn color="primary" unelevated type="submit" label="Finalizar Compra" />
      </div>
    </q-form>
  </q-page>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import useRequests from 'src/composables/UseRequests'
import useNotify from 'src/composables/UseNotify'
import useAuthUser from 'src/composables/UseAuthUser'
import useSystemLog from 'src/composables/UseSystemLog'

import { REQUEST_STATUS } from 'src/constants/requestStatus'

const route = useRoute()
const router = useRouter()

const { notifySuccess, notifyError, notifyWarning } = useNotify()
const { getRequestById, realizedRequest } = useRequests()
const { profile } = useAuthUser()
const { addLog } = useSystemLog()

const formRef = ref(null)

const requestId = computed(() => route.params.id)

const originalRequest = ref(null)

const form = reactive({
  titulo: '',
  descricao: '',
  setorNome: '',
  quantidade: 1,
  valorUnitario: 0,
  valorTotal: 0,
  formaPagamento: '',
  observacaoPagamento: '',
  requestNumber: '',
})

const required = (label) => (val) => (val && val.toString().trim().length > 0) || `Informe ${label}`

const requiredNumber = (label) => (val) =>
  (val !== null && val !== '' && val !== undefined) || `Informe ${label}`

/* TOTAL AUTOMÁTICO */
watch(
  () => [form.valorUnitario, form.quantidade],
  () => {
    form.valorTotal = Number(form.valorUnitario || 0) * Number(form.quantidade || 0)
  },
  { immediate: true },
)

/* LOAD */
const load = async () => {
  try {
    const data = await getRequestById(requestId.value)

    if (!data) {
      notifyError('Solicitação não encontrada')
      return router.push('/app/buy/payment')
    }

    originalRequest.value = structuredClone(data)

    Object.assign(form, {
      ...data,
      valorUnitario: data.valorUnitario || 0,
      valorTotal: data.valorTotal || 0,
    })
  } catch (err) {
    console.error(err)
    notifyError('Erro ao carregar')
  }
}

/* SAVE */
const save = async () => {
  const valid = await formRef.value.validate()

  if (!valid) {
    notifyWarning('Preencha os campos obrigatórios')
    return
  }

  try {
    const paymentData = {
      comprado: true,
      valorUnitario: form.valorUnitario,
      valorTotal: form.valorTotal,
      formaPagamento: form.formaPagamento,
      observacao: form.observacaoPagamento,
      dataCompra: new Date(),
    }

    const updatedRequest = {
      ...form,
      status: REQUEST_STATUS.REALIZED,
      pagamento: paymentData,
    }

    await realizedRequest({
      request: updatedRequest,
      user: profile.value,
    })

    await addLog({
      module: 'Compras',
      action: 'REALIZED',
      entity: 'request',
      entityId: requestId.value,
      description: `Pedido ${form.requestNumber} marcado como realizado`,

      before: {
        requestNumber: originalRequest.value?.requestNumber,
        titulo: originalRequest.value?.titulo,
        categoria: originalRequest.value?.categoria,
        status: originalRequest.value?.status,
        pagamento: originalRequest.value?.pagamento || null,
      },

      after: {
        requestNumber: form.requestNumber,
        titulo: form.titulo,
        categoria: form.categoria,
        status: REQUEST_STATUS.REALIZED,
        pagamento: paymentData,
      },
    })

    notifySuccess('Compra finalizada com sucesso')

    router.push('/app/buy/payment')
  } catch (err) {
    console.error(err)
    notifyError('Erro ao finalizar compra')
  }
}

/* NAV */
const goBack = () => {
  router.push('/app/buy/payment')
}

/* UTILS */
const formatCurrency = (value) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(value || 0))

onMounted(load)
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
}
</style>
