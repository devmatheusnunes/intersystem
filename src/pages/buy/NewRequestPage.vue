<template>
  <q-page class="page-container">
    <div class="page-wrapper">
      <div class="page-title">
        <div>
          <h4>
            {{ isEditing ? 'Editar Solicitação' : 'Nova Solicação de Compra' }}
          </h4>

          <p>Preencha os dados da solicitação para envio ao fluxo de orçamento e análise.</p>
        </div>
      </div>

      <q-card flat bordered class="request-card">
        <q-form ref="formRef" @submit="save">
          <q-card-section>
            <div class="section-title">Informações da Solicitação</div>

            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-4">
                <q-input
                  v-model="form.requestNumber"
                  outlined
                  disable
                  label="Número da Solicitação"
                />
              </div>

              <div class="col-12 col-md-8">
                <q-input
                  v-model="form.titulo"
                  outlined
                  label="Título *"
                  :rules="[(val) => !!val || 'Informe o título']"
                />
              </div>

              <div class="col-12">
                <q-input
                  v-model="form.descricao"
                  outlined
                  type="textarea"
                  rows="4"
                  label="Descrição *"
                  :rules="[(val) => !!val || 'Informe a descrição']"
                />
              </div>

              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.categoria"
                  outlined
                  label="Categoria *"
                  :rules="[(val) => !!val || 'Informe a categoria']"
                />
              </div>

              <div class="col-12 col-md-6">
                <q-input
                  v-model.number="form.quantidade"
                  outlined
                  type="number"
                  min="1"
                  label="Quantidade *"
                  :rules="[(val) => val > 0 || 'Quantidade inválida']"
                />
              </div>

              <!-- 🆕 VALORES -->
              <div class="col-12 col-md-4">
                <q-input
                  v-model.number="form.valorUnitario"
                  outlined
                  type="number"
                  min="0"
                  step="0.01"
                  label="Valor Unitário *"
                  :rules="[(val) => val > 0 || 'Informe um valor válido']"
                />
              </div>

              <div class="col-12 col-md-4">
                <q-input
                  v-model.number="form.valorTotal"
                  outlined
                  type="number"
                  label="Valor Total"
                  disable
                />
              </div>

              <div class="col-12 col-md-4">
                <q-select
                  v-model="form.formaPagamento"
                  outlined
                  label="Forma de Pagamento *"
                  :options="paymentOptions"
                  emit-value
                  map-options
                  :rules="[(val) => !!val || 'Selecione a forma de pagamento']"
                />
              </div>

              <div class="col-12">
                <q-option-group
                  v-model="form.isEletronico"
                  inline
                  :options="[
                    { label: 'Item eletrônico', value: true },
                    { label: 'Item não eletrônico', value: false },
                  ]"
                />
              </div>

              <div class="col-12">
                <q-input
                  v-model="form.produtoUrl"
                  outlined
                  label="URL do Produto"
                  lazy-rules
                  :rules="[
                    (val) => (form.isEletronico ? true : !!val || 'Informe a URL do produto'),
                  ]"
                />
              </div>

              <div class="col-12">
                <q-input
                  v-model="form.justificativa"
                  outlined
                  type="textarea"
                  rows="5"
                  label="Justificativa *"
                  :rules="[(val) => !!val || 'Informe a justificativa']"
                />
              </div>

              <div class="col-12 col-md-6">
                <q-input v-model="form.solicitanteNome" outlined disable label="Solicitante" />
              </div>

              <div class="col-12 col-md-6">
                <q-input v-model="form.solicitanteEmail" outlined disable label="E-mail" />
              </div>

              <div class="col-12">
                <q-input v-model="form.setorNome" outlined disable label="Setor" />
              </div>
            </div>
          </q-card-section>

          <q-separator />

          <q-card-actions align="right" class="q-pa-md">
            <q-btn
              color="warning"
              text-color="black"
              icon="cleaning_services"
              label="Limpar"
              @click="resetForm"
            />

            <q-space />

            <q-btn outline color="negative" icon="close" label="Cancelar" @click="returnPage" />

            <q-btn
              color="positive"
              icon="save"
              :label="isEditing ? 'Atualizar' : 'Salvar'"
              type="submit"
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </div>
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

