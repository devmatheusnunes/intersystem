<template>
  <q-page class="page-container q-pa-md">
    <!-- HEADER -->
    <q-card flat bordered class="q-mb-lg header-card">
      <q-card-section class="row items-center justify-between">
        <div>
          <div class="text-overline text-grey-7">
            {{ isEditing ? 'Editar Solicitação' : 'Nova Solicitação' }}
          </div>

          <div class="text-h5 text-weight-bold">#{{ form.requestNumber || '---' }}</div>

          <div class="text-caption text-grey-6">
            Preencha as informações para iniciar o processo
          </div>
        </div>

        <q-chip color="primary" text-color="white" size="lg" class="text-weight-bold">
          {{ form.categoria || '---' }}
        </q-chip>
      </q-card-section>
    </q-card>

    <q-form ref="formRef" @submit="save" greedy>
      <!-- PRODUTO -->
      <q-card flat bordered class="q-mb-md section-card">
        <q-card-section>
          <div class="section-title">Produto</div>

          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-input
                dense
                filled
                v-model="form.titulo"
                label="Título *"
                :rules="[required('o título')]"
              />
            </div>

            <div class="col-12 col-md-6">
              <q-select
                dense
                filled
                v-model="form.categoria"
                label="Categoria *"
                :options="categoryOptions"
                emit-value
                map-options
                :rules="[required('a categoria')]"
              />
            </div>

            <div class="col-12 col-md-4">
              <q-input
                dense
                filled
                v-model.number="form.quantidade"
                type="number"
                label="Quantidade *"
                :rules="[requiredNumber('a quantidade')]"
              />
            </div>

            <div class="col-12">
              <q-input
                dense
                filled
                v-model="form.descricao"
                type="textarea"
                autogrow
                label="Descrição *"
                :rules="[required('a descrição')]"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- FINANCEIRO -->
      <q-card v-if="showFinanceiro" flat bordered class="q-mb-md section-card">
        <q-card-section>
          <div class="section-title">Financeiro</div>

          <div class="row q-col-gutter-md">
            <div class="col-12">
              <q-input
                dense
                filled
                v-model="form.produtoUrl"
                :label="showFinanceiro ? 'URL do Produto *' : 'URL do Produto'"
                :rules="showFinanceiro ? [required('a URL do produto'), validUrl] : [validUrl]"
              />
            </div>

            <div class="col-12 col-md-6">
              <q-input
                dense
                filled
                v-model.number="form.valorUnitario"
                type="number"
                label="Valor Unitário *"
                :rules="showFinanceiro ? [requiredNumber('o valor unitário')] : []"
              />
            </div>

            <div class="col-12 col-md-6">
              <q-input
                dense
                filled
                readonly
                :model-value="formatCurrency(form.valorTotal)"
                label="Valor Total"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- JUSTIFICATIVA -->
      <q-card flat bordered class="q-mb-md section-card">
        <q-card-section>
          <div class="section-title">Justificativa</div>

          <q-input
            dense
            filled
            v-model="form.justificativa"
            type="textarea"
            autogrow
            label="Justificativa *"
            :rules="[required('a justificativa')]"
          />
        </q-card-section>
      </q-card>

      <!-- ACTIONS -->
      <div class="row justify-end q-gutter-sm">
        <q-btn flat color="grey-7" label="Limpar" @click="resetForm" />
        <q-space />
        <q-btn outline color="negative" label="Cancelar" @click="returnPage" />
        <q-btn color="primary" unelevated type="submit" label="Salvar" />
      </div>
    </q-form>
  </q-page>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import useApi from 'src/composables/UseApi'

import useAuthUser from 'src/composables/UseAuthUser'
import useNotify from 'src/composables/UseNotify'
import useRequests from 'src/composables/UseRequests'

import { createRequestModel } from 'src/models/requestModel'
import { REQUEST_STATUS } from 'src/constants/requestStatus'

import useSystemLog from 'src/composables/UseSystemLog'

// ROUTER
const route = useRoute()
const router = useRouter()

const formRef = ref(null)
const api = useApi()

// =========================
// CATEGORIAS
// =========================
const categoryOptions = ref([])
const categoriesRaw = ref([])

const { addLog } = useSystemLog()

const loadCategories = async () => {
  const data = await api.list('request_categories')

  const ativos = data.filter((cat) => cat.ativo)

  categoriesRaw.value = ativos

  categoryOptions.value = ativos.map((cat) => ({
    label: cat.nome,
    value: cat.name || cat.nome, // 🔥 agora usa name como base
  }))
}

// =========================
// FORM
// =========================
const form = reactive(createRequestModel())

const requestId = computed(() => route.params.id)
const isEditing = computed(() => !!requestId.value)

// =========================
// HELPERS
// =========================
const required = (label) => (val) => !!val || `Informe ${label}`

const requiredNumber = (label) => (val) =>
  (val !== null && val !== undefined && val !== '') || `Informe ${label}`

const validUrl = (val) => {
  if (!val) return true
  return /^https?:\/\/.+/.test(val) || 'URL inválida (use http ou https)'
}

