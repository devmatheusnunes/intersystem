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

        <q-chip color="primary" text-color="white" size="lg">
          {{ form.produto.categoria || '---' }}
        </q-chip>
      </q-card-section>
    </q-card>

    <q-form ref="formRef" @submit="save">
      <!-- PRODUTO -->
      <q-card flat bordered class="q-mb-md section-card">
        <q-card-section>
          <div class="section-title">Produto</div>

          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-input
                dense
                filled
                v-model="form.produto.titulo"
                label="Título *"
                :rules="[required('título')]"
              />
            </div>

            <div class="col-12 col-md-6">
              <q-select
                dense
                filled
                v-model="form.produto.categoria"
                label="Categoria *"
                :options="categoryOptions"
                option-label="label"
                option-value="value"
                emit-value
                map-options
                :rules="[required('categoria')]"
              />
            </div>

            <div class="col-12 col-md-6">
              <q-input
                dense
                filled
                v-model.number="form.produto.quantidade"
                type="number"
                label="Quantidade *"
                :rules="[requiredNumber('quantidade')]"
              />
            </div>

            <div class="col-12 col-md-6" v-if="showFinanceiro">
              <q-input
                dense
                filled
                v-model="form.produto.fornecedor"
                label="Fornecedor *"
                :rules="[required('fornecedor')]"
              />
            </div>

            <div class="col-12">
              <q-input
                dense
                filled
                v-model="form.produto.descricao"
                type="textarea"
                autogrow
                label="Descrição *"
                :rules="[required('descrição')]"
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
              <q-input dense filled v-model="form.produto.produtoUrl" label="URL do Produto" />
            </div>

            <div class="col-12 col-md-6">
              <q-input
                dense
                filled
                v-model.number="form.financeiro.valorUnitario"
                type="number"
                label="Valor Unitário"
              />
            </div>

            <div class="col-12 col-md-6">
              <q-input
                dense
                filled
                :model-value="formatCurrency(form.financeiro.valorTotal)"
                label="Valor Total"
                readonly
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
            v-model="form.solicitacao.justificativa"
            type="textarea"
            autogrow
            label="Justificativa *"
            :rules="[required('justificativa')]"
          />
        </q-card-section>
      </q-card>

      <!-- ACTIONS -->
      <div class="row justify-end q-gutter-sm">
        <q-btn flat label="Limpar" @click="resetForm" />
        <q-space />
        <q-btn outline color="negative" label="Cancelar" @click="returnPage" />
        <q-btn color="primary" type="submit" label="Salvar" />
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
import useSystemLog from 'src/composables/UseSystemLog'

import { createRequestModel } from 'src/models/requestModel'
import { REQUEST_STATUS } from 'src/constants/requestStatus'

const route = useRoute()
const router = useRouter()
const api = useApi()

const formRef = ref(null)

const { profile } = useAuthUser()
const { notifySuccess, notifyError } = useNotify()
const { createRequest, updateRequest, getRequestById, generateRequestNumber } = useRequests()
const { addLog } = useSystemLog()

/* =========================
 * CATEGORIAS
 * ======================= */

const categoryOptions = ref([])
const categoriesRaw = ref([])

const loadCategories = async () => {
  const data = await api.list('request_categories')
  const ativos = data.filter((c) => c.ativo)

  categoriesRaw.value = ativos

  categoryOptions.value = ativos.map((c) => ({
    label: c.nome,
    value: c.nome,
  }))
}

/* =========================
 * FORM
 * ======================= */

const form = reactive(createRequestModel())

const requestId = computed(() => route.params.id)
const isEditing = computed(() => !!requestId.value)

/* =========================
 * HELPERS
 * ======================= */

const required = (label) => (val) => !!val || `Informe ${label}`
const requiredNumber = (label) => (val) =>
  (val !== null && val !== undefined && val !== '') || `Informe ${label}`

const formatCurrency = (v) =>
  Number(v || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })

/* =========================
 * FINANCEIRO RULE
 * ======================= */

const isEletronico = computed(() => {
  const categoria = form.produto.categoria

  if (!categoria) return false

  return categoria
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .includes('eletronico')
})

const showFinanceiro = computed(() => !isEletronico.value)

watch(
  () => form.produto.categoria,
  (categoria) => {
    if (!categoria) return

    const texto = categoria
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')

    form.status = texto.includes('eletronico') ? REQUEST_STATUS.BUDGET : REQUEST_STATUS.REVISION
  },
  {
    immediate: true,
  },
)

/* =========================
 * TOTAL
 * ======================= */

watch(
  () => [form.financeiro.valorUnitario, form.produto.quantidade],
  () => {
    form.financeiro.valorTotal =
      Number(form.financeiro.valorUnitario || 0) * Number(form.produto.quantidade || 0)
  },
  {
    immediate: true,
  },
)
/* =========================
 * USER SYNC
 * ======================= */

watch(
  profile,
  async (u) => {
    if (!u) return

    form.solicitante = {
      id: u.userId || u.id || '',
      nome: u.nome || '',
      email: u.email || '',
      setorId: u.setorId || '',
      setorNome: u.setorNome || u.setor || '',
    }

    if (!isEditing.value && !form.requestNumber) {
      form.requestNumber = await generateRequestNumber()
    }
  },
  { immediate: true },
)

/* =========================
 * LOAD EDIT
 * ======================= */

const loadRequest = async () => {
  if (!requestId.value) return

  const data = await getRequestById(requestId.value)

  if (!data) {
    notifyError('Solicitação não encontrada')
    router.push('/app/buy/requests')
    return
  }

  Object.assign(form, data)
}

/* =========================
 * SAVE
 * ======================= */

const save = async () => {
  const valid = await formRef.value.validate()

  if (!valid) return
  try {
    const payload = {
      requestNumber: form.requestNumber,
      status: (form.status = isEletronico.value ? REQUEST_STATUS.BUDGET : REQUEST_STATUS.REVISION),

      produto: {
        ...form.produto,
      },

      solicitante: {
        ...form.solicitante,
      },

      financeiro: {
        ...form.financeiro,
      },

      solicitacao: {
        ...form.solicitacao,

        justificativa: form.solicitacao.justificativa,

        usuarioId: form.solicitante.id,
        usuarioNome: form.solicitante.nome,

        updatedAt: new Date(),
      },
    }

    if (isEditing.value) {
      const before = await getRequestById(requestId.value)

      await updateRequest(requestId.value, payload, profile.value)

      await addLog({
        module: 'Solicitações',
        action: 'EDIT',
        description: `Editou ${payload.requestNumber}`,
        before,
        after: payload,
      })

      notifySuccess('Solicitação atualizada com sucesso')
    } else {
      await createRequest({
        requestData: payload,
        user: profile.value,
      })

      await addLog({
        module: 'Solicitações',
        action: 'CREATE',
        description: `Criou ${payload.requestNumber}`,
        after: payload,
      })

      notifySuccess('Solicitação criada com sucesso')
    }

    router.push('/app/buy/requests')
  } catch (error) {
    console.error(error)
    notifyError('Erro ao salvar a solicitação')
  }
}

/* =========================
 * RESET
 * ======================= */

const resetForm = async () => {
  const number = await generateRequestNumber()

  Object.assign(form, createRequestModel())

  form.requestNumber = number

  if (profile.value) {
    form.solicitante.id = profile.value.userId || profile.value.id
    form.solicitante.nome = profile.value.nome
    form.solicitante.email = profile.value.email
    form.solicitante.setorId = profile.value.setorId || ''
    form.solicitante.setorNome = profile.value.setorNome || profile.value.setor || ''
  }
}

const returnPage = () => router.push('/app/buy/requests')

onMounted(() => {
  loadCategories()
  loadRequest()
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
