<template>
  <q-page padding>
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h5">Cadastro de Usuários</div>

      <q-btn color="primary" icon="add" label="Novo Usuário" @click="goToNew" />
    </div>

    <q-card flat bordered>
      <q-card-section>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-4">
            <q-input v-model="filter" outlined dense label="Pesquisar" clearable />
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <q-table
        :rows="users"
        :columns="columns"
        row-key="id"
        :filter="filter"
        flat
        :loading="loading"
      >
        <!-- STATUS -->
        <template #body-cell-status="props">
          <q-td :props="props">
            <q-chip :color="props.row.ativo ? 'positive' : 'negative'" text-color="white">
              {{ props.row.ativo ? 'Ativo' : 'Inativo' }}
            </q-chip>
          </q-td>
        </template>

        <!-- PERMISSÕES -->
        <template #body-cell-permissions="props">
          <q-td :props="props">
            <q-chip color="primary" text-color="white">
              {{ getPermissionsCount(props.row.roleId) }}
            </q-chip>
          </q-td>
        </template>

        <!-- AÇÕES -->
        <template #body-cell-actions="props">
          <q-td :props="props">
            <q-btn flat round icon="edit" color="primary" @click="goToEdit(props.row.id)" />
          </q-td>
        </template>
      </q-table>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import useApi from 'src/composables/UseApi.js'

const api = useApi()
const router = useRouter()

const filter = ref('')
const users = ref([])
const roles = ref([])
const loading = ref(false)

const columns = [
  { name: 'nome', label: 'Nome', field: 'nome', align: 'left' },
  { name: 'email', label: 'Email', field: 'email', align: 'left' },
  { name: 'setor', label: 'Setor', field: 'setor', align: 'left' },
  { name: 'role', label: 'Tipo', field: 'role', align: 'left' },
  { name: 'permissions', label: 'Permissões', align: 'center' },
  { name: 'status', label: 'Status', align: 'center' },
  { name: 'actions', label: 'Ações', align: 'center' },
]

const loadData = async () => {
  try {
    loading.value = true

    // 🔥 usando seu useApi corretamente (Firestore)
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

onMounted(() => {
  loadData()
})
</script>