const formatCurrency = (value) => {
  return Number(value || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

// =========================
// CATEGORIA SELECIONADA
// =========================
const selectedCategory = computed(() => {
  if (!form.categoria) return null

  return categoriesRaw.value.find(
    (c) => (c.name || c.nome) === form.categoria, // 🔥 base em NAME
  )
})

// =========================
// REGRA PRINCIPAL (ELETRÔNICO)
// =========================
const isEletronico = computed(() => {
  const name = selectedCategory.value?.name || selectedCategory.value?.nome
  return (name || '').toLowerCase() === 'eletrônico'
})

const showFinanceiro = computed(() => !isEletronico.value)

// =========================
// TOTAL AUTOMÁTICO
// =========================
watch(
  () => [form.valorUnitario, form.quantidade],
  () => {
    if (!showFinanceiro.value) {
      form.valorTotal = null
      return
    }

    form.valorTotal = Number(form.valorUnitario || 0) * Number(form.quantidade || 0)
  },
  { immediate: true },
)

// =========================
// USER
// =========================
const { profile } = useAuthUser()
const { notifySuccess, notifyError, notifyWarning } = useNotify()
const { createRequest, updateRequest, getRequestById, generateRequestNumber } = useRequests()

watch(
  profile,
  async (user) => {
    if (!user) return

    form.solicitanteId = user.userId
    form.solicitanteNome = user.nome
    form.solicitanteEmail = user.email
    form.setorId = user.setorId
    form.setorNome = user.setorNome || user.setor

    if (!isEditing.value && !form.requestNumber) {
      form.requestNumber = await generateRequestNumber()
    }
  },
  { immediate: true },
)

// =========================
// LOAD REQUEST (EDIÇÃO)
// =========================
const loadRequest = async () => {
  if (!requestId.value) return

  try {
    const request = await getRequestById(requestId.value)

    if (!request) {
      notifyError('Solicitação não encontrada')
      router.push('/app/buy/requests')
      return
    }

    // 🔥 garante que categoria exista mesmo sem schema antigo
    Object.assign(form, {
      ...request,
      categoria: request.categoria || '',
    })
  } catch (err) {
    console.error(err)
    notifyError('Erro ao carregar')
  }
}

// =========================
// STATUS
// =========================
const getStatusByCategory = () => {
  if (isEletronico.value) return REQUEST_STATUS.BUDGET
  return REQUEST_STATUS.REVISION
}

// =========================
// CLEAN
// =========================
const cleanPayload = (obj) =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined))

// =========================
// SAVE
// =========================
const save = async () => {
  const valid = await formRef.value.validate()

  if (!valid) {
    notifyWarning('Preencha os campos obrigatórios')
    return
  }

  try {
    const payload = cleanPayload({
      titulo: form.titulo,
      descricao: form.descricao,
      categoria: form.categoria,
      justificativa: form.justificativa,
      quantidade: Number(form.quantidade),

      produtoUrl: showFinanceiro.value ? form.produtoUrl || null : null,
      valorUnitario: showFinanceiro.value ? Number(form.valorUnitario || 0) : null,
      valorTotal: showFinanceiro.value ? Number(form.valorTotal || 0) : null,

      solicitanteId: form.solicitanteId,
      solicitanteNome: form.solicitanteNome,
      solicitanteEmail: form.solicitanteEmail,
      setorId: form.setorId,
      setorNome: form.setorNome,

      requestNumber: form.requestNumber,
      status: getStatusByCategory(),

      updatedAt: new Date(),
    })

    // ===========================================
    // EDITAR
    // ===========================================
    if (isEditing.value) {
      // Snapshot antes da alteração
      const before = await getRequestById(requestId.value)

      await updateRequest(requestId.value, payload, profile.value)

      await addLog({
        module: 'Solicitações',
        action: 'EDIT',
        description: `Alterou a solicitação ${payload.requestNumber}`,
        documentId: requestId.value,
        before,
        after: payload,
      })

      notifySuccess('Atualizado com sucesso')
    }

    // ===========================================
    // NOVA SOLICITAÇÃO
    // ===========================================
    else {
      const request = await createRequest({
        requestData: payload,
        user: profile.value,
      })

      await addLog({
        module: 'Solicitações',
        action: 'CREATE',
        description: `Criou a solicitação ${payload.requestNumber}`,
        documentId: request?.id || null,
        after: payload,
      })

      notifySuccess('Criado com sucesso')
    }

    router.push('/app/buy/requests')
  } catch (error) {
    console.error(error)
    notifyError('Erro ao salvar')
  }
}

// =========================
// RESET
// =========================
const resetForm = () => {
  form.titulo = ''
  form.descricao = ''
  form.categoria = ''
  form.justificativa = ''
  form.quantidade = 1

  form.produtoUrl = ''
  form.valorUnitario = 0
  form.valorTotal = 0
}

// =========================
// NAV
// =========================
const returnPage = () => {
  router.push('/app/buy/requests')
}

// =========================
// INIT
// =========================
onMounted(() => {
  loadRequest()
  loadCategories()
})
</script>

<style scoped>
.page-container {
  max-width: 1100px;
  margin: 0 auto;
}

/* HEADER */
.header-card {
  border-radius: 14px;
  background: #f9fafb;
}

/* SECTIONS */
.section-card {
  border-radius: 14px;
}

.section-title {
  font-size: 14px;
  font-weight: 700;
  color: #374151;
  margin-bottom: 16px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
</style>
>
