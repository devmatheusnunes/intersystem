<template>
  <q-page class="page-container q-pa-md">
    <!-- LOADING -->
    <div v-if="loading" class="row justify-center q-mt-xl">
      <q-spinner color="primary" size="50px" />
    </div>

    <div v-else-if="request">
      <!-- HEADER -->
      <q-card flat bordered class="q-mb-lg header-card">
        <q-card-section class="row items-center justify-between">
          <div>
            <div class="text-overline text-grey-7">Análise de Solicitação</div>
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

              <div class="text-subtitle1 text-weight-bold q-mt-xs">
                {{ item.value }}
              </div>
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
              <q-input dense filled readonly label="Título" :model-value="request.titulo" />
            </div>

            <div class="col-12 col-md-6">
              <q-input dense filled readonly label="Categoria" :model-value="request.categoria" />
            </div>

            <div class="col-12">
              <q-input
                dense
                filled
                readonly
                type="textarea"
                autogrow
                label="Descrição"
                :model-value="request.descricao"
              />
            </div>

            <!-- 🔥 PREVIEW DO PRODUTO -->
            <div class="col-12">
              <!-- 🔥 PREVIEW (SE EXISTIR) -->
              <div
                v-if="linkPreview"
                class="link-preview q-mb-sm"
                @click="openProduct(linkPreview.url)"
              >
                <img v-if="linkPreview.image" :src="linkPreview.image" class="preview-image" />

                <div v-else class="preview-image placeholder">
                  <q-icon name="image" size="28px" color="grey-5" />
                </div>

                <div class="preview-content">
                  <div class="preview-title">
                    {{ linkPreview.title || 'Produto' }}
                  </div>

                  <div class="preview-domain">
                    {{ linkPreview.domain }}
                  </div>
                </div>
              </div>

              <!-- 🔥 INPUT SEMPRE VISÍVEL (FALLBACK + LINK) -->
              <q-input dense filled readonly label="Produto URL" :model-value="request.produtoUrl">
                <template #append>
                  <q-icon
                    v-if="request.produtoUrl"
                    name="open_in_new"
                    class="cursor-pointer"
                    @click="openProduct(request.produtoUrl)"
                  />
                </template>
              </q-input>
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
              <q-input dense filled readonly label="Nome" :model-value="request.solicitanteNome" />
            </div>

            <div class="col-12 col-md-4">
              <q-input
                dense
                filled
                readonly
                label="Email"
                :model-value="request.solicitanteEmail"
              />
            </div>

            <div class="col-12 col-md-4">
              <q-input dense filled readonly label="Setor" :model-value="request.setorNome" />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- 🔥 FINANCEIRO -->
      <q-card flat bordered class="q-mb-md section-card">
        <q-card-section>
          <div class="section-title">Financeiro</div>

          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-4">
              <q-input
                dense
                filled
                readonly
                label="Valor Unitário"
                :model-value="formatCurrency(request.valorUnitario)"
              />
            </div>

            <div class="col-12 col-md-4">
              <q-input
                dense
                filled
                readonly
                label="Valor Total"
                :model-value="formatCurrency(request.valorTotal)"
              />
            </div>

            <div class="col-12 col-md-4">
              <q-input
                dense
                filled
                readonly
                label="Forma de Pagamento"
                :model-value="request.formaPagamento || 'Não informada'"
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
            {{ request.justificativa || 'Não informada' }}
          </div>
        </q-card-section>
      </q-card>

      <!-- 🔥 OBSERVAÇÃO (OBRIGATÓRIA REAL) -->
      <q-card flat bordered class="q-mb-md section-card">
        <q-card-section>
          <div class="section-title">Observação da Análise</div>

          <q-input
            v-model="observacao"
            outlined
            type="textarea"
            label="Observação *"
            autogrow
            :error="observacaoError"
            :error-message="'Campo obrigatório'"
          />
        </q-card-section>
      </q-card>

      <!-- AÇÕES -->
      <div class="row justify-end q-gutter-sm">
        <q-btn outline color="grey" label="Voltar" @click="goBack" />

        <q-btn color="orange" label="Em Espera" @click="handleWait" />

        <q-btn color="negative" label="Indeferir" @click="handleReject" />

        <q-btn color="positive" label="Deferir" @click="handleApprove" />
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import useRequests from 'src/composables/UseRequests'
import useAuthUser from 'src/composables/UseAuthUser'

