<template>
  <q-page class="page-container">
    <!-- KPI -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-sm-6 col-md-4">
        <q-card flat bordered class="kpi-card">
          <q-card-section>
            <div class="text-caption text-grey-7">Total de Perfis</div>
            <div class="text-h4 text-weight-bold">
              {{ rows.length }}
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-4">
        <q-card flat bordered class="kpi-card">
          <q-card-section>
            <div class="text-caption text-grey-7">Ativos</div>
            <div class="text-h4 text-positive text-weight-bold">
              {{ activeCount }}
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-4">
        <q-card flat bordered class="kpi-card">
          <q-card-section>
            <div class="text-caption text-grey-7">Inativos</div>
            <div class="text-h4 text-negative text-weight-bold">
              {{ inactiveCount }}
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
              <div class="text-h6 text-weight-bold">Perfis de Usuários</div>

              <div class="text-caption text-grey-7">Gerenciamento de perfis e permissões</div>
            </div>

            <q-space />

            <q-input
              v-model="search"
              outlined
              dense
              clearable
              debounce="300"
              placeholder="Pesquisar perfil..."
              style="width: 280px"
            >
              <template #prepend>
                <q-icon name="search" />
              </template>
            </q-input>

            <q-btn color="dark" icon="add" label="Novo Tipo" unelevated @click="newRole" />
          </div>
        </template>

        <!-- Nome + Descrição -->
        <template #body-cell-nome="props">
          <q-td :props="props">
            <div class="text-weight-medium">
              {{ props.row.nome }}
            </div>

            <div class="text-caption text-grey-7">
              {{ props.row.descricao }}
            </div>
          </q-td>
        </template>

        <!-- Permissões -->
        <template #body-cell-permissions="props">
          <q-td :props="props">
            <q-chip color="primary" text-color="white" dense>
              {{ props.row.permissions?.length || 0 }}
            </q-chip>
          </q-td>
        </template>

        <!-- Visibilidade -->
        <template #body-cell-visibilityType="props">
          <q-td :props="props">
            <q-chip color="info" text-color="white" dense>
              {{ visibilityLabel(props.row.visibilityType) }}
            </q-chip>
          </q-td>
        </template>

        <!-- Status -->
        <template #body-cell-ativo="props">
          <q-td :props="props">
            <q-chip :color="props.row.ativo ? 'positive' : 'negative'" text-color="white" dense>
              {{ props.row.ativo ? 'Ativo' : 'Inativo' }}
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
            <q-btn flat round color="info" icon="visibility" @click="viewRole(props.row)" />

            <q-btn flat round color="primary" icon="edit" @click="editRole(props.row.id)" />

            <q-btn flat round color="negative" icon="delete" @click="removeRole(props.row)" />
          </q-td>
        </template>

        <!-- No data -->
        <template #no-data>
          <div class="full-width row flex-center q-pa-xl text-grey">
            <q-icon name="groups" size="40px" class="q-mr-sm" />
            Nenhum perfil encontrado
          </div>
        </template>
      </q-table>
    </q-card>

    <!-- DIALOG -->
    <q-dialog v-model="detailsDialog">
      <q-card style="min-width: 700px; max-width: 95vw; border-radius: 14px">
        <!-- HEADER -->
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">
            {{ selectedRole?.nome }}
          </div>
        </q-card-section>

        <!-- CONTEÚDO -->
        <q-card-section class="q-pa-lg">
          <div class="row q-col-gutter-md">
            <div class="col-12">
              <div class="field-label">Descrição</div>
              <div class="field-value">
                {{ selectedRole?.descricao }}
              </div>
            </div>

            <div class="col-12">
              <div class="field-label">Visibilidade</div>
              <div class="field-value">
                {{ visibilityLabel(selectedRole?.visibilityType) }}
              </div>
            </div>

            <div class="col-12">
              <div class="field-label">Permissões</div>

              <div>
                <q-chip
                  v-for="permission in selectedRole?.permissions || []"
                  :key="permission"
                  color="primary"
                  text-color="white"
                  class="q-ma-xs"
                >
                  {{ permission }}
                </q-chip>
              </div>
            </div>
          </div>
        </q-card-section>

        <!-- FOOTER -->
        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Fechar" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import useApi from 'src/composables/UseApi'
import useNotify from 'src/composables/UseNotify'

const router = useRouter()
const api = useApi()
const { notifySuccess, notifyError } = useNotify()

const loading = ref(false)
const search = ref('')
const rows = ref([])

const detailsDialog = ref(false)
const selectedRole = ref(null)

const columns = [
  { name: 'nome', label: 'Perfil', field: 'nome', align: 'left' },
  { name: 'permissions', label: 'Permissões', align: 'center' },
  { name: 'visibilityType', label: 'Visibilidade', align: 'center' },
  { name: 'ativo', label: 'Status', align: 'center' },
  { name: 'createdAt', label: 'Data', align: 'center' },
  { name: 'actions', label: 'Ações', align: 'center' },
]

const filteredRows = computed(() => {
  if (!search.value) return rows.value

  return rows.value.filter(
    (item) =>
      item.nome?.toLowerCase().includes(search.value.toLowerCase()) ||
      item.descricao?.toLowerCase().includes(search.value.toLowerCase()),
  )
})

const activeCount = computed(() => rows.value.filter((item) => item.ativo).length)

const inactiveCount = computed(() => rows.value.filter((item) => !item.ativo).length)

const loadData = async () => {
  try {
    loading.value = true
    rows.value = await api.list('roles')
  } catch {
    notifyError('Erro ao carregar perfis')
  } finally {
    loading.value = false
  }
}

const newRole = () => {
  router.push('/app/settings/new-role')
}

const editRole = (id) => {
  router.push(`/app/settings/edit-role/${id}`)
}

const viewRole = (role) => {
  selectedRole.value = role
  detailsDialog.value = true
}

const removeRole = async (role) => {
  const confirmed = confirm(`Deseja excluir "${role.nome}"?`)
  if (!confirmed) return

  try {
    await api.remove('roles', role.id)
    notifySuccess('Perfil removido')
    await loadData()
  } catch {
    notifyError('Erro ao remover perfil')
  }
}

const visibilityLabel = (value) => {
  const map = {
    own: 'Somente Próprio',
    sector: 'Meu Setor',
    selected_sectors: 'Setores Específicos',
    all: 'Todos',
  }
  return map[value] || '-'
}

const formatDate = (date) => {
  if (!date) return '-'

  const value = date?.toDate ? date.toDate() : new Date(date)
  return value.toLocaleDateString('pt-BR')
}

onMounted(loadData)
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
