<template>
  <q-page class="q-pa-md">
    <div class="row items-center justify-between q-mb-md">
      <div>
        <div class="text-h5 text-weight-bold">Tipos de Usuários</div>

        <div class="text-grey-7">Gerenciamento de perfis e permissões</div>
      </div>

      <q-btn color="primary" icon="add" label="Novo Tipo" @click="openCreateDialog" />
    </div>

    <q-card flat bordered>
      <q-card-section>
        <q-input v-model="search" outlined dense clearable label="Pesquisar" debounce="300">
          <template #prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </q-card-section>

      <q-separator />

      <q-table flat row-key="id" :rows="filteredRows" :columns="columns" :loading="loading">
        <template #body-cell-ativo="props">
          <q-td :props="props">
            <q-chip dense text-color="white" :color="props.row.ativo ? 'positive' : 'negative'">
              {{ props.row.ativo ? 'Ativo' : 'Inativo' }}
            </q-chip>
          </q-td>
        </template>

        <template #body-cell-permissions="props">
          <q-td :props="props">
            <q-chip color="primary" text-color="white" dense>
              {{ props.row.permissions?.length || 0 }}
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
            <q-btn flat round dense icon="edit" color="primary" @click="editItem(props.row)" />

            <q-btn flat round dense icon="delete" color="negative" @click="removeItem(props.row)" />
          </q-td>
        </template>
      </q-table>
    </q-card>

    <q-dialog v-model="dialog" persistent>
      <q-card style="width: 900px; max-width: 95vw">
        <q-card-section>
          <div class="text-h6">
            {{ editing ? 'Editar Tipo de Usuário' : 'Novo Tipo de Usuário' }}
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-input v-model="form.nome" outlined label="Nome" />
            </div>

            <div class="col-12 col-md-6">
              <q-toggle v-model="form.ativo" label="Perfil ativo" />
            </div>

            <div class="col-12">
              <q-input
                v-model="form.descricao"
                outlined
                type="textarea"
                autogrow
                label="Descrição"
              />
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <div class="q-pa-sm">
          <div class="row q-gutter-sm q-mb-lg">
            <q-btn
              color="primary"
              outline
              icon="done_all"
              label="Marcar Todas"
              @click="selectAllPermissions"
            />

            <q-btn
              color="negative"
              outline
              icon="clear_all"
              label="Desmarcar Todas"
              @click="clearAllPermissions"
            />
          </div>

          <!-- DASHBOARD -->

          <q-card flat bordered class="q-mb-md">
            <q-card-section>
              <div class="text-subtitle1 text-weight-bold">Dashboard</div>
            </q-card-section>

            <q-card-section>
              <q-checkbox v-model="form.permissions" val="dashboard.menu" label="Exibir Menu" />

              <q-checkbox v-model="form.permissions" val="dashboard.view" label="Visualizar" />
            </q-card-section>
          </q-card>

          <!-- SOLICITAÇÕES -->

          <q-card flat bordered class="q-mb-md">
            <q-card-section>
              <div class="text-subtitle1 text-weight-bold">Solicitações</div>
            </q-card-section>

            <q-card-section class="row">
              <div class="col-12 col-md-4">
                <q-checkbox v-model="form.permissions" val="requests.menu" label="Exibir Menu" />
              </div>

              <div class="col-12 col-md-4">
                <q-checkbox v-model="form.permissions" val="requests.view" label="Visualizar" />
              </div>

              <div class="col-12 col-md-4">
                <q-checkbox v-model="form.permissions" val="requests.create" label="Criar" />
              </div>

              <div class="col-12 col-md-4">
                <q-checkbox v-model="form.permissions" val="requests.edit" label="Editar" />
              </div>

              <div class="col-12 col-md-4">
                <q-checkbox v-model="form.permissions" val="requests.delete" label="Excluir" />
              </div>
            </q-card-section>
          </q-card>

          <!-- ANÁLISES -->

          <q-card flat bordered class="q-mb-md">
            <q-card-section>
              <div class="text-subtitle1 text-weight-bold">Análises</div>
            </q-card-section>

            <q-card-section class="row">
              <div class="col-12 col-md-4">
                <q-checkbox v-model="form.permissions" val="analysis.menu" label="Exibir Menu" />
              </div>

              <div class="col-12 col-md-4">
                <q-checkbox v-model="form.permissions" val="analysis.view" label="Visualizar" />
              </div>

              <div class="col-12 col-md-4">
                <q-checkbox v-model="form.permissions" val="analysis.approve" label="Aprovar" />
              </div>

              <div class="col-12 col-md-4">
                <q-checkbox v-model="form.permissions" val="analysis.reject" label="Rejeitar" />
              </div>

              <div class="col-12 col-md-4">
                <q-checkbox
                  v-model="form.permissions"
                  val="analysis.send_budget"
                  label="Enviar p/ Orçamento"
                />
              </div>
            </q-card-section>
          </q-card>

          <!-- ORÇAMENTOS -->

          <q-card flat bordered class="q-mb-md">
            <q-card-section>
              <div class="text-subtitle1 text-weight-bold">Orçamentos</div>
            </q-card-section>

            <q-card-section class="row">
              <div class="col-12 col-md-4">
                <q-checkbox v-model="form.permissions" val="budget.menu" label="Exibir Menu" />
              </div>

              <div class="col-12 col-md-4">
                <q-checkbox v-model="form.permissions" val="budget.view" label="Visualizar" />
              </div>

              <div class="col-12 col-md-4">
                <q-checkbox v-model="form.permissions" val="budget.edit" label="Editar" />
              </div>

              <div class="col-12 col-md-4">
                <q-checkbox v-model="form.permissions" val="budget.finish" label="Finalizar" />
              </div>
            </q-card-section>
          </q-card>

          <!-- USUÁRIOS -->

          <q-card flat bordered class="q-mb-md">
            <q-card-section>
              <div class="text-subtitle1 text-weight-bold">Usuários</div>
            </q-card-section>

            <q-card-section class="row">
              <div class="col-12 col-md-4">
                <q-checkbox v-model="form.permissions" val="users.menu" label="Exibir Menu" />
              </div>

              <div class="col-12 col-md-4">
                <q-checkbox v-model="form.permissions" val="users.view" label="Visualizar" />
              </div>

              <div class="col-12 col-md-4">
                <q-checkbox v-model="form.permissions" val="users.create" label="Criar" />
              </div>

              <div class="col-12 col-md-4">
                <q-checkbox v-model="form.permissions" val="users.edit" label="Editar" />
              </div>

              <div class="col-12 col-md-4">
                <q-checkbox v-model="form.permissions" val="users.delete" label="Excluir" />
              </div>
            </q-card-section>
          </q-card>

          <!-- SETORES -->

          <q-card flat bordered class="q-mb-md">
            <q-card-section>
              <div class="text-subtitle1 text-weight-bold">Setores</div>
            </q-card-section>

            <q-card-section class="row">
              <div class="col-12 col-md-4">
                <q-checkbox v-model="form.permissions" val="departments.menu" label="Exibir Menu" />
              </div>

              <div class="col-12 col-md-4">
                <q-checkbox v-model="form.permissions" val="departments.view" label="Visualizar" />
              </div>

              <div class="col-12 col-md-4">
                <q-checkbox v-model="form.permissions" val="departments.create" label="Criar" />
              </div>

              <div class="col-12 col-md-4">
                <q-checkbox v-model="form.permissions" val="departments.edit" label="Editar" />
              </div>

              <div class="col-12 col-md-4">
                <q-checkbox v-model="form.permissions" val="departments.delete" label="Excluir" />
              </div>
            </q-card-section>
          </q-card>

          <!-- PERFIS -->

          <q-card flat bordered class="q-mb-md">
            <q-card-section>
              <div class="text-subtitle1 text-weight-bold">Tipos de Usuários</div>
            </q-card-section>

            <q-card-section class="row">
              <div class="col-12 col-md-4">
                <q-checkbox v-model="form.permissions" val="roles.menu" label="Exibir Menu" />
              </div>

              <div class="col-12 col-md-4">
                <q-checkbox v-model="form.permissions" val="roles.view" label="Visualizar" />
              </div>

              <div class="col-12 col-md-4">
                <q-checkbox v-model="form.permissions" val="roles.create" label="Criar" />
              </div>

              <div class="col-12 col-md-4">
                <q-checkbox v-model="form.permissions" val="roles.edit" label="Editar" />
              </div>

              <div class="col-12 col-md-4">
                <q-checkbox v-model="form.permissions" val="roles.delete" label="Excluir" />
              </div>
            </q-card-section>
          </q-card>

          <!-- LOGS -->

          <q-card flat bordered>
            <q-card-section>
              <div class="text-subtitle1 text-weight-bold">Logs do Sistema</div>
            </q-card-section>

            <q-card-section>
              <q-checkbox v-model="form.permissions" val="logs.menu" label="Exibir Menu" />

              <q-checkbox v-model="form.permissions" val="logs.view" label="Visualizar" />
            </q-card-section>
          </q-card>
        </div>

        <q-separator />

        <q-card-section>
          <div class="text-subtitle2 q-mb-sm">Permissões Selecionadas</div>

          <div class="row q-gutter-sm">
            <q-chip
              v-for="permission in form.permissions"
              :key="permission"
              color="primary"
              text-color="white"
            >
              {{ permission }}
            </q-chip>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />

          <q-btn color="primary" label="Salvar" :loading="saving" @click="save" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'