const route = useRoute()
const router = useRouter()

const { getRequestById, approveRequest, rejectRequest, waitRequest } = useRequests()
const { user } = useAuthUser()

const loading = ref(true)
const request = ref(null)

const observacao = ref('')
const observacaoError = ref(false)

const linkPreview = ref(null)

/* LOAD */
onMounted(async () => {
  const data = await getRequestById(route.params.id)
  request.value = data

  if (data?.produtoUrl) {
    fetchPreview(data.produtoUrl)
  }

  loading.value = false
})

/* 🔥 PREVIEW COM IMAGEM */
const fetchPreview = async (url) => {
  try {
    const safeUrl = url.startsWith('http') ? url : `https://${url}`

    const res = await fetch(`https://jsonlink.io/api/extract?url=${encodeURIComponent(safeUrl)}`)
    const data = await res.json()

    linkPreview.value = {
      title: data.title,
      image: data.images?.[0],
      domain: new URL(safeUrl).hostname,
      url: safeUrl,
    }
  } catch {
    linkPreview.value = null
  }
}

/* 🔥 VALIDAÇÃO REAL */
const validate = () => {
  observacaoError.value = !observacao.value?.trim()
  return !observacaoError.value
}

/* ACTIONS */
const handleApprove = async () => {
  if (!validate()) return

  await approveRequest({
    request: request.value,
    user: user.value,
    observacao: observacao.value,
  })

  router.push('/app/buy/analysis')
}

const handleReject = async () => {
  if (!validate()) return

  await rejectRequest({
    request: request.value,
    user: user.value,
    observacao: observacao.value,
  })

  router.push('/app/buy/analysis')
}

const handleWait = async () => {
  if (!validate()) return

  await waitRequest({
    request: request.value,
    user: user.value,
    observacao: observacao.value,
  })

  router.push('/app/buy/analysis')
}

/* HELPERS */
const goBack = () => router.push('/app/buy/analysis')

const openProduct = (url) => {
  if (!url) return
  const safe = url.startsWith('http') ? url : `https://${url}`
  window.open(safe, '_blank')
}

const formatCurrency = (v) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(v || 0))

const formatDate = (value) => {
  if (!value) return '-'
  const d = value?.toDate ? value.toDate() : new Date(value)
  return isNaN(d.getTime()) ? '-' : d.toLocaleString('pt-BR')
}

const getStatusColor = (status) => {
  const map = {
    Deferido: 'positive',
    Indeferido: 'negative',
    'Em Espera': 'orange',
    'Pendente Análise': 'analysis',
  }
  return map[status] || 'grey'
}

const summary = computed(() => [
  { label: 'Criado em', value: formatDate(request.value?.createdAt), icon: 'event' },
  { label: 'Atualizado em', value: formatDate(request.value?.updatedAt), icon: 'update' },
  { label: 'Valor Total', value: formatCurrency(request.value?.valorTotal), icon: 'payments' },
  { label: 'Quantidade', value: request.value?.quantidade, icon: 'inventory' },
])
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

.summary-card {
  border-radius: 12px;
}

.section-card {
  border-radius: 14px;
}

.section-title {
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 16px;
  text-transform: uppercase;
}

/* PREVIEW */
.link-preview {
  display: flex;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  max-width: 500px;
}

.preview-image {
  width: 120px;
  height: 120px;
  object-fit: cover;
}

.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
}

.preview-content {
  padding: 12px;
}

.preview-title {
  font-weight: 600;
}

.preview-domain {
  font-size: 12px;
  color: #6b7280;
}

.justificativa-box {
  background: #f3f4f6;
  padding: 16px;
  border-radius: 10px;
}
</style>
