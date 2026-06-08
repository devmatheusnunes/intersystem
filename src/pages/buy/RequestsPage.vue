```vue
<template>
  <q-page class="page-container">
    <!-- KPIs -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered class="kpi-card">
          <q-card-section>
            <div class="text-caption text-grey-7">Total</div>
            <div class="text-h4 text-weight-bold">
              {{ stats.total }}
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered class="kpi-card">
          <q-card-section>
            <div class="text-caption text-grey-7">Pendentes</div>
            <div class="text-h4 text-warning text-weight-bold">
              {{ stats.pendentes }}
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered class="kpi-card">
          <q-card-section>
            <div class="text-caption text-grey-7">Em orçamento</div>

            <div class="text-h4 text-info text-weight-bold">
              {{ stats.orcamento }}
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered class="kpi-card">
          <q-card-section>
            <div class="text-caption text-grey-7">Deferidas</div>

            <div class="text-h4 text-positive text-weight-bold">
              {{ stats.deferidos }}
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
              <div class="text-h6 text-weight-bold">Solicitações de Compras</div>

              <div class="text-caption text-grey-7">Gerencie as solicitações cadastradas</div>
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
        <template #body-cell-produto="props">
          <q-td :props="props">
            <div class="text-weight-medium">
              {{ props.row.produto }}
            </div>

            <div class="text-caption text-grey-7">
              {{ props.row.solicitante }}
            </div>
          </q-td>
        </template>

        <!-- Valor -->
        <template #body-cell-valor="props">
          <q-td :props="props">
            {{
              Number(props.row.valor || 0).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })
            }}
          </q-td>
        </template>

        <!-- Status -->
        <template #body-cell-status="props">
          <q-td :props="props">
            <q-chip
              v-if="props.row.status === 'Pendente análise'"
              color="warning"
              text-color="black"
              icon="hourglass_top"
            >
              Pendente análise
            </q-chip>

            <q-chip
              v-else-if="props.row.status === 'Em orçamento'"
              color="info"
              text-color="white"
              icon="request_quote"
            >
              Em orçamento
            </q-chip>

            <q-chip
              v-else-if="props.row.status === 'Deferido'"
              color="positive"
              text-color="white"
              icon="check_circle"
            >
              Deferido
            </q-chip>

            <q-chip
              v-else-if="props.row.status === 'Indeferido'"
              color="negative"
              text-color="white"
              icon="cancel"
            >
              Indeferido
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
            <q-btn flat round color="primary" icon="visibility" @click="viewRequest(props.row)">
              <q-tooltip>Visualizar</q-tooltip>
            </q-btn>

            <q-btn
              flat
              round
              color="warning"
              icon="edit"
              :disable="!canEdit(props.row)"
              @click="editRequest(props.row.id)"
            >
              <q-tooltip>Editar</q-tooltip>
            </q-btn>

            <q-btn
              flat
              round
              color="negative"
              icon="delete"
              :disable="!canDelete(props.row)"
              @click="confirmDelete(props.row)"
            >
              <q-tooltip>Excluir</q-tooltip>
            </q-btn>
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

    <!-- Modal -->
    <q-dialog v-model="detailsDialog">
      <q-card style="min-width: 800px; max-width: 1000px">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">Detalhes da Solicitação</div>
        </q-card-section>

        <q-card-section class="q-pa-lg">
          <div class="row q-col-gutter-lg">
            <div class="col-12">
              <div class="field-label">ID</div>
              <div class="field-value uid-text">
                {{ selectedRequest?.id }}
              </div>
            </div>

            <div class="col-6">
              <div class="field-label">Produto</div>
              <div class="field-value">
                {{ selectedRequest?.produto }}
              </div>
            </div>

            <div class="col-6">
              <div class="field-label">Quantidade</div>
              <div class="field-value">
                {{ selectedRequest?.quantidade }}
              </div>
            </div>

            <div class="col-6">
              <div class="field-label">Valor</div>
              <div class="field-value">
                {{
                  Number(selectedRequest?.valor || 0).toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })
                }}
              </div>
            </div>

            <div class="col-6">
              <div class="field-label">Pagamento</div>
              <div class="field-value">
                {{ selectedRequest?.pagamento }}
              </div>
            </div>

            <div class="col-6">
              <div class="field-label">Vendedor</div>
              <div class="field-value">
                {{ selectedRequest?.vendedor }}
              </div>
            </div>

            <div class="col-6">
              <div class="field-label">Link</div>

              <a :href="selectedRequest?.link" target="_blank" class="text-primary">
                Abrir produto
              </a>
            </div>

            <div class="col-6">
              <div class="field-label">Solicitante</div>
              <div class="field-value">
                {{ selectedRequest?.solicitante }}
              </div>
            </div>

            <div class="col-6">
              <div class="field-label">Setor</div>
              <div class="field-value">
                {{ selectedRequest?.setor }}
              </div>
            </div>

            <div class="col-6">
              <div class="field-label">Status</div>
              <div class="field-value">
                {{ selectedRequest?.status }}
              </div>
            </div>

            <div class="col-6">
              <div class="field-label">Etapa</div>
              <div class="field-value">
                {{ selectedRequest?.etapa }}
              </div>
            </div>

            <div class="col-6">
              <div class="field-label">Eletrônico</div>
              <div class="field-value">
                {{ selectedRequest?.eletronico === 'sim' ? 'Sim' : 'Não' }}
              </div>
            </div>

            <div class="col-6">
              <div class="field-label">Data de Criação</div>

              <div class="field-value">
                {{ formatDate(selectedRequest?.createdAt) }}
              </div>
            </div>

            <div class="col-6">
              <div class="field-label">Última Atualização</div>

              <div class="field-value">
                {{ formatDate(selectedRequest?.updatedAt) }}
              </div>
            </div>

            <div class="col-12">
              <div class="field-label">Justificativa</div>

              <q-card flat bordered>
                <q-card-section>
                  {{ selectedRequest?.justificativa }}
                </q-card-section>
              </q-card>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Fechar" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Dialog } from 'quasar'

import useApi from 'src/composables/UseApi.js'
import useAuthUser from 'src/composables/UseAuthUser.js'
import useNotify from 'src/composables/UseNotify.js'

const router = useRouter()

const api = useApi()

const { user, profile } = useAuthUser()

const { notifyError, notifySuccess } = useNotify()

const loading = ref(false)
const rows = ref([])
const search = ref('')

const detailsDialog = ref(false)
const selectedRequest = ref(null)

const columns = [
  {
    name: 'produto',
    label: 'Produto',
    field: 'produto',
    align: 'left',
    sortable: true,
  },
  {
    name: 'valor',
    label: 'Valor',
    field: 'valor',
    align: 'right',
    sortable: true,
  },
  {
    name: 'solicitante',
    label: 'Solicitante',
    field: 'solicitante',
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

const stats = computed(() => ({
  total: rows.value.length,
  pendentes: rows.value.filter((item) => item.status === 'Pendente análise').length,
  orcamento: rows.value.filter((item) => item.status === 'Em orçamento').length,
  deferidos: rows.value.filter((item) => item.status === 'Deferido').length,
}))

const filteredRows = computed(() => {
  if (!search.value) return rows.value

  return rows.value.filter((item) =>
    item.produto?.toLowerCase().includes(search.value.toLowerCase()),
  )
})

const loadRequests = async () => {
  loading.value = true

  try {
    const data = await api.list('compras')

    if (profile.value?.role === 'admin') {
      rows.value = data
      return
    }

    if (profile.value?.role === 'gestor') {
      rows.value = data.filter((item) => item.setor === profile.value.setor)
      return
    }

    rows.value = data.filter((item) => item.userId === user.value?.uid)
  } catch {
    notifyError('Erro ao carregar solicitações')
  } finally {
    loading.value = false
  }
}

const goToNewRequest = () => {
  router.push('/app/buy/new-request')
}

const editRequest = (id) => {
  router.push(`/app/buy/edit-request/${id}`)
}

const viewRequest = (row) => {
  selectedRequest.value = row
  detailsDialog.value = true
}

const canEdit = (row) => row.status === 'Pendente análise'

const canDelete = (row) => row.status === 'Pendente análise'

const deleteRequest = async (row) => {
  try {
    await api.remove('compras', row.id)

    rows.value = rows.value.filter((item) => item.id !== row.id)

    notifySuccess('Solicitação excluída com sucesso')
  } catch {
    notifyError('Erro ao excluir solicitação')
  }
}

const confirmDelete = (row) => {
  Dialog.create({
    title: 'Excluir Solicitação',
    message: 'Deseja realmente excluir esta solicitação?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    deleteRequest(row)
  })
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
```