import useApi from 'src/composables/UseApi'
import useNotify from 'src/composables/UseNotify'

const api = useApi()

const { notifySuccess, notifyError } = useNotify()

const loading = ref(false)
const saving = ref(false)

const dialog = ref(false)
const editing = ref(false)

const search = ref('')
const rows = ref([])

const currentId = ref(null)

const form = ref({
  nome: '',
  descricao: '',
  permissions: [],
  ativo: true,
})

const columns = [
  {
    name: 'nome',
    label: 'Nome',
    field: 'nome',
    align: 'left',
    sortable: true,
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
    field: 'permissions',
    align: 'center',
  },
  {
    name: 'ativo',
    label: 'Status',
    field: 'ativo',
    align: 'center',
  },
  {
    name: 'createdAt',
    label: 'Criado em',
    field: 'createdAt',
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
    (item) =>
      item.nome?.toLowerCase().includes(term) || item.descricao?.toLowerCase().includes(term),
  )
})

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

const resetForm = () => {
  form.value = {
    nome: '',
    descricao: '',
    permissions: [],
    ativo: true,
  }

  currentId.value = null
}

const openCreateDialog = () => {
  editing.value = false
  resetForm()
  dialog.value = true
}

const editItem = (item) => {
  editing.value = true

  currentId.value = item.id

  form.value = {
    nome: item.nome || '',
    descricao: item.descricao || '',
    permissions: [...(item.permissions || [])],
    ativo: item.ativo ?? true,
  }

  dialog.value = true
}

