<template>
  <q-page class="page-container">
    <!-- KPIs -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-sm-6 col-md">
        <q-card flat bordered class="kpi-card">
          <q-card-section>
            <div class="text-caption text-grey-7">Total</div>
            <div class="text-h4 text-weight-bold">
              {{ stats.total }}
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md">
        <q-card flat bordered class="kpi-card">
          <q-card-section>
            <div class="text-caption text-grey-7">Em Orçamento</div>
            <div class="text-h4 text-budget text-weight-bold">
              {{ stats.budget }}
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md">
        <q-card flat bordered class="kpi-card">
          <q-card-section>
            <div class="text-caption text-grey-7">Em Revisão</div>
            <div class="text-h4 text-revision text-weight-bold">
              {{ stats.revision }}
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md">
        <q-card flat bordered class="kpi-card">
          <q-card-section>
            <div class="text-caption text-grey-7">Pendente Análise</div>
            <div class="text-h4 text-analysis text-weight-bold">
              {{ stats.analysis }}
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md">
        <q-card flat bordered class="kpi-card">
          <q-card-section>
            <div class="text-caption text-grey-7">Em Reanálise</div>
            <div class="text-h4 text-reanalysis text-weight-bold">
              {{ stats.reanalysis }}
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
        <template #top>
          <div class="row items-center full-width q-gutter-md">
            <div>
              <div class="text-h6 text-weight-bold">Solicitações de Compras</div>
              <div class="text-caption text-grey-7">Gerencie as solicitações</div>
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

            <q-btn
              color="dark"
              icon="add"
              label="Nova Solicitação"
              unelevated
              @click="goToNewRequest"
            />
          </div>
        </template>

        <!-- Produto -->
        <template #body-cell-titulo="props">
          <q-td :props="props">
            <div class="text-weight-medium">
              {{ props.row.produto.titulo }}
            </div>
            <div class="text-caption text-grey-7">
              {{ props.row.solicitante.nome }}
            </div>
          </q-td>
        </template>

        <!-- Valor -->
        <template #body-cell-valorTotal="props">
          <q-td :props="props">
            {{
              Number(props.row.financeiro.valorTotal || 0).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })
            }}
          </q-td>
        </template>

        <!-- Setor -->
        <template #body-cell-setorNome="props">
          <q-td :props="props">
            {{ props.row.solicitante.setorNome }}
          </q-td>
        </template>

        <!-- Status -->
        <template #body-cell-status="props">
          <q-td :props="props">
            <q-chip
              v-if="props.row.status === REQUEST_STATUS.BUDGET"
              color="budget"
              text-color="white"
              icon="request_page"
            >
              Orçamento
            </q-chip>

            <q-chip
              v-else-if="props.row.status === REQUEST_STATUS.REVISION"
              color="revision"
              text-color="white"
              icon="edit"
            >
              Revisão
            </q-chip>

            <q-chip
              v-else-if="props.row.status === REQUEST_STATUS.PENDING_ANALYSIS"
              color="analysis"
              text-color="white"
              icon="hourglass_top"
            >
              Análise
            </q-chip>

            <q-chip
              v-else-if="props.row.status === REQUEST_STATUS.REANALYSIS"
              color="reanalysis"
              text-color="white"
              icon="refresh"
            >
              Reanálise
            </q-chip>

            <q-chip v-else color="grey" text-color="white">
              {{ props.row.status }}
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
            <q-btn
              flat
              round
              color="primary"
              icon="visibility"
              @click="viewDetails(props.row.id)"
            />

            <q-btn
              flat
              round
              color="warning"
              icon="edit"
              :disable="!canEdit(props.row)"
              @click="editRequest(props.row.id)"
            />

            <q-btn
              flat
              round
              color="negative"
              icon="delete"
              :disable="!canDelete(props.row)"
              @click="confirmDelete(props.row)"
            />
          </q-td>
        </template>

        <template #no-data>
          <div class="full-width row flex-center q-pa-xl text-grey">
            <q-icon name="inventory_2" size="40px" class="q-mr-sm" />
            Nenhuma solicitação encontrada
          </div>
        </template>
      </q-table>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Dialog } from 'quasar'

