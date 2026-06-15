```vue
<template>
  <q-page class="page-container q-pa-md">
    <div v-if="loading" class="row justify-center q-mt-xl">
      <q-spinner color="primary" size="50px" />
    </div>

    <div v-else-if="request">
      <!-- HEADER -->

      <div class="row items-center justify-between q-mb-lg">
        <div>
          <div class="text-h5 text-weight-bold">Solicitação {{ request.requestNumber }}</div>

          <div class="text-grey-7">Detalhes completos da solicitação</div>
        </div>

        <div>
          <q-chip :color="getStatusColor(request.status)" text-color="white" size="md">
            {{ request.status }}
          </q-chip>
        </div>
      </div>

      <!-- RESUMO -->

      <div class="row q-col-gutter-md q-mb-lg">
        <div class="col-12 col-sm-6 col-md">
          <q-card flat bordered>
            <q-card-section>
              <div class="text-caption text-grey">Criado em</div>

              <div class="text-subtitle1 text-weight-medium">
                {{ formatDate(request.createdAt) }}
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-sm-6 col-md">
          <q-card flat bordered>
            <q-card-section>
              <div class="text-caption text-grey">Atualizado em</div>

              <div class="text-subtitle1 text-weight-medium">
                {{ formatDate(request.updatedAt) }}
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-sm-6 col-md">
          <q-card flat bordered>
            <q-card-section>
              <div class="text-caption text-grey">Valor Total</div>

              <div class="text-subtitle1 text-weight-bold">
                {{ formatCurrency(request.valorTotal) }}
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-sm-6 col-md">
          <q-card flat bordered>
            <q-card-section>
              <div class="text-caption text-grey">Quantidade</div>

              <div class="text-subtitle1 text-weight-bold">
                {{ request.quantidade }}
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- PRODUTO -->

      <q-card flat bordered class="q-mb-md">
        <q-card-section>
          <div class="text-h6 q-mb-md">Produto</div>

          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-input outlined readonly label="Título" :model-value="request.titulo" />
            </div>

            <div class="col-12 col-md-6">
              <q-input outlined readonly label="Categoria" :model-value="request.categoria" />
            </div>

            <div class="col-12">
              <q-input
                outlined
                readonly
                type="textarea"
                autogrow
                label="Descrição"
                :model-value="request.descricao"
              />
            </div>

            <div class="col-12 col-md-6">
              <q-input outlined readonly label="Fornecedor" :model-value="request.fornecedor" />
            </div>

            <div class="col-12 col-md-6">
              <q-input outlined readonly label="Produto URL" :model-value="request.produtoUrl" />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- SOLICITANTE -->

      <q-card flat bordered class="q-mb-md">
        <q-card-section>
          <div class="text-h6 q-mb-md">Solicitante</div>

          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-4">
              <q-input outlined readonly label="Nome" :model-value="request.solicitanteNome" />
            </div>

            <div class="col-12 col-md-4">
              <q-input outlined readonly label="Email" :model-value="request.solicitanteEmail" />
            </div>

            <div class="col-12 col-md-4">
              <q-input outlined readonly label="Setor" :model-value="request.setorNome" />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- FINANCEIRO -->

      <q-card flat bordered class="q-mb-md">
        <q-card-section>
          <div class="text-h6 q-mb-md">Financeiro</div>

          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-input
                outlined
                readonly
                label="Valor Unitário"
                :model-value="formatCurrency(request.valorUnitario)"
              />
            </div>

            <div class="col-12 col-md-6">
              <q-input
                outlined
                readonly
                label="Valor Total"
                :model-value="formatCurrency(request.valorTotal)"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- JUSTIFICATIVA -->

      <q-card flat bordered class="q-mb-md">
        <q-card-section>
          <div class="text-h6 q-mb-md">Justificativa</div>

          <div class="text-body1">
            {{ request.justificativa || 'Não informada' }}
          </div>
        </q-card-section>
      </q-card>

      <!-- CONTROLE -->

      <q-card flat bordered class="q-mb-md">
        <q-card-section>
          <div class="text-h6 q-mb-md">Controle</div>

          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-4">
              <q-input
                outlined
                readonly
                label="Eletrônico"
                :model-value="request.isEletronico ? 'Sim' : 'Não'"
              />
            </div>

            <div class="col-12 col-md-4">
              <q-input
                outlined
                readonly
                label="Prioridade"
                :model-value="request.prioridadeAnalise ? 'Sim' : 'Não'"
              />
            </div>

            <div class="col-12 col-md-4">
              <q-input
                outlined
                readonly
                label="Reanálises"
                :model-value="request.reanalises || 0"
              />
            </div>

            <div class="col-12 col-md-6">
              <q-input
                outlined
                readonly
                label="Data Prioridade"
                :model-value="formatDate(request.prioridadeData)"
              />
            </div>

            <div class="col-12 col-md-6">
              <q-input
                outlined
                readonly
                label="Solicitação Original"
                :model-value="request.originalRequestId || '-'"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- HISTÓRICO -->

      <q-card flat bordered>
        <q-card-section>
          <div class="text-h6 q-mb-lg">Histórico</div>

          <q-timeline color="primary">
            <q-timeline-entry
              v-for="(item, index) in request.historico"
              :key="index"
              :title="item.status"
              :subtitle="formatDate(item.data)"
            >
              <div>
                <strong>{{ item.usuarioNome }}</strong>
              </div>

              <div>
                {{ item.observacao }}
              </div>
            </q-timeline-entry>
          </q-timeline>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

import useRequests from 'src/composables/UseRequests'

const route = useRoute()

const loading = ref(true)
const request = ref(null)

const { getRequestById } = useRequests()

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(value || 0))
}

const formatDate = (value) => {
  if (!value) return '-'

  const date = typeof value?.toDate === 'function' ? value.toDate() : new Date(value)

  return date.toLocaleString('pt-BR')
}

const getStatusColor = (status) => {
  const colors = {
    Deferido: 'positive',
    Indeferido: 'negative',
    'Em Espera': 'warning',
    Finalizado: 'primary',
    'Pendente Análise': 'orange',
    'Em Revisão': 'indigo',
    'Em Orçamento': 'cyan',
    'Em Reanálise': 'deep-orange',
  }

  return colors[status] || 'grey'
}

onMounted(async () => {
  try {
    request.value = await getRequestById(route.params.id)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.page-container {
  max-width: 1400px;
  margin: 0 auto;
}
</style>
```
