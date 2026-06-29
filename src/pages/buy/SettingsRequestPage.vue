<template>
  <q-page class="page-container q-pa-md">
    <!-- HEADER -->
    <q-card flat bordered class="q-mb-lg header-card">
      <q-card-section>
        <div class="text-overline text-grey-7">Configurações</div>
        <div class="text-h5 text-weight-bold">Request Settings</div>
        <div class="text-caption text-grey-6">Gerencie categorias e regras de histórico</div>
      </q-card-section>
    </q-card>

    <!-- 🔥 TABS PRINCIPAIS -->
    <q-tabs v-model="tab" dense class="text-primary">
      <q-tab name="categoria" label="Categorias" icon="category" />
      <q-tab name="historico" label="Histórico" icon="history" />
    </q-tabs>

    <q-separator />

    <q-tab-panels v-model="tab" animated>
      <!-- ========================================================= -->
      <!-- 🟢 CATEGORIAS -->
      <!-- ========================================================= -->
      <q-tab-panel name="categoria">
        <q-card flat bordered class="section-card">
          <q-card-section>
            <div class="section-title">Categorias</div>

            <!-- NOVA CATEGORIA -->
            <div class="row q-col-gutter-md q-mb-md">
              <div class="col-12 col-md-6">
                <q-input dense filled v-model="newCategory.nome" label="Nome da categoria" />
              </div>

              <div class="col-auto">
                <q-btn color="primary" label="Adicionar" @click="addCategory" />
              </div>
            </div>

            <!-- LISTA -->
            <q-list bordered separator>
              <q-item v-for="cat in categories" :key="cat.id">
                <q-item-section>
                  <q-input dense filled v-model="cat.nome" @blur="updateCategory(cat)" />
                </q-item-section>

                <q-item-section side>
                  <q-toggle v-model="cat.ativo" @update:model-value="updateCategory(cat)" />
                </q-item-section>

                <q-item-section side>
                  <q-btn flat round color="negative" icon="delete" @click="removeCategory(cat)" />
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </q-tab-panel>

      <!-- ========================================================= -->
      <!-- 🔵 HISTÓRICO -->
      <!-- ========================================================= -->
      <q-tab-panel name="historico">
        <!-- SUBTABS -->
        <q-tabs v-model="subTab" dense class="text-primary">
          <q-tab name="indeferido" label="Indeferido" />
          <q-tab name="espera" label="Em Espera" />
        </q-tabs>

        <q-separator />

        <q-tab-panels v-model="subTab" animated>
          <!-- 🔴 INDEFERIDO -->
          <q-tab-panel name="indeferido">
            <q-card flat bordered class="section-card">
              <q-card-section>
                <div class="section-title">Reanálise (Indeferido)</div>

                <div class="row q-col-gutter-md">
                  <div class="col-12 col-md-6">
                    <q-input
                      dense
                      filled
                      type="number"
                      v-model.number="settings.indeferido.tempo"
                      label="Tempo de espera (dias)"
                    />
                  </div>

                  <div class="col-12 col-md-6">
                    <q-input
                      dense
                      filled
                      type="number"
                      v-model.number="settings.indeferido.limite"
                      label="Quantidade máxima de reanálises"
                    />
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </q-tab-panel>

          <!-- 🟠 EM ESPERA -->
          <q-tab-panel name="espera">
            <q-card flat bordered class="section-card">
              <q-card-section>
                <div class="section-title">Prioridade (Em Espera)</div>

                <div class="row q-col-gutter-md">
                  <div class="col-12 col-md-6">
                    <q-input
                      dense
                      filled
                      type="number"
                      v-model.number="settings.espera.tempo"
                      label="Tempo de espera (dias)"
                    />
                  </div>

                  <div class="col-12 col-md-6">
                    <q-input
                      dense
                      filled
                      type="number"
                      v-model.number="settings.espera.limite"
                      label="Quantidade máxima de prioridades"
                    />
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </q-tab-panel>
        </q-tab-panels>

        <!-- SALVAR -->
        <div class="row justify-end q-mt-md">
          <q-btn color="primary" label="Salvar Configurações" @click="saveSettings" />
        </div>
      </q-tab-panel>
    </q-tab-panels>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'

import useApi from 'src/composables/UseApi'
import useNotify from 'src/composables/UseNotify'
import useSystemLog from 'src/composables/UseSystemLog'

const api = useApi()

const { notifySuccess, notifyError } = useNotify()
const { addLog } = useSystemLog()

/* TABS */
const tab = ref('categoria')
const subTab = ref('indeferido')

/* =========================
 * 📂 CATEGORIAS
 * =======================*/

const categories = ref([])
const newCategory = ref({
  nome: '',
  ativo: true,
})

const loadCategories = async () => {
  categories.value = await api.list('request_categories')
}

const addCategory = async () => {
  if (!newCategory.value.nome) return

  const category = {
    ...newCategory.value,
  }

  const result = await api.post('request_categories', category)

  await addLog({
    module: 'Configurações de Solicitação',
    action: 'CREATE',
    description: `Criou a categoria "${category.nome}"`,
    documentId: result?.id || null,
    metadata: category,
  })

  newCategory.value = {
    nome: '',
    ativo: true,
  }

  loadCategories()
}

const updateCategory = async (cat) => {
  await api.update('request_categories', cat.id, cat)

  await addLog({
    module: 'Configurações de Solicitação',
    action: 'EDIT',
    description: `Alterou a categoria "${cat.nome}"`,
    documentId: cat.id,
    metadata: {
      ...cat,
    },
  })
}

const removeCategory = async (cat) => {
  await api.remove('request_categories', cat.id)

  await addLog({
    module: 'Configurações de Solicitação',
    action: 'DELETE',
    description: `Excluiu a categoria "${cat.nome}"`,
    documentId: cat.id,
    metadata: {
      ...cat,
    },
  })

  loadCategories()
}

/* =========================
 * ⚙️ SETTINGS
 * =======================*/

const settings = ref({
  indeferido: {
    tempo: 0,
    limite: 0,
  },
  espera: {
    tempo: 0,
    limite: 0,
  },
})

const loadSettings = async () => {
  const data = await api.getById('request_settings', 'global')

  if (data) {
    settings.value = {
      indeferido: {
        tempo: data?.indeferido?.tempo || 0,
        limite: data?.indeferido?.limite || 0,
      },
      espera: {
        tempo: data?.espera?.tempo || 0,
        limite: data?.espera?.limite || 0,
      },
    }
  }
}

const saveSettings = async () => {
  try {
    const existing = await api.getById('request_settings', 'global')

    if (existing) {
      await api.update('request_settings', 'global', settings.value)
    } else {
      await api.set('request_settings', 'global', settings.value)
    }

    await addLog({
      module: 'Configurações de Solicitação',
      action: 'EDIT',
      description: 'Alterou as configurações globais das solicitações',
      documentId: 'global',
      metadata: {
        ...settings.value,
      },
    })

    notifySuccess('Configurações salvas com sucesso')
  } catch (error) {
    console.error(error)
    notifyError('Erro ao salvar configurações')
  }
}

/* INIT */

onMounted(() => {
  loadCategories()
  loadSettings()
})
</script>

<style scoped>
.page-container {
  max-width: 1200px;
  margin: 0 auto;
}

.header-card {
  border-radius: 14px;
  background: #f9fafb;
}

.section-card {
  border-radius: 14px;
}

.section-title {
  font-size: 14px;
  font-weight: 700;
  color: #374151;
  margin-bottom: 16px;
  text-transform: uppercase;
}
</style>
