<template>
  <q-page class="q-pa-md">
    <div class="row items-center justify-between q-mb-md">
      <div>
        <div class="text-h5 text-weight-bold">Setores</div>

        <div class="text-grey-7">Gerenciamento dos setores da empresa</div>
      </div>

      <q-btn color="primary" icon="add" label="Novo Setor" @click="openCreateDialog" />
    </div>

    <q-card flat bordered>
      <q-card-section>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-4">
            <q-input
              v-model="search"
              dense
              outlined
              clearable
              label="Pesquisar setor"
              debounce="300"
            >
              <template #prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <q-table
        flat
        :rows="filteredRows"
        :columns="columns"
        row-key="id"
        :loading="loading"
        :pagination="pagination"
      >
        <template #body-cell-ativo="props">
          <q-td :props="props">
            <q-chip :color="props.row.ativo ? 'positive' : 'negative'" text-color="white" dense>
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
            <q-btn flat round dense icon="edit" color="primary" @click="editItem(props.row)">
              <q-tooltip>Editar</q-tooltip>
            </q-btn>

            <q-btn flat round dense icon="delete" color="negative" @click="removeItem(props.row)">
              <q-tooltip>Excluir</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <q-dialog v-model="dialog">
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="text-h6">
            {{ editing ? 'Editar Setor' : 'Novo Setor' }}
          </div>
        </q-card-section>

        <q-card-section>
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

const rows = ref([])
const search = ref('')

const form = ref({
  nome: '',
  descricao: '',
  ativo: true,
})

const currentId = ref(null)

const pagination = {
  rowsPerPage: 10,
}

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

  const value = typeof date?.toDate === 'function' ? date.toDate() : new Date(date)

  return value.toLocaleDateString('pt-BR')
}

onMounted(() => {
  loadData()
})
</script>
