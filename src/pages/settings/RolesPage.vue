<template>
  <q-page class="q-pa-md">

    <div class="row items-center justify-between q-mb-lg">
      <div>
        <div class="text-h5 text-weight-bold">
          Tipos de Usuários
        </div>

        <div class="text-grey-7">
          Gerenciamento de perfis e permissões
        </div>
      </div>

      <q-btn
        color="primary"
        icon="add"
        label="Novo Tipo"
        @click="newRole"
      />
    </div>

    <div class="row q-col-gutter-md q-mb-md">

      <div class="col-12 col-md-3">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-caption text-grey">
              Total de Perfis
            </div>

            <div class="text-h5 text-weight-bold">
              {{ rows.length }}
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-3">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-caption text-grey">
              Ativos
            </div>

            <div class="text-h5 text-positive text-weight-bold">
              {{ activeCount }}
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-3">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-caption text-grey">
              Inativos
            </div>

            <div class="text-h5 text-negative text-weight-bold">
              {{ inactiveCount }}
            </div>
          </q-card-section>
        </q-card>
      </div>

    </div>

    <q-card flat bordered>

      <q-card-section>
        <q-input
          v-model="search"
          outlined
          dense
          clearable
          debounce="300"
          label="Pesquisar perfil"
        >
          <template #prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </q-card-section>

      <q-separator />

      <q-table
        flat
        row-key="id"
        :rows="filteredRows"
        :columns="columns"
        :loading="loading"
      >

        <template #body-cell-permissions="props">
          <q-td :props="props">

            <q-chip
              dense
              color="primary"
              text-color="white"
            >
              {{ props.row.permissions?.length || 0 }}
            </q-chip>

          </q-td>
        </template>

        <template #body-cell-visibilityType="props">
          <q-td :props="props">

            <q-chip
              dense
              color="info"
              text-color="white"
            >
              {{ visibilityLabel(props.row.visibilityType) }}
            </q-chip>

          </q-td>
        </template>

        <template #body-cell-ativo="props">
          <q-td :props="props">

            <q-chip
              dense
              :color="props.row.ativo ? 'positive' : 'negative'"
              text-color="white"
            >
              {{ props.row.ativo ? 'Ativo' : 'Inativo' }}
            </q-chip>

          </q-td>
        </template>

        <template #body-cell-createdAt="props">
          <q-td :props="props">
            {{ formatDate(props.row.createdAt) }}
          </q-td>
        </template>

        <template #body-cell-actions="props">
          <q-td :props="props">

            <q-btn
              flat
              round
              dense
              color="info"
              icon="visibility"
              @click="viewRole(props.row)"
            />

            <q-btn
              flat
              round
              dense
              color="primary"
              icon="edit"
              @click="editRole(props.row.id)"
            />

            <q-btn
              flat
              round
              dense
              color="negative"
              icon="delete"
              @click="removeRole(props.row)"
            />

          </q-td>
        </template>

      </q-table>

    </q-card>

    <q-dialog v-model="detailsDialog">

      <q-card style="width:700px;max-width:95vw">

        <q-card-section class="bg-primary text-white">
          <div class="text-h6">
            Detalhes do Perfil
          </div>
        </q-card-section>

        <q-card-section>

          <div class="row q-col-gutter-md">

            <div class="col-12">
              <div class="text-caption text-grey">
                Nome
              </div>

              <div class="text-subtitle1">
                {{ selectedRole?.nome }}
              </div>
            </div>

            <div class="col-12">
              <div class="text-caption text-grey">
                Descrição
              </div>

              <div>
                {{ selectedRole?.descricao }}
              </div>
            </div>

            <div class="col-12">
              <div class="text-caption text-grey">
                Visibilidade
              </div>

              <div>
                {{ visibilityLabel(selectedRole?.visibilityType) }}
              </div>
            </div>

            <div class="col-12">

              <div class="text-caption text-grey q-mb-sm">
                Permissões
              </div>

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

        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            flat
            label="Fechar"
            v-close-popup
          />
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
  {
    name: 'nome',
    label: 'Nome',
    field: 'nome',
    sortable: true,
    align: 'left',
  },
  {
    name: 'descricao',
    label: 'Descrição',
    field: 'descricao',
    align: 'left',
  },
  {
    name: 'permissions',
    label: 'Permissões',
    align: 'center',
  },
  {
    name: 'visibilityType',
    label: 'Visibilidade',
    align: 'center',
  },
  {
    name: 'ativo',
    label: 'Status',
    align: 'center',
  },
  {
    name: 'createdAt',
    label: 'Criado em',
    align: 'center',
  },
  {
    name: 'actions',
    label: 'Ações',
    align: 'center',
  },
]

const filteredRows = computed(() => {
  if (!search.value) return rows.value

  const term = search.value.toLowerCase()

  return rows.value.filter(
    item =>
      item.nome?.toLowerCase().includes(term) ||
      item.descricao?.toLowerCase().includes(term),
  )
})

const activeCount = computed(
  () => rows.value.filter(item => item.ativo).length,
)

const inactiveCount = computed(
  () => rows.value.filter(item => !item.ativo).length,
)

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
  try {
    const confirmed = confirm(
      `Deseja excluir "${role.nome}"?`,
    )

    if (!confirmed) return

    await api.remove('roles', role.id)

    notifySuccess('Perfil removido com sucesso')

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

  const value =
    typeof date?.toDate === 'function'
      ? date.toDate()
      : new Date(date)

  return value.toLocaleDateString('pt-BR')
}

onMounted(loadData)
</script>

<style scoped>
.q-table th {
  font-weight: 600;
}
</style>
