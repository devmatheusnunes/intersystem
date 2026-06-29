<template>
  <q-page class="page-container">
    <div class="row q-col-gutter-md content-area">
      <!-- =========================================
           LISTA
      ========================================== -->
      <div class="col-12 col-lg-5">
        <q-card flat bordered class="panel-card">
          <q-card-section>
            <q-input
              v-model="search"
              outlined
              dense
              clearable
              debounce="300"
              placeholder="Pesquisar logs..."
            >
              <template #prepend>
                <q-icon name="search" />
              </template>
            </q-input>

            <div class="row q-gutter-sm q-mt-md">
              <q-chip
                clickable
                color="primary"
                :outline="filterAction !== null"
                @click="filterAction = null"
              >
                Todos
              </q-chip>

              <q-chip
                clickable
                color="positive"
                :outline="filterAction !== 'CREATE'"
                @click="filterAction = 'CREATE'"
              >
                CREATE
              </q-chip>

              <q-chip
                clickable
                color="warning"
                :outline="filterAction !== 'EDIT'"
                @click="filterAction = 'EDIT'"
              >
                EDIT
              </q-chip>

              <q-chip
                clickable
                color="negative"
                :outline="filterAction !== 'DELETE'"
                @click="filterAction = 'DELETE'"
              >
                DELETE
              </q-chip>
            </div>
          </q-card-section>

          <q-separator />

          <div class="table-wrapper">
            <q-table
              flat
              row-key="id"
              class="logs-table"
              :rows="filteredLogs"
              :columns="logColumns"
              :loading="loading"
              :selected="selectedRows"
              @update:selected="onSelectLog"
              selection="single"
              :pagination="pagination"
              :rows-per-page-options="[10, 20, 30, 50, 100]"
              table-header-class="bg-grey-2 text-weight-bold"
            >
              <template #body-cell-action="props">
                <q-td :props="props">
                  <q-chip dense square :color="actionColor(props.row.action)" text-color="white">
                    {{ props.row.action }}
                  </q-chip>
                </q-td>
              </template>

              <template #body-cell-createdAt="props">
                <q-td :props="props">
                  {{ formatDate(props.row.createdAt) }}
                </q-td>
              </template>
            </q-table>
          </div>
        </q-card>
      </div>

      <!-- =========================================
           DETALHES
      ========================================== -->

      <div class="col-12 col-lg-7">
        <q-card flat bordered class="panel-card">
          <q-card-section class="details-header">
            <div class="text-overline text-grey-7">Registro de Auditoria</div>

            <div class="row items-center justify-between">
              <div class="text-h6 text-weight-bold">
                {{ selectedLog?.module || 'Detalhes do Log' }}
              </div>

              <q-chip
                v-if="selectedLog"
                :color="actionColor(selectedLog.action)"
                text-color="white"
              >
                {{ selectedLog.action }}
              </q-chip>
            </div>
          </q-card-section>

          <q-separator />

          <div class="details-scroll">
            <template v-if="selectedLog">
              <!-- Informações -->

              <q-card flat bordered class="section-card q-ma-md">
                <q-card-section>
                  <div class="section-title">Informações Gerais</div>

                  <div class="row q-col-gutter-lg">
                    <div class="col-6">
                      <div class="field-label">Usuário</div>
                      <div class="field-value">
                        {{ selectedLog.user?.nome }}
                      </div>
                    </div>

                    <div class="col-6">
                      <div class="field-label">Email</div>
                      <div class="field-value">
                        {{ selectedLog.user?.email }}
                      </div>
                    </div>

                    <div class="col-6">
                      <div class="field-label">Módulo</div>
                      <div class="field-value">
                        {{ selectedLog.module }}
                      </div>
                    </div>

                    <div class="col-6">
                      <div class="field-label">Documento</div>
                      <div class="field-value">
                        {{
                          selectedLog.after?.requestNumber ||
                          selectedLog.before?.requestNumber ||
                          '-'
                        }}
                      </div>
                    </div>

                    <div class="col-6">
                      <div class="field-label">Data</div>
                      <div class="field-value">
                        {{ formatDate(selectedLog.createdAt, true) }}
                      </div>
                    </div>

                    <div class="col-12">
                      <div class="field-label">Descrição</div>

                      <div class="field-value">
                        {{ selectedLog.description }}
                      </div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>

              <!-- Alterações -->

              <q-card v-if="selectedLog.changes" flat bordered class="section-card q-ma-md">
                <q-card-section>
                  <div class="section-title">Alterações</div>

                  <q-list separator>
                    <q-item v-for="(change, field) in selectedLog.changes" :key="field">
                      <q-item-section>
                        <q-item-label class="text-weight-bold">
                          {{ field }}
                        </q-item-label>

                        <q-item-label>
                          <div class="row q-col-gutter-md">
                            <div class="col">
                              <q-card flat bordered class="bg-red-1">
                                <q-card-section>
                                  <div class="text-caption">Antes</div>

                                  <div class="text-negative">
                                    {{ change.before }}
                                  </div>
                                </q-card-section>
                              </q-card>
                            </div>

                            <div class="col">
                              <q-card flat bordered class="bg-green-1">
                                <q-card-section>
                                  <div class="text-caption">Depois</div>

                                  <div class="text-positive">
                                    {{ change.after }}
                                  </div>
                                </q-card-section>
                              </q-card>
                            </div>
                          </div>
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-card-section>
              </q-card>

              <!-- Documento -->

              <q-card flat bordered class="section-card q-ma-md">
                <q-card-section>
                  <div class="section-title">Documento Completo</div>

                  <pre class="metadata-view"
                    >{{ prettyMetadata }}
                  </pre>
                </q-card-section>
              </q-card>
            </template>

            <div v-else class="empty-state">
              <q-icon name="history" size="72px" color="grey-5" />

              <div class="text-h6 q-mt-md">Selecione um log</div>

              <div class="text-caption text-grey">
                Clique em um registro para visualizar seus detalhes.
              </div>
            </div>
          </div>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

