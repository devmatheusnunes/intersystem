<template>
  <q-page class="q-pa-md">
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <div class="text-h5 text-weight-bold">
          {{ isEdit ? 'Editar Tipo de Usuário' : 'Novo Tipo de Usuário' }}
        </div>
        <div class="text-grey-7">Configure menus, permissões e visibilidade dos dados</div>
      </div>

      <div class="row q-gutter-sm">
        <q-btn flat label="Voltar" @click="goBack" />
        <q-btn color="primary" icon="save" label="Salvar" :loading="saving" @click="save" />
      </div>
    </div>

    <q-card flat bordered class="q-mb-md">
      <q-card-section>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <q-input v-model="form.nome" outlined label="Nome do Perfil *" />
          </div>

          <div class="col-12 col-md-6">
            <q-toggle v-model="form.ativo" label="Perfil ativo" />
          </div>

          <div class="col-12">
            <q-input v-model="form.descricao" type="textarea" autogrow outlined label="Descrição" />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <q-card flat bordered class="q-mb-md">
      <q-card-section>
        <div class="text-h6">Visibilidade dos Dados</div>
      </q-card-section>

      <q-card-section>
        <q-option-group v-model="form.visibilityType" type="radio" :options="visibilityOptions" />

        <q-select
          v-if="form.visibilityType === 'selected_sectors'"
          v-model="form.visibleSectors"
          :options="sectorOptions"
          multiple
          emit-value
          map-options
          use-chips
          outlined
          label="Setores Permitidos"
        />
      </q-card-section>
    </q-card>

    <q-card flat bordered>
      <q-card-section class="row q-gutter-sm">
        <q-btn outline color="primary" icon="done_all" label="Marcar Todas" @click="selectAll" />
        <q-btn
          outline
          color="negative"
          icon="clear_all"
          label="Desmarcar Todas"
          @click="clearAll"
        />
      </q-card-section>

      <q-separator />

      <q-card-section>
        <div v-for="group in permissionGroups" :key="group.title" class="q-mb-md">
          <q-card flat bordered>
            <q-card-section class="bg-grey-2">
              <div class="text-subtitle1 text-weight-bold">{{ group.title }}</div>
            </q-card-section>

            <q-card-section class="row">
              <div
                v-for="permission in group.permissions"
                :key="permission.value"
                class="col-12 col-md-4"
              >
                <q-checkbox
                  v-model="form.permissions"
                  :val="permission.value"
                  :label="permission.label"
                />
              </div>
            </q-card-section>
          </q-card>
        </div>
      </q-card-section>
    </q-card>

    <q-card flat bordered class="q-mt-md">
      <q-card-section>
        <div class="text-subtitle1 text-weight-bold">
          Permissões Selecionadas ({{ form.permissions.length }})
        </div>

        <div class="q-mt-sm">
          <q-chip
            v-for="item in form.permissions"
            :key="item"
            color="primary"
            text-color="white"
            class="q-ma-xs"
          >
            {{ item }}
          </q-chip>
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import useApi from 'src/composables/UseApi'
import useNotify from 'src/composables/UseNotify'

const api = useApi()
const router = useRouter()
const route = useRoute()
const { notifySuccess, notifyError } = useNotify()

const saving = ref(false)
const setores = ref([])

const form = ref({
  nome: '',
  descricao: '',
  ativo: true,
  permissions: [],
  visibilityType: 'own',
  visibleSectors: [],
})

const isEdit = computed(() => !!route.params.id)

const visibilityOptions = [
  { label: 'Somente registros próprios', value: 'own' },
  { label: 'Meu setor', value: 'sector' },
  { label: 'Setores específicos', value: 'selected_sectors' },
  { label: 'Visualizar tudo', value: 'all' },
]

import { SYSTEM_MODULES } from 'src/permissions/modules'

const permissionGroups = SYSTEM_MODULES

const sectorOptions = computed(() =>
  setores.value.map((item) => ({
    label: item.nome,
    value: item.nome,
  })),
)

const allPermissions = computed(() =>
  permissionGroups.flatMap((g) => g.permissions.map((p) => p.value)),
)

const selectAll = () => {
  form.value.permissions = [...allPermissions.value]
}

const clearAll = () => {
  form.value.permissions = []
}

const loadData = async () => {
  setores.value = await api.list('setores')

  if (isEdit.value) {
    const role = await api.getById('roles', route.params.id)
    if (role) form.value = { ...form.value, ...role }
  }
}

const save = async () => {
  try {
    if (!form.value.nome) {
      notifyError('Informe o nome do perfil')
      return
    }

    saving.value = true

    const payload = {
      ...form.value,
      updatedAt: new Date(),
    }

    if (isEdit.value) {
      await api.update('roles', route.params.id, payload)
      notifySuccess('Perfil atualizado com sucesso')
    } else {
      await api.post('roles', {
        ...payload,
        createdAt: new Date(),
      })
      notifySuccess('Perfil criado com sucesso')
    }

    router.push('/app/settings/roles')
  } catch {
    notifyError('Erro ao salvar perfil')
  } finally {
    saving.value = false
  }
}

const goBack = () => router.push('/app/settings/roles')

onMounted(loadData)
</script>

<style scoped>
.q-card {
  border-radius: 12px;
}
</style>