import useNotify from 'src/composables/UseNotify'
import useRequests from 'src/composables/UseRequests'
import usePermissions from 'src/composables/UsePermissions'
import { REQUEST_STATUS } from 'src/constants/requestStatus'
import useSystemLog from 'src/composables/UseSystemLog'

const router = useRouter()

const { notifyError, notifySuccess } = useNotify()
const { canViewItem, can } = usePermissions()
const { getRequests, deleteRequest } = useRequests()
const { addLog } = useSystemLog()

const loading = ref(false)
const rows = ref([])
const search = ref('')

const columns = [
  { name: 'requestNumber', label: 'Número', field: 'requestNumber', align: 'left', sortable: true },
  { name: 'titulo', label: 'Produto', field: 'titulo', align: 'left', sortable: true },
  { name: 'valorTotal', label: 'Valor', field: 'valorTotal', align: 'right', sortable: true },
  { name: 'setorNome', label: 'Setor', field: 'setorNome', sortable: true },
  { name: 'status', label: 'Status', field: 'status', align: 'center', sortable: true },
  { name: 'createdAt', label: 'Data', field: 'createdAt', align: 'center', sortable: true },
  { name: 'actions', label: 'Ações', field: 'actions', align: 'center' },
]

const stats = computed(() => ({
  total: rows.value.length,
  budget: rows.value.filter((i) => i.status === REQUEST_STATUS.BUDGET).length,
  revision: rows.value.filter((i) => i.status === REQUEST_STATUS.REVISION).length,
  analysis: rows.value.filter((i) => i.status === REQUEST_STATUS.PENDING_ANALYSIS).length,
  reanalysis: rows.value.filter((i) => i.status === REQUEST_STATUS.REANALYSIS).length,
}))

const filteredRows = computed(() => {
  if (!search.value) return rows.value
  return rows.value.filter((i) => i.titulo?.toLowerCase().includes(search.value.toLowerCase()))
})

const loadRequests = async () => {
  loading.value = true

  try {
    const data = await getRequests()

    const allowed = [
      REQUEST_STATUS.BUDGET,
      REQUEST_STATUS.REVISION,
      REQUEST_STATUS.PENDING_ANALYSIS,
      REQUEST_STATUS.REANALYSIS,
    ]

    rows.value = data.filter((i) => canViewItem(i)).filter((i) => allowed.includes(i.status))
  } catch {
    notifyError('Erro ao carregar solicitações')
  } finally {
    loading.value = false
  }
}

const viewDetails = (id) => router.push(`/app/buy/details/${id}`)
const goToNewRequest = () => router.push('/app/buy/new-request')
const editRequest = (id) => router.push(`/app/buy/edit-request/${id}`)

const canEdit = (row) =>
  can('requests.edit') && [REQUEST_STATUS.BUDGET, REQUEST_STATUS.REVISION].includes(row.status)

const canDelete = (row) =>
  can('requests.delete') && [REQUEST_STATUS.BUDGET, REQUEST_STATUS.REVISION].includes(row.status)

const confirmDelete = (row) => {
  Dialog.create({
    title: 'Excluir Solicitação',
    message: 'Deseja realmente excluir?',
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      const before = { ...row }

      await deleteRequest(row.id)

      await addLog({
        module: 'Solicitações',
        action: 'DELETE',
        description: `Excluiu ${row.requestNumber}`,
        documentId: row.id,
        before,
      })

      rows.value = rows.value.filter((i) => i.id !== row.id)

      notifySuccess('Excluído com sucesso')
    } catch {
      notifyError('Erro ao excluir')
    }
  })
}

const formatDate = (date) => {
  if (!date) return '-'
  const d = date?.toDate ? date.toDate() : new Date(date)
  return d.toLocaleDateString('pt-BR')
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

.uid-text {
  word-break: break-all;
}
</style>
