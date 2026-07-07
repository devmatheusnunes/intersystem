<template>
  <q-page class="page-container">
    <!-- KPIs -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-sm-4">
        <q-card flat bordered class="kpi-card">
          <q-card-section>
            <div class="text-caption text-grey-7">Total</div>

            <div class="text-h4 text-weight-bold">
              {{ stats.total }}
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-4">
        <q-card flat bordered class="kpi-card">
          <q-card-section>
            <div class="text-caption text-grey-7">Pedido Realizado</div>

            <div class="text-h4 text-primary text-weight-bold">
              {{ stats.realized }}
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-4">
        <q-card flat bordered class="kpi-card">
          <q-card-section>
            <div class="text-caption text-grey-7">Entregues</div>

            <div class="text-h4 text-positive text-weight-bold">
              {{ stats.delivered }}
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- TABELA -->
    <q-card flat bordered class="table-card">
      <q-table
        flat
        row-key="id"
        :rows="filteredRows"
        :columns="columns"
        :loading="loading"
        :pagination="{ rowsPerPage: 10 }"
      >
        <!-- HEADER -->
        <template #top>
          <div class="row items-center full-width q-gutter-md">
            <div>
              <div class="text-h6 text-weight-bold">Entregas</div>

              <div class="text-caption text-grey-7">Gerencie os pedidos realizados e entregues</div>
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

        <!-- PRODUTO -->
        <template #body-cell-titulo="props">
          <q-td :props="props">
            <div class="text-weight-medium">
              {{ props.row.produto?.titulo }}
            </div>

            <div class="text-caption text-grey-7">
              {{ props.row.solicitante?.nome }}
            </div>
          </q-td>
        </template>

        <!-- VALOR -->
        <template #body-cell-valorTotal="props">
          <q-td :props="props">
            {{
              Number(props.row.financeiro?.valorTotal || 0).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })
            }}
          </q-td>
        </template>

        <!-- STATUS -->
        <template #body-cell-status="props">
          <q-td :props="props">
            <q-chip
              v-if="
                props.row.status === REQUEST_STATUS.REALIZED && hasPermission('tracking.deliver')
              "
              color="primary"
              text-color="white"
              icon="shopping_cart"
            >
              Pedido Realizado
            </q-chip>

            <q-chip
              v-if="
                props.row.status === REQUEST_STATUS.DELIVERED && hasPermission('tracking.finish')
              "
              color="positive"
              text-color="white"
              icon="local_shipping"
            >
              Entregue
            </q-chip>
          </q-td>
        </template>

        <!-- DATA -->
        <template #body-cell-createdAt="props">
          <q-td :props="props">
            {{ formatDate(props.row.createdAt) }}
          </q-td>
        </template>

        <!-- AÇÕES -->
        <template #body-cell-actions="props">
          <q-td :props="props">
            <!-- VISUALIZAR -->
            <q-btn flat round color="primary" icon="visibility" @click="viewDetails(props.row.id)">
              <q-tooltip> Visualizar </q-tooltip>
            </q-btn>

            <!-- ENTREGAR -->
            <q-btn
              v-if="props.row.status === REQUEST_STATUS.REALIZED"
              flat
              round
              color="positive"
              icon="local_shipping"
              @click="confirmDelivery(props.row)"
            >
              <q-tooltip> Confirmar Entrega </q-tooltip>
            </q-btn>

            <!-- FINALIZAR -->
            <q-btn
              v-if="props.row.status === REQUEST_STATUS.DELIVERED"
              flat
              round
              color="dark"
              icon="task_alt"
              @click="confirmFinish(props.row)"
            >
              <q-tooltip> Finalizar Processo </q-tooltip>
            </q-btn>
          </q-td>
        </template>

        <!-- SEM DADOS -->
        <template #no-data>
          <div class="full-width row flex-center q-pa-xl text-grey">
            <q-icon name="inventory_2" size="40px" class="q-mr-sm" />

            Nenhum pedido encontrado
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
import useSystemLog from 'src/composables/UseSystemLog'
import useAuthUser from 'src/composables/UseAuthUser'
import { REQUEST_STATUS } from 'src/constants/requestStatus'
import usePermissions from 'src/composables/UsePermissions'

