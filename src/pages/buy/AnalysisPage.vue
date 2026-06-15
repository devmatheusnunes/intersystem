<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-mb-md">
      <div class="text-h5">Análise de Solicitações</div>
    </div>

    <q-card flat bordered>
      <q-card-section>
        <q-table :rows="requests" :columns="columns" row-key="id" flat bordered>
          <template #body-cell-valorUnitario="props">
            <q-td :props="props">
              {{ formatCurrency(props.row.valorUnitario) }}
            </q-td>
          </template>

          <template #body-cell-valorTotal="props">
            <q-td :props="props">
              {{ formatCurrency(props.row.valorTotal) }}
            </q-td>
          </template>

          <template #body-cell-produtoUrl="props">
            <q-td :props="props">
              <q-btn
                flat
                dense
                color="primary"
                icon="open_in_new"
                @click="openProduct(props.row.produtoUrl)"
              >
                <q-tooltip> Abrir Produto </q-tooltip>
              </q-btn>
            </q-td>
          </template>

          <template #body-cell-actions="props">
            <q-td :props="props">
              <q-btn flat round color="primary" icon="visibility" @click="showDetails(props.row)" />
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <q-dialog v-model="dialog">
      <q-card style="min-width: 900px; max-width: 95vw">
        <q-card-section>
          <div class="text-h6">Solicitação #{{ selectedRequest?.requestNumber }}</div>
        </q-card-section>

        <q-separator />

        <q-card-section class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <strong>Título:</strong>
            {{ selectedRequest?.titulo }}
          </div>

          <div class="col-12 col-md-6">
            <strong>Categoria:</strong>
            {{ selectedRequest?.categoria }}
          </div>

          <div class="col-12">
            <strong>Descrição:</strong>
            {{ selectedRequest?.descricao }}
          </div>

          <div class="col-12">
            <strong>Justificativa:</strong>
            {{ selectedRequest?.justificativa }}
          </div>

          <div class="col-12 col-md-3">
            <strong>Quantidade:</strong>
            {{ selectedRequest?.quantidade }}
          </div>

          <div class="col-12 col-md-3">
            <strong>Valor Unitário:</strong>
            {{ formatCurrency(selectedRequest?.valorUnitario) }}
          </div>

          <div class="col-12 col-md-3">
            <strong>Valor Total:</strong>
            {{ formatCurrency(selectedRequest?.valorTotal) }}
          </div>

          <div class="col-12 col-md-3">
            <strong>Pagamento:</strong>
            {{ selectedRequest?.formaPagamento }}
          </div>

          <div class="col-12">
            <strong>Produto:</strong>

            <a :href="formatUrl(selectedRequest?.produtoUrl)" target="_blank">
              {{ selectedRequest?.produtoUrl }}
            </a>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <div class="text-subtitle1 q-mb-sm">Histórico</div>

          <q-timeline>
            <q-timeline-entry
              v-for="item in selectedRequest?.history || []"
              :key="item.timestamp"
              :title="item.status"
              :subtitle="formatDate(item.timestamp)"
            >
              <div>
                {{ item.observacao }}
              </div>

              <div class="text-caption">
                {{ item.userName }}
              </div>
            </q-timeline-entry>
          </q-timeline>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <q-input v-model="observacao" outlined type="textarea" label="Observação da análise" />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Fechar" v-close-popup />

          <q-btn color="orange" label="Em Espera" @click="waitRequestHandler" />

          <q-btn color="negative" label="Indeferir" @click="rejectRequestHandler" />

          <q-btn color="positive" label="Deferir" @click="approveRequestHandler" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'

import useRequests from 'src/composables/UseRequests'
import useAuthUser from 'src/composables/UseAuthUser'
import { REQUEST_STATUS } from 'src/constants/requestStatus'

const { getRequests, approveRequest, rejectRequest, waitRequest } = useRequests()

const { user } = useAuthUser()

const requests = ref([])

const dialog = ref(false)

const selectedRequest = ref(null)

const observacao = ref('')

const columns = [
  {
    name: 'requestNumber',
    label: 'Nº',
    field: 'requestNumber',
  },
  {
    name: 'titulo',
    label: 'Título',
    field: 'titulo',
  },
  {
    name: 'solicitanteNome',
    label: 'Solicitante',
    field: 'solicitanteNome',
  },
  {
    name: 'setorNome',
    label: 'Setor',
    field: 'setorNome',
  },
  {
    name: 'categoria',
    label: 'Categoria',
    field: 'categoria',
  },
  {
    name: 'quantidade',
    label: 'Qtd',
    field: 'quantidade',
  },
  {
    name: 'valorUnitario',
    label: 'Valor Unit.',
    field: 'valorUnitario',
  },
  {
    name: 'valorTotal',
    label: 'Valor Total',
    field: 'valorTotal',
  },
  {
    name: 'produtoUrl',
    label: 'Produto',
    field: 'produtoUrl',
  },
  {
    name: 'actions',
    label: 'Ações',
    field: 'actions',
  },
]

const loadRequests = async () => {
  const allRequests = await getRequests()

  const validStatus = [
    REQUEST_STATUS.PENDING_ANALYSIS,
    REQUEST_STATUS.REANALYSIS,
    REQUEST_STATUS.WAITING,
  ]

  requests.value = allRequests.filter((request) => validStatus.includes(request.status))
}

const showDetails = (request) => {
  selectedRequest.value = request
  observacao.value = ''
  dialog.value = true
}

const approveRequestHandler = async () => {
  await approveRequest({
    request: selectedRequest.value,
    user: user.value,
    observacao: observacao.value,
  })

  dialog.value = false

  await loadRequests()
}

const rejectRequestHandler = async () => {
  await rejectRequest({
    request: selectedRequest.value,
    user: user.value,
    observacao: observacao.value,
  })

  dialog.value = false

  await loadRequests()
}

const waitRequestHandler = async () => {
  await waitRequest({
    request: selectedRequest.value,
    user: user.value,
    observacao: observacao.value,
  })

  dialog.value = false

  await loadRequests()
}

const openProduct = (url) => {
  if (!url) return '#'

  // já tem http ou https
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }

  // adiciona https automaticamente
  return window.open(`https://${url}`, '_blank')
}

const formatUrl = (url) => {
  if (!url) return '#'

  // já tem http ou https
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }

  // adiciona https automaticamente
  return `https://${url}`
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(value || 0))
}

const formatDate = (timestamp) => {
  if (!timestamp) return ''

  const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp)

  return date.toLocaleString('pt-BR')
}

onMounted(loadRequests)
</script>
