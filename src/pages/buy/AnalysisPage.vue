<template>
  <q-page class="page-container">
    <!-- KPI -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-md-3">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-caption text-grey">Total</div>

            <div class="text-h5 text-weight-bold">
              {{ rows.length }}
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-3">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-caption text-grey">Pendente de Análise</div>

            <div class="text-h5 text-yellow-8 text-weight-bold">
              {{ pendingCount }}
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-3">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-caption text-grey">Em Reanálise</div>

            <div class="text-h5 text-orange text-weight-bold">
              {{ reanalysisCount }}
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-3">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-caption text-grey">Em Espera</div>

            <div class="text-h5 text-deep-orange text-weight-bold">
              {{ waitingCount }}
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- TABELA -->
    <q-card flat bordered class="table-card">
      <q-table
        flat
        :rows="filteredRows"
        :columns="columns"
        row-key="id"
        :loading="loading"
        :pagination="{ rowsPerPage: 10 }"
      >
        <!-- TOP -->
        <template #top>
          <div class="row items-center full-width q-gutter-md">
            <div>
              <div class="text-h6 text-weight-bold">Análise de Solicitações</div>

              <div class="text-caption text-grey-7">Avalie e finalize as solicitações</div>
            </div>

            <q-space />

            <q-input
              v-model="search"
              outlined
              dense
              clearable
              debounce="300"
              placeholder="Pesquisar..."
              style="width: 280px"
            >
              <template #prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
        </template>

        <!-- Produto + Solicitante -->
        <template #body-cell-titulo="props">
          <q-td :props="props" class="text-left">
            <div class="row items-center q-gutter-sm text-weight-medium">
              <!-- 🔥 ÍCONE DE URGÊNCIA -->
              <q-icon v-if="props.row.reforco" name="priority_high" color="rejected" size="18px" />

              <span>
                {{ props.row.titulo }}
              </span>
            </div>

            <div class="text-caption text-grey-7 text-left">
              {{ props.row.solicitanteNome }}
            </div>
          </q-td>
        </template>

        <!-- Setor -->
        <template #body-cell-setorNome="props">
          <q-td :props="props">
            {{ props.row.setorNome }}
          </q-td>
        </template>

        <!-- Valor -->
        <template #body-cell-valorTotal="props">
          <q-td :props="props">
            {{ formatCurrency(props.row.valorTotal) }}
          </q-td>
        </template>

        <!-- STATUS -->
        <template #body-cell-status="props">
          <q-td :props="props">
            <q-chip
              v-if="props.row.status === REQUEST_STATUS.PENDING_ANALYSIS"
              color="analysis"
              text-color="white"
              icon="hourglass_top"
            >
              Pendente
            </q-chip>

            <q-chip
              v-else-if="props.row.status === REQUEST_STATUS.REANALYSIS"
              color="reanalysis"
              text-color="white"
              icon="refresh"
            >
              Reanálise
            </q-chip>

            <q-chip
              v-else-if="props.row.status === REQUEST_STATUS.WAITING"
              color="waiting"
              text-color="white"
              icon="pause"
            >
              Em espera
            </q-chip>

            <q-chip v-else color="grey" text-color="white">
              {{ props.row.status }}
            </q-chip>
          </q-td>
        </template>

        <!-- Produto -->
        <template #body-cell-produtoUrl="props">
          <q-td :props="props">
            <q-btn
              flat
              dense
              color="primary"
              icon="open_in_new"
              @click="openProduct(props.row.produtoUrl)"
            />
          </q-td>
        </template>

        <!-- Ações -->
        <template #body-cell-actions="props">
          <q-td :props="props">
            <q-btn
              color="primary"
              icon="visibility"
              label="Analisar"
              size="sm"
              unelevated
              @click="showDetails(props.row)"
            />
          </q-td>
        </template>

        <!-- No data -->
        <template #no-data>
          <div class="full-width row flex-center q-pa-xl text-grey">
            <q-icon name="inventory_2" size="40px" class="q-mr-sm" />
            Nenhuma solicitação encontrada
          </div>
        </template>
      </q-table>
    </q-card>

    <!-- DIALOG (mantido igual) -->
    <q-dialog v-model="dialog">
      <q-card style="min-width: 900px; max-width: 1000px; border-radius: 14px">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6 text-weight-bold">
            {{ selectedRequest?.requestNumber }}
          </div>
        </q-card-section>

        <q-card-section class="q-pa-lg">
          <div class="row q-col-gutter-md">
            <div class="col-12">
              <div class="text-subtitle1 text-weight-medium">
                {{ selectedRequest?.titulo }}
              </div>
            </div>

            <div class="col-4">
              <div class="field-label">Solicitante</div>
              <div class="field-value">
                {{ selectedRequest?.solicitanteNome }}
              </div>
            </div>

            <div class="col-4">
              <div class="field-label">Setor</div>
              <div class="field-value">
                {{ selectedRequest?.setorNome }}
              </div>
            </div>

            <div class="col-4">
              <div class="field-label">Quantidade</div>
              <div class="field-value">
                {{ selectedRequest?.quantidade }}
              </div>
            </div>

            <div class="col-4">
              <div class="field-label">Valor Unitário</div>
              <div class="field-value">
                {{ formatCurrency(selectedRequest?.valorUnitario) }}
              </div>
            </div>

            <div class="col-4">
              <div class="field-label">Valor Total</div>
              <div class="field-value text-primary text-weight-bold">
                {{ formatCurrency(selectedRequest?.valorTotal) }}
              </div>
            </div>

            <div class="col-4">
              <div class="field-label">Pagamento</div>
              <div class="field-value">
                {{ selectedRequest?.formaPagamento }}
              </div>
            </div>

            <div class="col-12">
              <div class="field-label">Produto</div>
              <a :href="formatUrl(selectedRequest?.produtoUrl)" target="_blank"> Abrir link </a>
            </div>

            <div class="col-12">
              <q-input
                v-model="observacao"
                outlined
                type="textarea"
                label="Observação da análise"
              />
            </div>
          </div>
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
import { ref, computed, onMounted } from 'vue'
import useRequests from 'src/composables/UseRequests'
import useAuthUser from 'src/composables/UseAuthUser'
import { REQUEST_STATUS } from 'src/constants/requestStatus'