const router = useRouter()

const { notifySuccess, notifyError } = useNotify()

const { profile } = useAuthUser()

const { hasPermission } = usePermissions()

const { getRequestsByStatuses, deliveredRequest, finishRequest } = useRequests()

const { addLog } = useSystemLog()

const loading = ref(false)

const rows = ref([])

const search = ref('')

const columns = [
  {
    name: 'requestNumber',
    label: 'Número',
    field: 'requestNumber',
    align: 'left',
    sortable: true,
  },
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
    sortable: true,
  },
  {
    name: 'createdAt',
    label: 'Data',
    field: 'createdAt',
    align: 'center',
    sortable: true,
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

  realized: rows.value.filter((r) => r.status === REQUEST_STATUS.REALIZED).length,

  delivered: rows.value.filter((r) => r.status === REQUEST_STATUS.DELIVERED).length,
}))

const filteredRows = computed(() => {
  if (!search.value) return rows.value

  return rows.value.filter((item) =>
    item.titulo?.toLowerCase().includes(search.value.toLowerCase()),
  )
})

const loadRequests = async () => {
  loading.value = true

  try {
    rows.value = await getRequestsByStatuses([REQUEST_STATUS.REALIZED, REQUEST_STATUS.DELIVERED])
  } catch (err) {
    console.error(err)

    notifyError('Erro ao carregar pedidos')
  } finally {
    loading.value = false
  }
}

const viewDetails = (id) => {
  router.push(`/app/buy/details/${id}`)
}

const confirmDelivery = (row) => {
  Dialog.create({
    title: 'Confirmar entrega',
    message: 'Deseja confirmar que este pedido foi entregue?',
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      const before = structuredClone(row)

      const payload = {
        entrega: {
          ...row.entrega,

          data: new Date(),

          usuarioId: profile.value?.userId || profile.value?.id,
          usuarioNome: profile.value?.nome || profile.value?.displayName,
        },
      }

      await deliveredRequest({
        request: row,
        user: profile.value,
        observacao: 'Pedido entregue',
        extraData: payload,
      })

      const after = structuredClone(before)

      Object.assign(after, payload)

      after.status = REQUEST_STATUS.DELIVERED

      await addLog({
        module: 'Entrega',
        action: 'DELIVER',
        description: `Pedido ${row.requestNumber} marcado como entregue`,
        documentId: row.id,
        before,
        after,
      })

      notifySuccess('Pedido marcado como entregue')

      loadRequests()
    } catch (err) {
      console.error(err)
      notifyError('Erro ao confirmar entrega')
    }
  })
}

const confirmFinish = (row) => {
  Dialog.create({
    title: 'Finalizar processo',
    message: 'Deseja finalizar definitivamente este processo?',
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      const before = structuredClone(row)

      const payload = {
        finalizacao: {
          ...row.finalizacao,

          data: new Date(),

          usuarioId: profile.value?.userId || profile.value?.id,
          usuarioNome: profile.value?.nome || profile.value?.displayName,
        },
      }

      await finishRequest({
        request: row,
        user: profile.value,
        observacao: 'Processo finalizado',
        extraData: payload,
      })

      const after = structuredClone(before)

      Object.assign(after, payload)

      after.status = REQUEST_STATUS.FINISHED

      await addLog({
        module: 'Entrega',
        action: 'FINISH',
        description: `Pedido ${row.requestNumber} finalizado`,
        documentId: row.id,
        before,
        after,
      })

      notifySuccess('Processo finalizado')

      loadRequests()
    } catch (err) {
      console.error(err)
      notifyError('Erro ao finalizar processo')
    }
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
