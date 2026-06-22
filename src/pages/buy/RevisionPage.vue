<template>
  <q-page class="page-container">
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
              <div class="text-h6 text-weight-bold">Revisão de Solicitações</div>

              <div class="text-caption text-grey-7">Revise e envie solicitações para análise</div>
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

        <!-- PRODUTO + SOLICITANTE -->
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

        <!-- SETOR -->
        <template #body-cell-setorNome="props">
          <q-td :props="props">
            {{ props.row.setorNome }}
          </q-td>
        </template>

        <!-- VALOR -->
        <template #body-cell-valorTotal="props">
          <q-td :props="props">
            {{ formatMoney(props.row.valorTotal) }}
          </q-td>
        </template>

        <!-- Data -->
        <template #body-cell-createdAt="props">
          <q-td :props="props">
            {{ formatDate(props.row.createdAt) }}
          </q-td>
        </template>

        <!-- AÇÕES -->
        <template #body-cell-actions="props">
          <q-td :props="props">
            <q-btn
              color="primary"
              icon="visibility"
              label="Revisar"
              size="sm"
              unelevated
              @click="goToReview(props.row)"
            />
          </q-td>
        </template>

        <!-- NO DATA -->
        <template #no-data>
          <div class="full-width row flex-center q-pa-xl text-grey">
            <q-icon name="assignment_late" size="40px" class="q-mr-sm" />
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

import useRequests from 'src/composables/UseRequests'
import { REQUEST_STATUS } from 'src/constants/requestStatus'

const router = useRouter()
const { getRequests } = useRequests()

const loading = ref(false)
const rows = ref([])
const search = ref('')

const columns = [
  { name: 'requestNumber', label: 'Número', field: 'requestNumber', align: 'left', sortable: true },
  { name: 'titulo', label: 'Produto', field: 'titulo', align: 'left', sortable: true },
  { name: 'setorNome', label: 'Setor', field: 'setorNome', align: 'center', sortable: true },
  { name: 'valorTotal', label: 'Valor', field: 'valorTotal', align: 'center', sortable: true },
  { name: 'createdAt', label: 'Data', field: 'createdAt', align: 'center', sortable: true },
  { name: 'actions', label: 'Ações', field: 'actions', align: 'center' },
]

const filteredRows = computed(() => {
  if (!search.value) return rows.value

  return rows.value.filter((item) =>
    item.titulo?.toLowerCase().includes(search.value.toLowerCase()),
  )
})

// 🚀 NAVEGAÇÃO NOVA
const goToReview = (request) => {
  router.push(`/app/buy/revisiondetail/${request.id}?mode=review`)
}

const loadRequests = async () => {
  loading.value = true

  try {
    const requests = await getRequests()

    rows.value = requests.filter((item) => item.status === REQUEST_STATUS.REVISION)
  } finally {
    loading.value = false
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

const formatMoney = (value) => {
  return Number(value || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
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

:deep(.q-table tbody tr:last-child td) {
  border-bottom: none;
}
</style>
