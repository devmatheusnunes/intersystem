<template>
  <q-page class="page-container">
    <div class="page-wrapper">
      <div class="page-title">
        <div>
          <h4>
            {{ isEditing ? 'Editar Solicitação' : 'Nova Solicitação de Compra' }}
          </h4>

          <p>Preencha as informações abaixo para registrar uma solicitação.</p>
        </div>
      </div>

      <q-card flat bordered class="request-card">
        <q-form ref="formRef" @submit="save">
          <q-card-section>
            <div class="section-title">Informações da Solicitação</div>

            <div class="row q-col-gutter-md">
              <div class="col-12">
                <q-input
                  v-model="form.produto"
                  outlined
                  label="Produto *"
                  lazy-rules
                  :rules="[(val) => !!val || 'Informe o produto']"
                />
              </div>

              <div class="col-12 col-md-6">
                <q-input v-model="form.solicitante" outlined disable label="Solicitante" />
              </div>

              <div class="col-12 col-md-6">
                <q-input v-model="form.setor" outlined disable label="Setor" />
              </div>

              <div class="col-12 col-md-4">
                <q-input
                  v-model.number="form.quantidade"
                  outlined
                  type="number"
                  label="Quantidade *"
                  lazy-rules
                  :rules="[(val) => val > 0 || 'Quantidade inválida']"
                />
              </div>

              <div class="col-12 col-md-8">
                <div class="radio-wrapper">
                  <div class="radio-label">Produto eletrônico? *</div>

                  <q-option-group
                    v-model="form.eletronico"
                    inline
                    type="radio"
                    :options="[
                      {
                        label: 'Sim',
                        value: 'sim',
                      },
                      {
                        label: 'Não',
                        value: 'nao',
                      },
                    ]"
                  />
                </div>
              </div>

              <div class="col-12">
                <q-input
                  v-model="form.justificativa"
                  outlined
                  type="textarea"
                  rows="4"
                  label="Justificativa *"
                  lazy-rules
                  :rules="[(val) => !!val || 'Informe a justificativa']"
                />
              </div>
            </div>

            <q-banner
              v-if="form.eletronico === 'sim'"
              rounded
              class="q-mt-md bg-blue-1 text-primary"
            >
              <template #avatar>
                <q-icon name="info" color="primary" />
              </template>

              Pedidos de produtos eletrônicos levam até
              <strong>5 dias</strong>
              para orçamento e envio para análise.
            </q-banner>

            <q-card v-if="form.eletronico === 'nao'" flat bordered class="extra-card q-mt-lg">
              <q-card-section>
                <div class="section-title">Informações Complementares</div>

                <div class="row q-col-gutter-md q-mt-sm">
                  <div class="col-12 col-md-4">
                    <q-input v-model.number="form.valor" outlined type="number" label="Valor" />
                  </div>

                  <div class="col-12 col-md-4">
                    <q-input v-model="form.pagamento" outlined label="Forma de pagamento" />
                  </div>

                  <div class="col-12 col-md-4">
                    <q-input v-model="form.vendedor" outlined label="Vendedor" />
                  </div>

                  <div class="col-12">
                    <q-input v-model="form.link" outlined label="Link de compra" />
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </q-card-section>

          <q-separator />

          <q-card-actions align="right" class="q-pa-md">
            <q-btn
              text-color="black"
              color="warning"
              label="Limpar Dados"
              icon="close"
              no-caps
              @click="resetForm"
            />
            <q-space />

            <q-btn
              outline
              color="negative"
              label="Cancelar"
              icon="close"
              no-caps
              @click="returnPage"
            />

            <q-btn
              color="positive"
              :label="isEditing ? 'Atualizar Solicitação' : 'Salvar Solicitação'"
              icon="save"
              no-caps
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

import useApi from 'src/composables/UseApi.js'
import useAuthUser from 'src/composables/UseAuthUser.js'
import useNotify from 'src/composables/UseNotify.js'

