<template>
  <q-page class="page-container">
    <!-- KPIs -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-sm-6 col-md-4">
        <q-card flat bordered class="kpi-card">
          <q-card-section>
            <div class="text-caption text-grey-7">Total</div>
            <div class="text-h4 text-weight-bold">
              {{ stats.total }}
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-4">
        <q-card flat bordered class="kpi-card">
          <q-card-section>
            <div class="text-caption text-grey-7">Ativos</div>
            <div class="text-h4 text-positive text-weight-bold">
              {{ stats.ativos }}
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-4">
        <q-card flat bordered class="kpi-card">
          <q-card-section>
            <div class="text-caption text-grey-7">Inativos</div>
            <div class="text-h4 text-negative text-weight-bold">
              {{ stats.inativos }}
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- TABELA -->
    <q-card flat bordered class="table-card">
      <q-table
        flat
        :rows="filteredUsers"
        :columns="columns"
        row-key="id"
        :loading="loading"
        :pagination="{ rowsPerPage: 10 }"
      >
        <!-- TOP -->
        <template #top>
          <div class="row items-center full-width q-gutter-md">
            <div>
              <div class="text-h6 text-weight-bold">Usuários</div>

              <div class="text-caption text-grey-7">Gerencie os usuários do sistema</div>
            </div>

            <q-space />

            <q-input
              v-model="filter"
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

            <q-btn color="dark" icon="add" label="Novo Usuário" unelevated @click="goToNew" />
          </div>
        </template>

        <!-- Nome + Email -->
        <template #body-cell-nome="props">
          <q-td :props="props">
            <div class="text-weight-medium">
              {{ props.row.nome }}
            </div>

            <div class="text-caption text-grey-7">
              {{ props.row.email }}
            </div>
          </q-td>
        </template>

        <!-- Setor -->
        <template #body-cell-setor="props">
          <q-td :props="props">
            {{ props.row.setor }}
          </q-td>
        </template>

        <!-- Tipo -->
        <template #body-cell-role="props">
          <q-td :props="props">
            {{ props.row.role }}
          </q-td>
        </template>

        <!-- Permissões -->
        <template #body-cell-permissions="props">
          <q-td :props="props">
            <q-chip color="primary" text-color="white">
              {{ getPermissionsCount(props.row.roleId) }}
            </q-chip>
          </q-td>
        </template>

        <!-- Status -->
        <template #body-cell-status="props">
          <q-td :props="props">
            <q-chip :color="props.row.ativo ? 'positive' : 'negative'" text-color="white" dense>
              {{ props.row.ativo ? 'Ativo' : 'Inativo' }}
            </q-chip>
          </q-td>
        </template>

        <!-- Ações -->
        <template #body-cell-actions="props">
          <q-td :props="props">
            <q-btn flat round color="primary" icon="edit" @click="goToEdit(props.row.id)">
              <q-tooltip>Editar</q-tooltip>
            </q-btn>
          </q-td>
        </template>

        <!-- No data -->
        <template #no-data>
          <div class="full-width row flex-center q-pa-xl text-grey">
            <q-icon name="people" size="40px" class="q-mr-sm" />
            Nenhum usuário encontrado
          </div>
        </template>
      </q-table>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import useApi from 'src/composables/UseApi.js'

const api = useApi()
const router = useRouter()

const filter = ref('')
const users = ref([])
const roles = ref([])
const loading = ref(false)

const columns = [
  { name: 'nome', label: 'Usuário', field: 'nome', align: 'left' },
  { name: 'setor', label: 'Setor', field: 'setor' },
  { name: 'role', label: 'Tipo', field: 'role' },
  { name: 'permissions', label: 'Permissões', align: 'center' },
  { name: 'status', label: 'Status', align: 'center' },
  { name: 'actions', label: 'Ações', align: 'center' },
]

const stats = computed(() => ({
  total: users.value.length,
  ativos: users.value.filter((u) => u.ativo).length,
  inativos: users.value.filter((u) => !u.ativo).length,
}))

const filteredUsers = computed(() => {
  if (!filter.value) return users.value

  return users.value.filter(
    (user) =>
      user.nome?.toLowerCase().includes(filter.value.toLowerCase()) ||
      user.email?.toLowerCase().includes(filter.value.toLowerCase()),
  )
})

const loadData = async () => {
  try {
    loading.value = true

    const usersData = await api.list('users')
    const rolesData = await api.list('roles')

    users.value = usersData
    roles.value = rolesData
  } catch (error) {
    console.error('Erro ao carregar dados:', error)
  } finally {
    loading.value = false
  }
}

const getPermissionsCount = (roleId) => {
  const role = roles.value.find((r) => r.id === roleId)
  return role?.permissions?.length || 0
}

const goToNew = () => {
  router.push('/app/settings/new-perfil')
}

const goToEdit = (id) => {
  router.push(`/app/settings/edit-perfil/${id}`)
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

:deep(.q-table tbody tr:last-child td) {
  border-bottom: none;
}
</style>
