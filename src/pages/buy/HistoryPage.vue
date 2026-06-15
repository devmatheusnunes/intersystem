<template>
  <q-page class="page-container">
    <!-- KPIs -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-sm-6 col-md">
        <q-card flat bordered class="kpi-card">
          <q-card-section>
            <div class="text-caption text-grey-7">Total Histórico</div>
            <div class="text-h4 text-weight-bold">
              {{ stats.total }}
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md">
        <q-card flat bordered class="kpi-card">
          <q-card-section>
            <div class="text-caption text-grey-7">Deferidos</div>
            <div class="text-h4 text-positive text-weight-bold">
              {{ stats.approved }}
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md">
        <q-card flat bordered class="kpi-card">
          <q-card-section>
            <div class="text-caption text-grey-7">Indeferidos</div>
            <div class="text-h4 text-negative text-weight-bold">
              {{ stats.rejected }}
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md">
        <q-card flat bordered class="kpi-card">
          <q-card-section>
            <div class="text-caption text-grey-7">Em Espera</div>
            <div class="text-h4 text-orange text-weight-bold">
              {{ stats.waiting }}
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md">
        <q-card flat bordered class="kpi-card">
          <q-card-section>
            <div class="text-caption text-grey-7">Finalizados</div>
            <div class="text-h4 text-primary text-weight-bold">
              {{ stats.finished }}
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Tabela -->
    <q-card flat bordered class="table-card">
      <q-table
        flat
        :rows="filteredRows"
        :columns="columns"
        row-key="id"
        :loading="loading"
        :pagination="{ rowsPerPage: 10 }"
      >
        <template #top>
          <div class="row items-center full-width q-gutter-md">
            <div>
              <div class="text-h6 text-weight-bold">Histórico de Solicitações</div>

              <div class="text-caption text-grey-7">
                Solicitações concluídas, indeferidas ou aguardando ação
              </div>
            </div>

            <q-space />

            <q-input
              v-model="search"
              outlined
              dense
              clearable
              debounce="300"
              placeholder="Pesquisar produto..."
              style="width: 280px"
            >
              <template #prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
        </template>

        <!-- Produto -->
        <template #body-cell-titulo="props">
          <q-td :props="props">
            <div class="text-weight-medium">
              {{ props.row.titulo }}
            </div>

            <div class="text-caption text-grey-7">
              {{ props.row.solicitanteNome }}
            </div>
          </q-td>
        </template>

        <!-- Valor -->
        <template #body-cell-valorTotal="props">
          <q-td :props="props">
            {{
              Number(props.row.valorTotal || 0).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })
            }}
          </q-td>
        </template>

        <!-- Setor -->
        <template #body-cell-setorNome="props">
          <q-td :props="props">
            {{ props.row.setorNome }}
          </q-td>
        </template>

        <!-- Status -->
        <template #body-cell-status="props">
          <q-td :props="props">
            <q-chip
              v-if="props.row.status === REQUEST_STATUS.APPROVED"
              color="green"
              text-color="white"
              icon="check_circle"
            >
              Deferido
            </q-chip>

            <q-chip
              v-else-if="props.row.status === REQUEST_STATUS.REJECTED"
              color="red"
              text-color="white"
              icon="cancel"
            >
              Indeferido
            </q-chip>

            <q-chip
              v-else-if="props.row.status === REQUEST_STATUS.WAITING"
              color="orange"
              text-color="white"
              icon="pause_circle"
            >
              Em Espera
            </q-chip>

            <q-chip
              v-else-if="props.row.status === REQUEST_STATUS.FINISHED"
              color="primary"
              text-color="white"
              icon="task_alt"
            >
              Finalizado
            </q-chip>
          </q-td>
        </template>

        <!-- Data -->
        <template #body-cell-createdAt="props">
          <q-td :props="props">
            {{ formatDate(props.row.createdAt) }}
          </q-td>
        </template>

        <!-- Ações -->
        <template #body-cell-actions="props">
          <q-td :props="props">
            <q-btn flat round color="primary" icon="visibility" @click="viewRequest(props.row)">
              <q-tooltip>Visualizar</q-tooltip>
            </q-btn>

            <!-- Reanálise -->
            <q-btn
              v-if="canRequestReanalysis(props.row)"
              flat
              round
              color="warning"
              icon="restart_alt"
              @click="handleReanalysis(props.row)"
            >
              <q-tooltip>Solicitar Reanálise</q-tooltip>
            </q-btn>

            <!-- Reforço -->
            <q-btn
              v-if="props.row.status === REQUEST_STATUS.WAITING"
              flat
              round
              color="orange"
              icon="priority_high"
              @click="handleReinforce(props.row)"
            >
              <q-tooltip>Solicitar Reforço</q-tooltip>
            </q-btn>

            <!-- Pedir novamente -->
            <q-btn
              v-if="props.row.status === REQUEST_STATUS.FINISHED"
              flat
              round
              color="positive"
              icon="content_copy"
              @click="handleDuplicate(props.row)"
            >
              <q-tooltip>Pedir Novamente</q-tooltip>
            </q-btn>
          </q-td>
        </template>

        <template #no-data>
          <div class="full-width row flex-center q-pa-xl text-grey">
            <q-icon name="history" size="40px" class="q-mr-sm" />
            Nenhum histórico encontrado
          </div>
        </template>
      </q-table>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import useNotify from 'src/composables/UseNotify'