import useApi from 'src/composables/UseApi'
import useNotify from 'src/composables/UseNotify'

const api = useApi()
const { notifyError } = useNotify()

/* =========================================================
 * ESTADO
 * ======================================================= */

const loading = ref(false)

const logs = ref([])

const selectedLog = ref(null)
const selectedRows = ref([])

const search = ref('')
const filterAction = ref(null)

/* =========================================================
 * PAGINAÇÃO
 * ======================================================= */

const pagination = ref({
  page: 1,
  rowsPerPage: 20,
  sortBy: 'createdAt',
  descending: true,
})

/* =========================================================
 * COLUNAS
 * ======================================================= */

const logColumns = [
  {
    name: 'action',
    label: 'Ação',
    field: 'action',
    align: 'center',
    sortable: true,
  },
  {
    name: 'createdAt',
    label: 'Data',
    field: 'createdAt',
    align: 'center',
    sortable: true,
  },
]

/* =========================================================
 * LOAD
 * ======================================================= */

const loadLogs = async () => {
  loading.value = true

  try {
    const data = await api.list('system_logs')

    logs.value = data.sort((a, b) => parseDate(b.createdAt) - parseDate(a.createdAt))

    if (logs.value.length) {
      selectedLog.value = logs.value[0]
      selectedRows.value = [logs.value[0]]
    }
  } catch (error) {
    console.error(error)
    notifyError('Erro ao carregar logs')
  } finally {
    loading.value = false
  }
}

/* =========================================================
 * HELPERS
 * ======================================================= */

const parseDate = (value) => {
  if (!value) return new Date(0)

  if (typeof value?.toDate === 'function') {
    return value.toDate()
  }

  return new Date(value)
}

const formatDate = (value, withHour = false) => {
  if (!value) return '-'

  const date = parseDate(value)

  return withHour ? date.toLocaleString('pt-BR') : date.toLocaleDateString('pt-BR')
}

const actionColor = (action) => {
  switch (action) {
    case 'CREATE':
      return 'positive'

    case 'EDIT':
      return 'warning'

    case 'DELETE':
      return 'negative'

    case 'LOGIN':
      return 'primary'

    case 'LOGOUT':
      return 'grey'

    case 'VIEW':
      return 'deep-purple'

    default:
      return 'dark'
  }
}