const save = async () => {
  try {
    if (!form.value.nome) {
      notifyError('Informe o nome do perfil')
      return
    }

    saving.value = true

    const payload = {
      ...form.value,
      updatedAt: new Date(),
    }

    if (editing.value) {
      await api.update('roles', currentId.value, payload)

      notifySuccess('Perfil atualizado com sucesso')
    } else {
      await api.post('roles', {
        ...payload,
        createdAt: new Date(),
      })

      notifySuccess('Perfil criado com sucesso')
    }

    dialog.value = false

    await loadData()
  } catch {
    notifyError('Erro ao salvar perfil')
  } finally {
    saving.value = false
  }
}

const removeItem = async (item) => {
  try {
    const confirmed = confirm(`Deseja excluir "${item.nome}"?`)

    if (!confirmed) return

    await api.remove('roles', item.id)

    notifySuccess('Perfil removido com sucesso')

    await loadData()
  } catch {
    notifyError('Erro ao remover perfil')
  }
}

const formatDate = (date) => {
  if (!date) return '-'

  const value = typeof date?.toDate === 'function' ? date.toDate() : new Date(date)

  return value.toLocaleDateString('pt-BR')
}

onMounted(() => {
  loadData()
})

const allPermissions = [
  'dashboard.menu',
  'dashboard.view',

  'requests.menu',
  'requests.view',
  'requests.create',
  'requests.edit',
  'requests.delete',

  'analysis.menu',
  'analysis.view',
  'analysis.approve',
  'analysis.reject',
  'analysis.send_budget',

  'budget.menu',
  'budget.view',
  'budget.edit',
  'budget.finish',

  'users.menu',
  'users.view',
  'users.create',
  'users.edit',
  'users.delete',

  'departments.menu',
  'departments.view',
  'departments.create',
  'departments.edit',
  'departments.delete',

  'roles.menu',
  'roles.view',
  'roles.create',
  'roles.edit',
  'roles.delete',

  'logs.menu',
  'logs.view',
]

const selectAllPermissions = () => {
  form.value.permissions = [...allPermissions]
}

const clearAllPermissions = () => {
  form.value.permissions = []
}
</script>
