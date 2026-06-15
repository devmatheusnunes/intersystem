<template>
  <q-page padding>

    <div class="text-h5 q-mb-md">
      Revisão de Solicitações
    </div>

    <q-table flat bordered row-key="id" :rows="rows" :columns="columns" :loading="loading">

      <template #body-cell-actions="props">
        <q-td align="center">

          <q-btn color="primary" icon="visibility" label="Revisar" size="sm" @click="openReviewDialog(props.row)" />

        </q-td>
      </template>

    </q-table>

    <q-dialog v-model="reviewDialog">

      <q-card style="min-width: 900px">

        <q-card-section>
          <div class="text-h6">
            Revisão da Solicitação
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section class="row q-col-gutter-md">

          <div class="col-12 col-md-4">
            <q-input outlined readonly label="Número" v-model="selected.requestNumber" />
          </div>

          <div class="col-12 col-md-8">
            <q-input outlined readonly label="Título" v-model="selected.titulo" />
          </div>

          <div class="col-12">
            <q-input outlined autogrow readonly label="Descrição" v-model="selected.descricao" />
          </div>

          <div class="col-12">
            <q-input outlined autogrow readonly label="Justificativa" v-model="selected.justificativa" />
          </div>

          <div class="col-12 col-md-4">
            <q-input outlined readonly label="Quantidade" v-model="selected.quantidade" />
          </div>

          <div class="col-12 col-md-4">
            <q-input outlined readonly label="Valor Unitário" :model-value="formatMoney(selected.valorUnitario)" />
          </div>

          <div class="col-12 col-md-4">
            <q-input outlined readonly label="Valor Total" :model-value="formatMoney(selected.valorTotal)" />
          </div>

          <div class="col-12">
            <q-input outlined readonly label="URL Produto" v-model="selected.produtoUrl" />
          </div>

          <div class="col-12">
            <q-input outlined readonly label="Forma de Pagamento" v-model="selected.formaPagamento" />
          </div>

          <div class="col-12">
            <q-input outlined autogrow label="Observação da Revisão" v-model="observacao" />
          </div>

        </q-card-section>

        <q-separator />

        <q-card-actions align="right">

          <q-btn flat label="Fechar" v-close-popup />

          <q-btn color="positive" icon="check" label="Enviar para Análise" @click="sendReview" />

        </q-card-actions>

      </q-card>

    </q-dialog>

  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'

import useRequests from 'src/composables/UseRequests'
import useAuthUser from 'src/composables/UseAuthUser'

import { REQUEST_STATUS } from 'src/constants/requestStatus'

const $q = useQuasar()

const { user } = useAuthUser()

const {
  getRequests,
  sendToAnalysis
} = useRequests()

const loading = ref(false)

const rows = ref([])

const reviewDialog = ref(false)

const observacao = ref('')

const selected = ref({})

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
    field: 'titulo'
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
    name: 'valorTotal',
    label: 'Valor Total',
    field: 'valorTotal'
  },
  {
    name: 'actions',
    label: 'Ações',
    field: 'actions',
    align: 'center'
  }
]

const loadRequests = async () => {

  loading.value = true

  try {

    const requests = await getRequests()

    rows.value = requests.filter(
      item =>
        item.status === REQUEST_STATUS.REVISION
    )

  } finally {
    loading.value = false
  }
}

const openReviewDialog = (request) => {

  selected.value = request

  observacao.value = ''

  reviewDialog.value = true
}

const sendReview = async () => {

  try {

    await sendToAnalysis({
      request: selected.value,

      user: user.value,

      observacao: observacao.value
    })

    $q.notify({
      type: 'positive',
      message: 'Solicitação enviada para análise'
    })

    reviewDialog.value = false

    await loadRequests()

  } catch (error) {

    console.error(error)

    $q.notify({
      type: 'negative',
      message: 'Erro ao enviar para análise'
    })
  }
}

const formatMoney = (value) => {

  return Number(value || 0)
    .toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })
}

onMounted(loadRequests)
</script>