const route = useRoute()
const router = useRouter()

const api = useApi()

const { profile } = useAuthUser()

const { notifySuccess, notifyError, notifyWarning } = useNotify()

const formRef = ref(null)

const requestId = computed(() => route.params.id)

const isEditing = computed(() => !!requestId.value)

const form = reactive({
  produto: '',
  solicitante: '',
  setor: '',
  quantidade: 1,
  justificativa: '',
  eletronico: '',
  valor: null,
  pagamento: '',
  vendedor: '',
  link: '',
})

watch(
  profile,
  (value) => {
    if (!value) return

    form.solicitante = value.nome || ''

    form.setor = value.setor || ''
  },
  {
    immediate: true,
  },
)

const loadRequest = async () => {
  if (!requestId.value) return

  try {
    const data = await api.getById('compras', requestId.value)

    if (!data) {
      notifyError('Solicitação não encontrada')

      return
    }

    Object.assign(form, {
      produto: data.produto || '',
      solicitante: data.solicitante || '',
      setor: data.setor || '',
      quantidade: data.quantidade || 1,
      justificativa: data.justificativa || '',
      eletronico: data.eletronico || '',
      valor: data.valor || null,
      pagamento: data.pagamento || '',
      vendedor: data.vendedor || '',
      link: data.link || '',
    })
  } catch (error) {
    notifyError('Erro ao carregar solicitação')

    console.error(error)
  }
}

const save = async () => {
  const valid = await formRef.value.validate()

  if (!valid) {
    notifyWarning('Preencha os campos obrigatórios')
    return
  }

  try {
    const payload = {
      produto: form.produto,
      solicitante: form.solicitante,
      setor: form.setor,
      quantidade: form.quantidade,
      justificativa: form.justificativa,
      eletronico: form.eletronico,
    }

    if (form.eletronico === 'sim') {
      payload.status = 'Em orçamento'

      payload.etapa = 2

      payload.valor = null
      payload.pagamento = null
      payload.vendedor = null
      payload.link = null
    } else {
      payload.status = 'Pendente análise'

      payload.etapa = 3

      payload.valor = form.valor

      payload.pagamento = form.pagamento

      payload.vendedor = form.vendedor

      payload.link = form.link
    }

    if (isEditing.value) {
      await api.update('compras', requestId.value, payload)

      notifySuccess('Solicitação atualizada com sucesso!')
      router.push('/app/buy/requests')
    } else {
      await api.post('compras', payload)

      notifySuccess('Solicitação registrada com sucesso!')
      router.push('/app/buy/requests')
    }
  } catch (error) {
    console.error(error)

    notifyError('Erro ao salvar solicitação')
  }
}

const resetForm = () => {
  form.produto = ''
  form.quantidade = 1
  form.justificativa = ''
  form.eletronico = ''

  form.valor = null
  form.pagamento = ''
  form.vendedor = ''
  form.link = ''
}

const returnPage = () => {
  router.push('/app/buy/requests')
}

onMounted(() => {
  loadRequest()
})
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

.page-title {
  margin-bottom: 20px;
}

.page-title h4 {
  margin: 0;
  font-weight: 600;
  color: #2d3748;
}

.page-title p {
  margin-top: 4px;
  color: #718096;
}

.request-card {
  border-radius: 12px;
  background: #ffffff;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 20px;
}

.radio-wrapper {
  padding-top: 4px;
}

.radio-label {
  font-size: 14px;
  font-weight: 500;
  color: #4a5568;
  margin-bottom: 8px;
}

.extra-card {
  background: #fafafa;
  border-radius: 10px;
}

:deep(.q-field--outlined .q-field__control) {
  border-radius: 8px;
}

:deep(.q-btn) {
  border-radius: 8px;
  font-weight: 600;
}

:deep(.q-field__label) {
  font-weight: 500;
}
</style>
```
