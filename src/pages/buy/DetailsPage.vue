<template>
  <q-page class="page-container q-pa-md">
    <div v-if="loading" class="row justify-center q-mt-xl">
      <q-spinner color="primary" size="50px" />
    </div>
    <div v-else-if="request">
      <!-- HEADER -->
      <q-card flat bordered class="q-mb-lg header-card">
        <q-card-section class="row items-center justify-between">
          <div>
            <div class="text-overline text-grey-7">Solicitação</div>
            <div class="text-h5 text-weight-bold">#{{ request.requestNumber }}</div>
            <div class="text-caption text-grey-6">
              Criado em {{ formatDate(request.createdAt) }}
            </div>
          </div>
          <q-chip
            :color="getStatusColor(request.status)"
            text-color="white"
            size="lg"
            class="text-weight-bold"
          >
            {{ request.status }}
          </q-chip>
        </q-card-section>
      </q-card>
      <!-- RESUMO -->
      <div class="row q-col-gutter-md q-mb-lg">
        <div class="col-12 col-sm-6 col-md-3" v-for="item in summary" :key="item.label">
          <q-card flat bordered class="summary-card">
            <q-card-section>
              <div class="row items-center q-gutter-sm">
                <q-icon :name="item.icon" size="20px" color="primary" />
                <div class="text-caption text-grey-7">{{ item.label }}</div>
              </div>
              <div class="text-subtitle1 text-weight-bold q-mt-xs">{{ item.value }}</div>
            </q-card-section>
          </q-card>
        </div>
      </div>
      <!-- PRODUTO -->
      <q-card flat bordered class="q-mb-md section-card">
        <q-card-section>
          <div class="section-title">Produto</div>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-input dense filled readonly label="Título" :model-value="request.produto.titulo" />
            </div>
            <div class="col-12 col-md-6">
              <q-input
                dense
                filled
                readonly
                label="Categoria"
                :model-value="request.produto.categoria"
              />
            </div>
            <div class="col-12 col-md-6">
              <q-input
                dense
                filled
                readonly
                label="Fornecedor"
                :model-value="request.produto.fornecedor"
              />
            </div>
            <div class="col-12 col-md-6">
              <q-input
                dense
                filled
                readonly
                label="Produto URL"
                :model-value="request.produto.produtoUrl"
              >
                <template v-slot:append>
                  <q-icon
                    v-if="request.produto.produtoUrl"
                    name="open_in_new"
                    class="cursor-pointer"
                    @click="openLink(request.produto.produtoUrl)"
                  />
                </template>
              </q-input>
            </div>
            <div class="col-12">
              <q-input
                dense
                filled
                readonly
                type="textarea"
                autogrow
                label="Descrição"
                :model-value="request.produto.descricao"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>
      <!-- SOLICITANTE -->
      <q-card flat bordered class="q-mb-md section-card">
        <q-card-section>
          <div class="section-title">Solicitante</div>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-4">
              <q-input dense filled readonly label="Nome" :model-value="request.solicitante.nome" />
            </div>
            <div class="col-12 col-md-4">
              <q-input
                dense
                filled
                readonly
                label="Email"
                :model-value="request.solicitante.email"
              />
            </div>
            <div class="col-12 col-md-4">
              <q-input
                dense
                filled
                readonly
                label="Setor"
                :model-value="request.solicitante.setorNome"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>
      <!-- FINANCEIRO -->
      <q-card flat bordered class="q-mb-md section-card">
        <q-card-section>
          <div class="section-title">Financeiro</div>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-input
                dense
                filled
                readonly
                label="Valor Unitário"
                :model-value="formatCurrency(request.financeiro.valorUnitario)"
              />
            </div>
            <div class="col-12 col-md-6">
              <q-input
                dense
                filled
                readonly
                label="Valor Total"
                :model-value="formatCurrency(request.financeiro.valorTotal)"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>
      <!-- JUSTIFICATIVA -->
      <q-card flat bordered class="q-mb-md section-card">
        <q-card-section>
          <div class="section-title">Justificativa</div>
          <div class="justificativa-box">
            {{ request.solicitacao.justificativa || 'Não informada' }}
          </div>
        </q-card-section>
      </q-card>
      <!-- HISTÓRICO -->
      <q-card flat bordered class="section-card">
        <q-card-section>
          <div class="section-title">Histórico</div>
          <q-timeline color="primary">
            <q-timeline-entry
              v-for="(item, index) in sortedHistory"
              :key="index"
              :title="item.status"
              :subtitle="formatDate(item.timestamp || item.createdAt || item.data)"
            >
              <div class="text-weight-medium">
                {{ item.userName || item.usuarioNome || 'Usuário' }}
              </div>
              <div class="text-grey-7">{{ item.observacao || '-' }}</div>
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