/* =========================================================
 * FILTROS
 * ======================================================= */

const filteredLogs = computed(() => {
  let result = [...logs.value]

  if (filterAction.value) {
    result = result.filter((log) => log.action === filterAction.value)
  }

  if (!search.value) {
    return result
  }

  const text = search.value.toLowerCase()

  return result.filter((log) => {
    const searchable = `
      ${log.action || ''}
      ${log.userName || ''}
      ${log.userEmail || ''}
      ${log.module || ''}
      ${log.description || ''}
      ${log.documentId || ''}
      ${log.metadata?.requestNumber || ''}
      ${JSON.stringify(log.metadata || {})}
      ${JSON.stringify(log.changes || {})}
    `
      .toLowerCase()
      .replace(/\s+/g, ' ')

    return searchable.includes(text)
  })
})

/* =========================================================
 * SELEÇÃO
 * ======================================================= */

const onSelectLog = (rows) => {
  selectedRows.value = rows

  if (rows.length) {
    selectedLog.value = rows[0]
  } else {
    selectedLog.value = null
  }
}

/* =========================================================
 * METADATA FORMATADA
 * ======================================================= */

const prettyMetadata = computed(() => {
  if (!selectedLog.value) return ''

  return JSON.stringify(
    {
      metadata: selectedLog.value.metadata,
      changes: selectedLog.value.changes,
    },
    null,
    2,
  )
})

/* =========================================================
 * INIT
 * ======================================================= */

onMounted(loadLogs)
</script>

<style scoped>
/* ======================================================
   PAGE
====================================================== */

.page-container {
  height: calc(100vh - 60px);
  padding: 20px;
  background: #f5f7fb;
  overflow: hidden;
}

.content-area {
  height: 100%;
}

/* ======================================================
   CARDS
====================================================== */

.panel-card {
  height: calc(100vh - 110px);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ======================================================
   TABELA
====================================================== */

.table-wrapper {
  flex: 1;
  min-height: 0;
}

.logs-table {
  height: 100%;
}

.logs-table :deep(.q-table__container) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.logs-table :deep(.q-table__middle) {
  flex: 1;
  overflow-y: auto;
}

.logs-table :deep(.q-table__top) {
  display: none;
}

.logs-table :deep(.q-table__bottom) {
  flex-shrink: 0;
}

/* ======================================================
   DETALHES
====================================================== */

.details-header {
  background: #fafafa;
  flex-shrink: 0;
}

.details-scroll {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

.section-card {
  border-radius: 10px;
}

.section-title {
  font-size: 14px;
  font-weight: 700;
  color: #374151;
  margin-bottom: 16px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.field-label {
  font-size: 11px;
  color: #6b7280;
  text-transform: uppercase;
  font-weight: 600;
  margin-bottom: 4px;
}

.field-value {
  font-size: 14px;
  font-weight: 500;
  color: #111827;
  word-break: break-word;
}

/* ======================================================
   JSON
====================================================== */

.metadata-view {
  margin: 0;
  padding: 16px;
  border-radius: 8px;
  background: #f8fafc;
  font-size: 12px;
  font-family: Consolas, Monaco, monospace;
  overflow: auto;
  max-height: 350px;
}

/* ======================================================
   EMPTY
====================================================== */

.empty-state {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

/* ======================================================
   SCROLLBAR
====================================================== */

.logs-table :deep(.q-table__middle)::-webkit-scrollbar,
.details-scroll::-webkit-scrollbar,
.metadata-view::-webkit-scrollbar {
  width: 8px;
}

.logs-table :deep(.q-table__middle)::-webkit-scrollbar-thumb,
.details-scroll::-webkit-scrollbar-thumb,
.metadata-view::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 999px;
}

.logs-table :deep(.q-table__middle)::-webkit-scrollbar-thumb:hover,
.details-scroll::-webkit-scrollbar-thumb:hover,
.metadata-view::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* ======================================================
   RESPONSIVO
====================================================== */

@media (max-width: 1024px) {
  .page-container {
    height: auto;
    overflow: auto;
  }

  .panel-card {
    height: 650px;
    margin-bottom: 20px;
  }

  .content-area {
    height: auto;
  }
}
</style>
