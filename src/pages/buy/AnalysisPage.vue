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
            <div class="text-h5 text-analysis text-weight-bold">
              {{ pendingCount }}
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-3">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-caption text-grey">Em Reanálise</div>
            <div class="text-h5 text-reanalysis text-weight-bold">
              {{ reanalysisCount }}
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-3">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-caption text-grey">Em Espera</div>
            <div class="text-h5 text-waiting text-weight-bold">
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

        <!-- 🔥 BODY CUSTOM -->
        <template #body="props">
          <q-tr :props="props" :class="getRowClass(props.row)">
            <!-- PRODUTO -->
            <q-td key="titulo" :props="props" class="text-left">
              <div class="row items-center q-gutter-sm text-weight-medium">
                <!-- ÍCONE -->
                <q-icon
                  v-if="isUrgent(props.row)"
                  name="priority_high"
                  color="negative"
                  size="18px"
                />

                <!-- TEXTO -->
                <span>{{ props.row.titulo }}</span>

                <!-- BADGE -->
                <q-badge
                  v-if="isUrgent(props.row)"
                  color="negative"
                  text-color="white"
                  label="URGENTE"
                  class="q-ml-xs pulse-badge"
                />
              </div>

              <div class="text-caption text-grey-7">
                {{ props.row.solicitanteNome }}
              </div>
            </q-td>

            <q-td key="setorNome" :props="props">
              {{ props.row.setorNome }}
            </q-td>

            <q-td key="valorTotal" :props="props">
              {{ formatCurrency(props.row.valorTotal) }}
            </q-td>

            <q-td key="status" :props="props">
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

            <q-td key="produtoUrl" :props="props">
              <q-btn
                flat
                dense
                color="primary"
                icon="open_in_new"
                @click="openProduct(props.row.produtoUrl)"
              />
            </q-td>

            <q-td key="actions" :props="props">
              <q-btn
                color="primary"
                icon="visibility"
                label="Analisar"
                size="sm"
                unelevated
                @click="goToAnalysis(props.row)"
              />
            </q-td>
          </q-tr>
        </template>

        <!-- NO DATA -->
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
import useRequests from 'src/composables/UseRequests'
import { REQUEST_STATUS } from 'src/constants/requestStatus'

import { useRouter } from 'vue-router'

const router = useRouter()

const goToAnalysis = (row) => {
  router.push(`/app/buy/analysisdetail/${row.id}`)
}

const { getRequests } = useRequests()

const loading = ref(false)
const rows = ref([])
const search = ref('')

const columns = [
  { name: 'titulo', label: 'Produto', field: 'titulo', align: 'left' },
  { name: 'setorNome', label: 'Setor', field: 'setorNome', align: 'left' },
  { name: 'valorTotal', label: 'Valor Total', field: 'valorTotal', align: 'left' },
  { name: 'status', label: 'Status', field: 'status', align: 'left' },
  { name: 'produtoUrl', label: 'Produto', field: 'produtoUrl', align: 'left' },
  { name: 'actions', label: 'Ações', field: 'actions', align: 'left' },
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

/* 🔥 DETECÇÃO REAL DE URGÊNCIA (ALINHADO AO BACKEND) */
const isUrgent = (row) => {
  return row.prioridadeAnalise === true
}

/* 🔥 CLASSE */
const getRowClass = (row) => {
  return isUrgent(row) ? 'urgent-row' : ''
}

/* 🔥 DATA */
const parseDate = (value) => {
  if (!value) return new Date(0)
  if (typeof value?.toDate === 'function') return value.toDate()
  const d = new Date(value)
  return isNaN(d.getTime()) ? new Date(0) : d
}

/* 🔥 LOAD */
const loadRequests = async () => {
  loading.value = true

  try {
    const all = await getRequests()

    const filtered = all.filter((r) =>
      [REQUEST_STATUS.PENDING_ANALYSIS, REQUEST_STATUS.REANALYSIS, REQUEST_STATUS.WAITING].includes(
        r.status,
      ),
    )

    rows.value = filtered.sort((a, b) => {
      // 🔥 prioridade primeiro
      if (isUrgent(a) && !isUrgent(b)) return -1
      if (!isUrgent(a) && isUrgent(b)) return 1

      // 🔥 mais recente primeiro
      const dateA = parseDate(a.prioridadeData || a.updatedAt || a.createdAt)
      const dateB = parseDate(b.prioridadeData || b.updatedAt || b.createdAt)

      return dateB - dateA
    })
  } finally {
    loading.value = false
  }
}

const openProduct = (url) => {
  if (!url) return
  window.open(url.startsWith('http') ? url : `https://${url}`)
}

const formatCurrency = (value) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(value || 0))

onMounted(loadRequests)
</script>

<style scoped>
.page-container {
  padding: 24px;
  background: #f5f7fb;
}

/* 🔥 LINHA DESTACADA */
.urgent-row {
  background: #fff7f7;
  border-left: 4px solid #ef4444;
  transition: all 0.3s ease;
}

/* 🔥 HOVER MELHOR */
.urgent-row:hover {
  background: #ffecec;
}

/* 🔥 BADGE ANIMAÇÃO SUAVE */
.pulse-badge {
  animation: pulseBadge 1.8s infinite;
}

@keyframes pulseBadge {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}
</style>
