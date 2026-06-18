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
              <div class="text-h6 text-weight-bold">Setores</div>

              <div class="text-caption text-grey-7">Gerenciamento dos setores da empresa</div>
            </div>

            <q-space />

            <q-input
              v-model="search"
              outlined
              dense
              clearable
              debounce="300"
              placeholder="Pesquisar setor..."
              style="width: 280px"
            >
              <template #prepend>
                <q-icon name="search" />
              </template>
            </q-input>

            <q-btn
              color="dark"
              icon="add"
              label="Novo Setor"
              unelevated
              @click="openCreateDialog"
            />
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
            <q-btn flat round color="primary" icon="edit" @click="editItem(props.row)">
              <q-tooltip>Editar</q-tooltip>
            </q-btn>

            <q-btn flat round color="negative" icon="delete" @click="removeItem(props.row)">
              <q-tooltip>Excluir</q-tooltip>
            </q-btn>
          </q-td>
        </template>

        <!-- No data -->
        <template #no-data>
          <div class="full-width row flex-center q-pa-xl text-grey">
            <q-icon name="apartment" size="40px" class="q-mr-sm" />
            Nenhum setor encontrado
          </div>
        </template>
      </q-table>
    </q-card>

    <!-- DIALOG -->
    <q-dialog v-model="dialog">
      <q-card style="min-width: 500px; border-radius: 14px">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">
            {{ editing ? 'Editar Setor' : 'Novo Setor' }}
          </div>
        </q-card-section>

        <q-card-section class="q-pa-lg">
          <div class="row q-col-gutter-md">
            <div class="col-12">
              <q-input
                v-model="form.nome"
                outlined
                label="Nome"
                :rules="[(val) => !!val || 'Informe o nome']"
              />
            </div>

            <div class="col-12">
              <q-input
                v-model="form.descricao"
                outlined
                type="textarea"
                label="Descrição"
                autogrow
              />
            </div>

            <div class="col-12">
              <q-toggle v-model="form.ativo" label="Setor ativo" color="positive" />
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancelar" color="primary" v-close-popup />

          <q-btn color="positive" label="Salvar" unelevated :loading="saving" @click="save" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

import useApi from 'src/composables/UseApi'
import useNotify from 'src/composables/UseNotify'

const api = useApi()
const { notifySuccess, notifyError } = useNotify()

const loading = ref(false)
const saving = ref(false)

const dialog = ref(false)
const editing = ref(false)

const rows = ref([])
const search = ref('')

const form = ref({
  nome: '',
  descricao: '',
  ativo: true,
})

const currentId = ref(null)

const columns = [
  { name: 'nome', label: 'Setor', field: 'nome', align: 'left' },
  { name: 'ativo', label: 'Status', field: 'ativo', align: 'center' },
  { name: 'createdAt', label: 'Criado em', field: 'createdAt', align: 'center' },
  { name: 'actions', label: 'Ações', align: 'center' },
]

const stats = computed(() => ({
  total: rows.value.length,
  ativos: rows.value.filter((r) => r.ativo).length,
  inativos: rows.value.filter((r) => !r.ativo).length,
}))

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
    rows.value = await api.list('setores')
  } catch {
    notifyError('Erro ao carregar setores')
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  form.value = {
    nome: '',
    descricao: '',
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
    ativo: item.ativo ?? true,
  }

  dialog.value = true
}

const save = async () => {
  try {
    if (!form.value.nome) {
      notifyError('Informe o nome do setor')
      return
    }

    saving.value = true

    const payload = {
      ...form.value,
      updatedAt: new Date(),
    }

    if (editing.value) {
      await api.update('setores', currentId.value, payload)
      notifySuccess('Setor atualizado com sucesso')
    } else {
      await api.post('setores', {
        ...payload,
        createdAt: new Date(),
      })
      notifySuccess('Setor cadastrado com sucesso')
    }

    dialog.value = false
    await loadData()
  } catch {
    notifyError('Erro ao salvar setor')
  } finally {
    saving.value = false
  }
}

const removeItem = async (item) => {
  try {
    const confirmed = confirm(`Deseja excluir o setor "${item.nome}"?`)
    if (!confirmed) return

    await api.remove('setores', item.id)

    notifySuccess('Setor removido com sucesso')
    await loadData()
  } catch {
    notifyError('Erro ao remover setor')
  }
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

:deep(.q-table tbody tr:last-child td) {
  border-bottom: none;
}
</style>