import { computed } from 'vue'

const route = useRoute()

const loading = ref(true)
const request = ref(null)

const { getRequestById } = useRequests()

const openLink = (url) => {
  if (!url) return
  window.open(url.startsWith('http') ? url : `https://${url}`)
}

const parseDate = (value) => {
  if (!value) return new Date(0)

  // Firestore Timestamp
  if (typeof value?.toDate === 'function') {
    return value.toDate()
  }

  // Já é Date
  if (value instanceof Date) {
    return value
  }

  // String ou número
  const parsed = new Date(value)

  return isNaN(parsed.getTime()) ? new Date(0) : parsed
}

const sortedHistory = computed(() => {
  if (!request.value?.historico) return []

  return [...request.value.historico].sort((a, b) => {
    const dateA = parseDate(a.timestamp || a.createdAt || a.data)
    const dateB = parseDate(b.timestamp || b.createdAt || b.data)

    return dateA - dateB
  })
})

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(value || 0))
}

const formatDate = (value) => {
  if (!value) return '-'

  let date = null

  // Firestore Timestamp
  if (typeof value?.toDate === 'function') {
    date = value.toDate()
  }
  // Já é Date
  else if (value instanceof Date) {
    date = value
  }
  // String ou número
  else {
    date = new Date(value)
  }

  // Data inválida
  if (isNaN(date.getTime())) return '-'

  return date.toLocaleString('pt-BR')
}

const getStatusColor = (status) => {
  const colors = {
    Deferido: 'approved',
    Indeferido: 'rejected',
    'Em Espera': 'waiting',
    Finalizado: 'finished',
    'Pendente Análise': 'analysis',
    'Em Revisão': 'revision',
    'Em Orçamento': 'budget',
    'Em Reanálise': 'reanalysis',
  }
  return colors[status] || 'grey'
}

const summary = computed(() => [
  {
    label: 'Criado em',
    value: formatDate(request.value?.createdAt),
    icon: 'event',
  },
  {
    label: 'Atualizado em',
    value: formatDate(request.value?.updatedAt),
    icon: 'update',
  },
  {
    label: 'Valor Total',
    value: formatCurrency(request.value?.financeiro.valorTotal),
    icon: 'payments',
  },
  {
    label: 'Quantidade',
    value: request.value?.produto.quantidade,
    icon: 'inventory',
  },
])

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
  max-width: 1200px;
  margin: 0 auto;
}

/* HEADER */
.header-card {
  border-radius: 14px;
  background: #f9fafb;
}

/* SUMMARY */
.summary-card {
  border-radius: 12px;
  transition: all 0.2s ease;
}

.summary-card:hover {
  transform: translateY(-2px);
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

/* JUSTIFICATIVA */
.justificativa-box {
  background: #f3f4f6;
  padding: 16px;
  border-radius: 10px;
  font-size: 14px;
  color: #374151;
}

.product-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #3b82f6;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s ease;
}

.product-link:hover {
  color: #2563eb;
  text-decoration: underline;
}
</style>