const route = useRoute()
const router = useRouter()

const formRef = ref(null)

const { profile } = useAuthUser()
const { notifySuccess, notifyError, notifyWarning } = useNotify()

const { createRequest, updateRequest, getRequestById, generateRequestNumber } = useRequests()

const requestId = computed(() => route.params.id)
const isEditing = computed(() => !!requestId.value)

const form = reactive(createRequestModel())

// 🆕 opções pagamento
const paymentOptions = [
  { label: 'Pix', value: 'pix' },
  { label: 'Boleto', value: 'boleto' },
  { label: 'Cartão de Crédito', value: 'credito' },
  { label: 'Cartão de Débito', value: 'debito' },
  { label: 'Transferência', value: 'transferencia' },
]

// 🧠 cálculo automático
watch(
  () => [form.quantidade, form.valorUnitario],
  ([qtd, valor]) => {
    const total = Number(qtd || 0) * Number(valor || 0)
    form.valorTotal = Number(total.toFixed(2))
  },
)

// 👤 carregar usuário
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

// 📥 carregar edição
const loadRequest = async () => {
  if (!requestId.value) return

  const request = await getRequestById(requestId.value)

  if (!request) {
    notifyError('Solicitação não encontrada')
    router.push('/app/buy/requests')
    return
  }

  const editableStatuses = [REQUEST_STATUS.BUDGET, REQUEST_STATUS.REVISION]

  if (!editableStatuses.includes(request.status)) {
    notifyWarning('Esta solicitação não pode ser editada')
    router.push('/app/buy/requests')
    return
  }

  Object.assign(form, request)
}

// 💾 salvar
const save = async () => {
  const valid = await formRef.value.validate()

  if (!valid) {
    notifyWarning('Preencha os campos obrigatórios')
    return
  }

  const getStatusByType = () => {
    return form.isEletronico ? 'Em Orçamento' : 'Em Revisão'
  }

  const payload = {
    titulo: form.titulo,
    descricao: form.descricao,
    categoria: form.categoria,
    justificativa: form.justificativa,
    quantidade: form.quantidade,
    produtoUrl: form.produtoUrl,
    isEletronico: form.isEletronico,

    valorUnitario: form.valorUnitario,
    valorTotal: form.valorTotal,
    formaPagamento: form.formaPagamento,

    solicitanteId: form.solicitanteId,
    solicitanteNome: form.solicitanteNome,
    solicitanteEmail: form.solicitanteEmail,
    setorId: form.setorId,
    setorNome: form.setorNome,

    requestNumber: form.requestNumber,

    // 🔥 AQUI está a correção
    status: getStatusByType(),
  }

  try {
    if (isEditing.value) {
      await updateRequest(requestId.value, payload)
      notifySuccess('Atualizado com sucesso')
    } else {
      await createRequest({
        requestData: payload,
        user: profile.value,
      })
      notifySuccess('Criado com sucesso')
    }

    router.push('/app/buy/requests')
  } catch {
    notifyError('Erro ao salvar')
  }
}

// 🧹 reset
const resetForm = () => {
  form.titulo = ''
  form.descricao = ''
  form.categoria = ''
  form.justificativa = ''
  form.quantidade = 1
  form.valorUnitario = 0
  form.valorTotal = 0
  form.formaPagamento = null
  form.isEletronico = false
  form.produtoUrl = ''
}

const returnPage = () => {
  router.push('/app/buy/requests')
}

onMounted(loadRequest)
</script>

<style scoped>
.page-container {
  background: #f5f6fa;
  min-height: 100%;
  padding: 24px;
}

.page-wrapper {
  max-width: 1200px;
  margin: 0 auto;
}

.page-title h4 {
  margin: 0;
  font-weight: 600;
}

.request-card {
  border-radius: 12px;
}

.section-title {
  font-weight: 600;
  margin-bottom: 20px;
}
</style>