import useRequests from 'src/composables/UseRequests'
import usePermissions from 'src/composables/UsePermissions'

import { REQUEST_STATUS } from 'src/constants/requestStatus'

const router = useRouter()

const loading = ref(false)
const rows = ref([])
const search = ref('')

const { notifyError, notifySuccess } = useNotify()
const { canViewItem } = usePermissions()

const { getRequests, requestReanalysis, reinforceRequest, duplicateRequest } = useRequests()

const stats = computed(() => ({
  total: rows.value.length,
  approved: rows.value.filter((i) => i.status === REQUEST_STATUS.APPROVED).length,

  rejected: rows.value.filter((i) => i.status === REQUEST_STATUS.REJECTED).length,

  waiting: rows.value.filter((i) => i.status === REQUEST_STATUS.WAITING).length,

  finished: rows.value.filter((i) => i.status === REQUEST_STATUS.FINISHED).length,
}))

const columns = [
  {
    name: 'titulo',
    label: 'Produto',
    field: 'titulo',
    align: 'left',
    sortable: true,
  },
  {
    name: 'valorTotal',
    label: 'Valor',
    field: 'valorTotal',
    align: 'right',
    sortable: true,
  },
  {
    name: 'setorNome',
    label: 'Setor',
    field: 'setorNome',
    sortable: true,
  },
  {
    name: 'status',
    label: 'Status',
    field: 'status',
    align: 'center',
  },
  {
    name: 'createdAt',
    label: 'Data',
    field: 'createdAt',
    align: 'center',
  },
  {
    name: 'actions',
    label: 'Ações',
    field: 'actions',
    align: 'center',
  },
]

const filteredRows = computed(() => {
  if (!search.value) return rows.value

  return rows.value.filter((item) =>
    item.titulo?.toLowerCase().includes(search.value.toLowerCase()),
  )
})

const loadRequests = async () => {
  loading.value = true

  try {
    const all = await getRequests()

    rows.value = all
      .filter((item) => canViewItem(item))
      .filter((item) =>
        [
          REQUEST_STATUS.APPROVED,
          REQUEST_STATUS.REJECTED,
          REQUEST_STATUS.WAITING,
          REQUEST_STATUS.FINISHED,
        ].includes(item.status),
      )
  } catch {
    notifyError('Erro ao carregar histórico')
  } finally {
    loading.value = false
  }
}

const viewRequest = (row) => {
  router.push(`/app/buy/details/${row.id}`)
}

const canRequestReanalysis = (row) => {
  return (
    row.status === REQUEST_STATUS.REJECTED &&
    !row.reanalysisRequested &&
    (row.reanalises || 0) === 0
  )
}

const handleReanalysis = async (request) => {
  try {
    await requestReanalysis({ request })

    notifySuccess('Solicitação enviada para reanálise')

    loadRequests()
  } catch {
    notifyError('Erro ao solicitar reanálise')
  }
}

const handleReinforce = async (request) => {
  try {
    await reinforceRequest({ request })

    notifySuccess('Solicitação enviada com prioridade')

    loadRequests()
  } catch {
    notifyError('Erro ao solicitar reforço')
  }
}

const handleDuplicate = async (request) => {
  try {
    await duplicateRequest({ request })

    notifySuccess('Nova solicitação criada')

    router.push('/app/buy/new-request')
  } catch (error) {
    console.error('ERRO DUPLICAR', error)

    notifyError('Erro ao duplicar solicitação')
  }
}

const formatDate = (date) => {
  if (!date) return '-'

  try {
    const value = date?.toDate ? date.toDate() : new Date(date)

    return value.toLocaleDateString('pt-BR')
  } catch {
    return '-'
  }
}

onMounted(loadRequests)
</script>

<style scoped>
.page-container {
  padding: 24px;
  background: #f5f7fb;
  min-height: 100%;
}

.kpi-card {
  border-radius: 14px;
  transition: all 0.2s ease;
}

.kpi-card:hover {
  transform: translateY(-2px);
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

:deep(.q-table tbody tr:last-child td) {
  border-bottom: none;
}
</style>