const { getRequests, approveRequest, rejectRequest, waitRequest } = useRequests()
const { user } = useAuthUser()

const loading = ref(false)
const rows = ref([])
const search = ref('')

const dialog = ref(false)
const selectedRequest = ref(null)
const observacao = ref('')

const columns = [
  { name: 'requestNumber', label: 'Nº', field: 'requestNumber' },
  { name: 'titulo', label: 'Produto', field: 'titulo' },
  { name: 'setorNome', label: 'Setor', field: 'setorNome' },
  { name: 'valorTotal', label: 'Valor Total', field: 'valorTotal' },
  { name: 'status', label: 'Status', field: 'status', align: 'center' },
  { name: 'produtoUrl', label: 'Produto', field: 'produtoUrl' },
  { name: 'actions', label: 'Ações', field: 'actions', align: 'center' },
]

const filteredRows = computed(() => {
  if (!search.value) return rows.value

  return rows.value.filter((item) =>
    item.titulo?.toLowerCase().includes(search.value.toLowerCase()),
  )
})

/* 🔥 KPI */
const pendingCount = computed(
  () => rows.value.filter((r) => r.status === REQUEST_STATUS.PENDING_ANALYSIS).length,
)

const reanalysisCount = computed(
  () => rows.value.filter((r) => r.status === REQUEST_STATUS.REANALYSIS).length,
)

const waitingCount = computed(
  () => rows.value.filter((r) => r.status === REQUEST_STATUS.WAITING).length,
)

const loadRequests = async () => {
  loading.value = true

  try {
    const all = await getRequests()

    const filtered = all.filter((r) =>
      [REQUEST_STATUS.PENDING_ANALYSIS, REQUEST_STATUS.REANALYSIS, REQUEST_STATUS.WAITING].includes(
        r.status,
      ),
    )

    // 🔥 ORDENAÇÃO INTELIGENTE
    rows.value = filtered.sort((a, b) => {
      // 1️⃣ reforçados primeiro
      if (a.reforco && !b.reforco) return -1
      if (!a.reforco && b.reforco) return 1

      // 2️⃣ mais recente primeiro (fallback)
      const dateA = parseDate(a.reforcoAt || a.updatedAt || a.createdAt)
      const dateB = parseDate(b.reforcoAt || b.updatedAt || b.createdAt)

      return dateB - dateA
    })
  } finally {
    loading.value = false
  }
}

const parseDate = (value) => {
  if (!value) return new Date(0)

  if (typeof value?.toDate === 'function') {
    return value.toDate()
  }

  const date = new Date(value)
  return isNaN(date.getTime()) ? new Date(0) : date
}

const showDetails = (row) => {
  selectedRequest.value = row
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
  if (!url) return
  window.open(formatUrl(url), '_blank')
}

const formatUrl = (url) => {
  if (!url) return '#'
  return url.startsWith('http') ? url : `https://${url}`
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(value || 0))
}

onMounted(loadRequests)
</script>

<style scoped>
.page-container {
  padding: 24px;
  background: #f5f7fb;
  min-height: 100%;
}

.table-card {
  border-radius: 14px;
  overflow: hidden;
}

:deep(.q-table thead tr th) {
  background: #f3f4f6;
  border-bottom: 2px solid #cfd6df;
  font-weight: 600;
}

:deep(.q-table tbody tr td) {
  border-bottom: 1px solid #cfd6df;
}

:deep(.q-table tbody tr:hover) {
  background: #f8fafc;
}

:deep(.q-table__container) {
  border: 1px solid #cfd6df;
}

.field-label {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 4px;
  font-weight: 600;
  text-transform: uppercase;
}

.field-value {
  font-size: 15px;
  font-weight: 500;
  color: #111827;
}
</style>
