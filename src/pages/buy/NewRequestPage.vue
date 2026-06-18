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

    <q-form ref="formRef" @submit="save">
      <!-- PRODUTO -->
      <q-card flat bordered class="q-mb-md section-card">
        <q-card-section>
          <div class="section-title">Produto</div>

          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-input dense filled v-model="form.titulo" label="Título *" />
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
              />
            </div>

            <div class="col-12 col-md-4">
              <q-input
                dense
                filled
                v-model.number="form.quantidade"
                type="number"
                label="Quantidade *"
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
              <q-input dense filled v-model="form.produtoUrl" label="URL do Produto *" />
            </div>

            <div class="col-12 col-md-6">
              <q-input
                dense
                filled
                v-model.number="form.valorUnitario"
                type="number"
                label="Valor Unitário *"
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

import useAuthUser from 'src/composables/UseAuthUser'
import useNotify from 'src/composables/UseNotify'
import useRequests from 'src/composables/UseRequests'

import { createRequestModel } from 'src/models/requestModel'
import { REQUEST_STATUS } from 'src/constants/requestStatus'

// ROUTER
const route = useRoute()
const router = useRouter()

const formRef = ref(null)

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(value || 0))
}

// COMPOSABLES
const { profile } = useAuthUser()
const { notifySuccess, notifyError, notifyWarning } = useNotify()
const { createRequest, updateRequest, getRequestById, generateRequestNumber } = useRequests()

// STATE
const requestId = computed(() => route.params.id)
const isEditing = computed(() => !!requestId.value)

const form = reactive(createRequestModel())

// CATEGORIAS
const categoryOptions = [
  { label: 'Eletrônico', value: 'eletronico' },
  { label: 'Material de Escritório', value: 'escritorio' },
  { label: 'Equipamento', value: 'equipamento' },
  { label: 'Outros', value: 'outros' },
]

// 🔥 REGRA PRINCIPAL
const isEletronico = computed(() => form.categoria === 'eletronico')
const showFinanceiro = computed(() => !isEletronico.value)

// 🧮 TOTAL AUTOMÁTICO
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

// 👤 USER
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

// LOAD (edição)
const loadRequest = async () => {
  if (!requestId.value) return

  try {
    const request = await getRequestById(requestId.value)

    if (!request) {
      notifyError('Solicitação não encontrada')
      router.push('/app/buy/requests')
      return
    }

    Object.assign(form, request)
  } catch (err) {
    console.error(err)
    notifyError('Erro ao carregar')
  }
}

// STATUS AUTOMÁTICO
const getStatusByCategory = () => {
  return form.categoria === 'eletronico' ? REQUEST_STATUS.BUDGET : REQUEST_STATUS.REVISION
}

// 🧹 REMOVE UNDEFINED
const cleanPayload = (obj) =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined))

// 💾 SAVE
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

      // 🔥 CAMPOS CONDICIONAIS
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

    if (isEditing.value) {
      await updateRequest(requestId.value, payload, profile.value)
      notifySuccess('Atualizado com sucesso')
    } else {
      await createRequest({
        requestData: payload,
        user: profile.value,
      })
      notifySuccess('Criado com sucesso')
    }

    router.push('/app/buy/requests')
  } catch (error) {
    console.error(error)
    notifyError('Erro ao salvar')
  }
}

// RESET
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

// BACK
const returnPage = () => {
  router.push('/app/buy/requests')
}

onMounted(loadRequest)
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
