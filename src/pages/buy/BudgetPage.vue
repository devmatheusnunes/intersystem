<template>
  <q-page padding>

    <div class="text-h5 q-mb-md">
      Pedidos em Orçamento
    </div>

    <q-table flat bordered row-key="id" :rows="rows" :columns="columns" :loading="loading">

      <template #body-cell-actions="props">
        <q-td align="center">

          <q-btn color="primary" icon="edit" label="Orçar" size="sm" @click="openBudgetDialog(props.row)" />

        </q-td>
      </template>

    </q-table>

    <q-dialog v-model="budgetDialog">

      <q-card style="min-width: 800px">

        <q-card-section>
          <div class="text-h6">
            Realizar Orçamento
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section class="row q-col-gutter-md">

          <div class="col-12 col-md-6">
            <q-input outlined readonly label="Número" v-model="form.requestNumber" />
          </div>

          <div class="col-12 col-md-6">
            <q-input outlined readonly label="Título" v-model="form.titulo" />
          </div>

          <div class="col-12">
            <q-input outlined autogrow readonly label="Justificativa" v-model="form.justificativa" />
          </div>

          <div class="col-12">
            <q-input outlined label="URL do Produto" v-model="form.produtoUrl" />
          </div>

          <div class="col-12 col-md-4">
            <q-input outlined readonly label="Quantidade" v-model.number="form.quantidade" type="number" />
          </div>

          <div class="col-12 col-md-4">
            <q-input outlined label="Valor Unitário" v-model.number="form.valorUnitario" type="number" step="0.01" />
          </div>

          <div class="col-12 col-md-4">
            <q-input outlined readonly label="Valor Total" :model-value="formattedTotal" />
          </div>

          <div class="col-12">
            <q-select outlined emit-value map-options label="Forma de Pagamento" v-model="form.formaPagamento"
              :options="paymentOptions" />
          </div>

        </q-card-section>

        <q-separator />

        <q-card-actions align="right">

          <q-btn flat label="Cancelar" v-close-popup />

          <q-btn color="positive" label="Salvar e Enviar para Revisão" @click="saveBudget" />

        </q-card-actions>

      </q-card>

    </q-dialog>

  </q-page>
</template>

<script setup>
import {
  ref,
  computed,
  watch,
  onMounted
} from 'vue'
import { useQuasar } from 'quasar'

import useRequests from 'src/composables/UseRequests'
import useAuthUser from 'src/composables/UseAuthUser'

import { REQUEST_STATUS } from 'src/constants/requestStatus'

const $q = useQuasar()

const { user } = useAuthUser()

const {
  getRequests,
  updateRequest,
  sendToRevision
} = useRequests()

const loading = ref(false)

const rows = ref([])

const budgetDialog = ref(false)

const selectedRequest = ref(null)

const paymentOptions = [
  'PIX',
  'Cartão de Crédito',
  'Cartão de Débito',
  'Boleto',
  'Transferência Bancária'
]

const form = ref({
  requestNumber: '',
  titulo: '',
  justificativa: '',
  quantidade: 0,

  produtoUrl: '',
  valorUnitario: 0,
  valorTotal: 0,
  formaPagamento: ''
})

const columns = [
  {
    name: 'requestNumber',
    label: 'Número',
    field: 'requestNumber',
    align: 'left'
  },
  {
    name: 'titulo',
    label: 'Título',
    field: 'titulo',
    align: 'left'
  },
  {
    name: 'solicitanteNome',
    label: 'Solicitante',
    field: 'solicitanteNome'
  },
  {
    name: 'setorNome',
    label: 'Setor',
    field: 'setorNome'
  },
  {
    name: 'actions',
    label: 'Ações',
    field: 'actions',
    align: 'center'
  }
]

watch(
  () => [
    form.value.quantidade,
    form.value.valorUnitario
  ],
  () => {
    form.value.valorTotal =
      Number(form.value.quantidade || 0) *
      Number(form.value.valorUnitario || 0)
  },
  {
    immediate: true
  }
)

const formattedTotal = computed(() => {
  return Number(
    form.value.valorTotal || 0
  ).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  })
})

const loadRequests = async () => {
  loading.value = true

  try {

    const requests = await getRequests()

    rows.value = requests.filter(
      item =>
        item.status === REQUEST_STATUS.BUDGET
    )

  } finally {
    loading.value = false
  }
}

const openBudgetDialog = (request) => {

  selectedRequest.value = request

  form.value = {
    requestNumber: request.requestNumber,
    titulo: request.titulo,
    justificativa: request.justificativa,
    quantidade: request.quantidade,

    produtoUrl: request.produtoUrl || '',
    valorUnitario: request.valorUnitario || 0,
    valorTotal: request.valorTotal || 0,
    formaPagamento: request.formaPagamento || ''
  }

  budgetDialog.value = true
}

const saveBudget = async () => {

  if (!form.value.produtoUrl) {
    return $q.notify({
      type: 'negative',
      message: 'Informe a URL do produto'
    })
  }

  if (!form.value.valorUnitario) {
    return $q.notify({
      type: 'negative',
      message: 'Informe o valor unitário'
    })
  }

  if (!form.value.formaPagamento) {
    return $q.notify({
      type: 'negative',
      message: 'Informe a forma de pagamento'
    })
  }

  try {

    await updateRequest(
      selectedRequest.value.id,
      {
        produtoUrl: form.value.produtoUrl,

        valorUnitario: Number(
          form.value.valorUnitario
        ),

        valorTotal: Number(
          form.value.valorTotal
        ),

        formaPagamento:
          form.value.formaPagamento
      }
    )
    console.log({
      uid: user.value.uid,
      userId: user.value.userId,
      nome: user.value.nome,
      email: user.value.email
    })
    await sendToRevision({
      request: {
        ...selectedRequest.value
      },

      user: user.value,

      observacao:
        'Orçamento realizado'
    })

    $q.notify({
      type: 'positive',
      message:
        'Pedido enviado para revisão'
    })

    budgetDialog.value = false

    await loadRequests()

  } catch (error) {

    console.error(error)

    $q.notify({
      type: 'negative',
      message:
        'Erro ao salvar orçamento'
    })
  }
}

onMounted(loadRequests)
</script>
