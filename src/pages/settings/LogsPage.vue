<template>
  <q-page padding>
    <div class="row items-center justify-between q-mb-md">
      <div>
        <div class="text-h5">Logs do Sistema</div>
        <div class="text-caption text-grey-7">Histórico de ações realizadas pelos usuários</div>
      </div>
    </div>

    <q-card flat bordered>
      <q-card-section>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-4">
            <q-input v-model="filters.search" outlined dense label="Pesquisar" clearable />
          </div>

          <div class="col-12 col-md-3">
            <q-select
              v-model="filters.module"
              outlined
              dense
              label="Módulo"
              :options="modules"
              clearable
            />
          </div>

          <div class="col-12 col-md-3">
            <q-select
              v-model="filters.action"
              outlined
              dense
              label="Ação"
              :options="actions"
              clearable
            />
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <q-table flat :rows="logs" :columns="columns" row-key="id" :loading="loading">
        <template #body-cell-action="props">
          <q-td :props="props">
            <q-chip dense :color="actionColor(props.value)" text-color="white">
              {{ props.value }}
            </q-chip>
          </q-td>
        </template>

        <template #body-cell-createdAt="props">
          <q-td :props="props">
            {{ formatDate(props.value) }}
          </q-td>
        </template>
      </q-table>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import useApi from 'src/composables/UseApi'

const api = useApi()

const loading = ref(false)

const logs = ref([])

const filters = ref({
  search: '',
  module: null,
  action: null,
})

const modules = ['Usuários', 'Solicitações', 'Compras', 'Configurações']

const actions = ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'APPROVE', 'REJECT']

const columns = [
  {
    name: 'createdAt',
    label: 'Data',
    field: 'createdAt',
    align: 'left',
  },
  {
    name: 'userName',
    label: 'Usuário',
    field: 'userName',
    align: 'left',
  },
  {
    name: 'module',
    label: 'Módulo',
    field: 'module',
    align: 'left',
  },
  {
    name: 'action',
    label: 'Ação',
    field: 'action',
    align: 'center',
  },
  {
    name: 'description',
    label: 'Descrição',
    field: 'description',
    align: 'left',
  },
]

const loadLogs = async () => {
  loading.value = true

  try {
    logs.value = await api.list('logs')
  } finally {
    loading.value = false
  }
}

const actionColor = (action) => {
  const colors = {
    CREATE: 'positive',
    UPDATE: 'primary',
    DELETE: 'negative',
    LOGIN: 'secondary',
    APPROVE: 'green',
    REJECT: 'red',
  }

  return colors[action] || 'grey'
}

const formatDate = (date) => {
  if (!date) return ''

  return new Date(date.seconds ? date.seconds * 1000 : date).toLocaleString('pt-BR')
}

onMounted(loadLogs)
</script>

import useApi from './UseApi' import useAuthUser from './UseAuthUser' export default function
useSystemLog() { const api = useApi() const { profile } = useAuthUser() const addLog = async ({
module, action, description, metadata = {}, }) => { await api.post('logs', { userId:
profile.value?.id, userName: profile.value?.nome, module, action, description, metadata, createdAt:
new Date(), }) } return { addLog, } }
