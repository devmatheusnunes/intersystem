<template>
  <q-page class="page-container">
    <!-- KPI -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-md">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-caption text-grey">Total</div>
            <div class="text-h5 text-weight-bold">
              {{ rows.length }}
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-caption text-grey">Aguardando Compra</div>
            <div class="text-h5 text-warning text-weight-bold">
              {{ pendingPaymentCount }}
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
        <!-- HEADER -->
        <template #top>
          <div class="row items-center full-width q-gutter-md">
            <div>
              <div class="text-h6 text-weight-bold">Pagamentos</div>
              <div class="text-caption text-grey-7">Solicitações deferidas prontas para compra</div>
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

        <!-- BODY -->
        <template #body="props">
          <q-tr :props="props">
            <q-td key="requestNumber" :props="props">
              {{ props.row.requestNumber }}
            </q-td>

            <!-- PRODUTO -->
            <q-td key="titulo" :props="props" class="text-left">
              <div class="text-weight-medium">
                {{ props.row.titulo }}
              </div>

              <div class="text-caption text-grey-7">
                {{ props.row.solicitanteNome }}
              </div>
            </q-td>

            <!-- SETOR -->
            <q-td key="setorNome" :props="props">
              {{ props.row.setorNome }}
            </q-td>

            <!-- VALOR -->
            <q-td key="valorTotal" :props="props">
              {{ formatCurrency(props.row.valorTotal) }}
            </q-td>

            <!-- STATUS -->
            <q-td key="status" :props="props">
              <q-chip
                v-if="!props.row.pagamento?.comprado"
                color="warning"
                text-color="white"
                icon="schedule"
              >
                Aguardando Compra
              </q-chip>

              <q-chip v-else color="positive" text-color="white" icon="check"> Comprado </q-chip>
            </q-td>

            <!-- PRODUTO -->
            <q-td key="produtoUrl" :props="props">
              <q-btn
                flat
                dense
                color="primary"
                icon="open_in_new"
                @click="openProduct(props.row.produtoUrl)"
              />
            </q-td>

            <!-- AÇÕES -->
            <q-td key="actions" :props="props">
              <q-btn
                v-if="!props.row.pagamento?.comprado"
                color="primary"
                icon="shopping_cart"
                label="Finalizar Compra"
                size="sm"
                unelevated
                @click="goToPayment(props.row)"
              />
            </q-td>
          </q-tr>
        </template>

        <!-- NO DATA -->
        <template #no-data>
          <div class="full-width row flex-center q-pa-xl text-grey">
            <q-icon name="payments" size="40px" class="q-mr-sm" />
            Nenhum pagamento encontrado
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
  { name: 'setorNome', label: 'Setor', field: 'setorNome', align: 'left', sortable: true },
  { name: 'valorTotal', label: 'Valor Total', field: 'valorTotal', align: 'left', sortable: true },
  { name: 'status', label: 'Status', field: 'status', align: 'left', sortable: true },
  { name: 'produtoUrl', label: 'Produto', field: 'produtoUrl', align: 'left', sortable: true },
  { name: 'actions', label: 'Ações', field: 'actions', align: 'left' },
]

const filteredRows = computed(() => {
  if (!search.value) return rows.value

  return rows.value.filter((item) =>
    item.titulo?.toLowerCase().includes(search.value.toLowerCase()),
  )
})

const goToPayment = (row) => {
  router.push(`/app/buy/paymentdetail/${row.id}`)
}

/* KPI */
const pendingPaymentCount = computed(() => rows.value.filter((r) => !r.pagamento?.comprado).length)

/* LOAD */
const loadRequests = async () => {
  loading.value = true

  try {
    const all = await getRequests()

    // apenas DEFERIDOS
    rows.value = all.filter((r) => r.status === REQUEST_STATUS.APPROVED)
  } finally {
    loading.value = false
  }
}

/* UTILS */
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

.table-card {
  border-radius: 14px;
  overflow: hidden;
}

.q-table {
  width: 100%;
}
</style>
