<template>
  <q-page padding>
    <div class="text-h5 q-mb-md">
      {{ pageTitle }}
    </div>
    <div class="text-caption text-grey-7">Atualize seus dados pessoais e senha</div>

    <q-card flat bordered>
      <q-card-section>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <q-input v-model="form.nome" outlined label="Nome" />
          </div>

          <div class="col-12 col-md-6">
            <q-input v-model="form.email" outlined label="Email" type="email" />
          </div>

          <div class="col-12 col-md-6">
            <q-input v-model="form.telefone" outlined label="Telefone" />
          </div>

          <div class="col-12 col-md-6">
            <q-select
              v-model="form.setorId"
              :options="setoresOptions"
              emit-value
              map-options
              outlined
              label="Setor"
              :disable="isSelfProfile"
            />
          </div>

          <div class="col-12">
            <q-select
              v-model="form.roleId"
              :options="rolesOptions"
              emit-value
              map-options
              outlined
              label="Perfil de Usuário"
              :disable="isSelfProfile"
            />
          </div>

          <div v-if="isEditMode && !isSelfProfile && selectedRolePermissions.length" class="col-12">
            <q-card flat bordered>
              <q-card-section>
                <div class="text-subtitle1">Permissões do Perfil</div>

                <div class="text-caption q-mb-md">
                  Total: {{ selectedRolePermissions.length }} permissões
                </div>

                <q-chip
                  v-for="p in selectedRolePermissions"
                  :key="p"
                  color="primary"
                  text-color="white"
                  class="q-ma-xs"
                >
                  {{ p }}
                </q-chip>
              </q-card-section>
            </q-card>
          </div>

          <div v-if="!isSelfProfile" class="col-12">
            <q-toggle v-model="form.ativo" label="Usuário ativo" />
          </div>

          <div v-if="isSelfProfile" class="col-12 col-md">
            <q-input
              v-model="form.senhaAtual"
              outlined
              :type="showPasswordCurrent ? 'text' : 'password'"
              label="Senha Atual"
            >
              <template #append>
                <q-icon
                  :name="showPasswordCurrent ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="showPasswordCurrent = !showPasswordCurrent"
                />
              </template>
            </q-input>
          </div>

          <div class="col-12 col-md">
            <q-input
              v-model="form.senha"
              outlined
              :type="showPassword ? 'text' : 'password'"
              label="Senha"
              class="q-mb-lg"
              lazy-rules
              :rules="[(val) => !!val || 'Digite a senha']"
            >
              <template #append>
                <q-icon
                  :name="showPassword ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="showPassword = !showPassword"
                />
              </template>
            </q-input>
          </div>

          <div class="col-12 col-md">
            <q-input
              v-model="form.confirmarSenha"
              outlined
              :type="showPasswordConfirm ? 'text' : 'password'"
              label="Confirmar Senha"
              class="q-mb-lg"
              lazy-rules
              :rules="[(val) => !!val || 'Confirme Senha']"
            >
              <template #append>
                <q-icon
                  :name="showPasswordConfirm ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="showPasswordConfirm = !showPasswordConfirm"
                />
              </template>
            </q-input>
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancelar" @click="goBack" />
        <q-btn color="primary" label="Salvar" @click="saveUser" />
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import useApi from 'src/composables/UseApi.js'
import useNotify from 'src/composables/UseNotify'

import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth'
import { auth, secondaryAuth } from 'boot/firebase'
import useAuthUser from 'src/composables/UseAuthUser'

const api = useApi()
const { notifySuccess, notifyError } = useNotify()

const { profile } = useAuthUser()

const showPassword = ref(false)
const showPasswordCurrent = ref(false)
const showPasswordConfirm = ref(false)

const route = useRoute()
const router = useRouter()

const userId = computed(() => route.params.id)
const isEditMode = computed(() => !!userId.value)
const isSelfProfile = computed(() => route.name === 'profile')

const roles = ref([])
const setores = ref([])

const form = ref({
  id: null,
  nome: '',
  email: '',
  telefone: '',

  senhaAtual: '',

  senha: '',
  confirmarSenha: '',

  roleId: '',
  setorId: '',
  ativo: true,
})

const pageTitle = computed(() => {
  if (isSelfProfile.value) {
    return 'Meu Perfil'
  }
  return isEditMode.value ? 'Editar Usuário' : 'Novo Usuário'
})

const setoresOptions = computed(() => setores.value.map((i) => ({ label: i.nome, value: i.id })))

const rolesOptions = computed(() => roles.value.map((i) => ({ label: i.nome, value: i.id })))

const selectedRolePermissions = computed(() => {
  const role = roles.value.find((r) => r.id === form.value.roleId)
  return role?.permissions || []
})

const loadData = async () => {
  try {
    roles.value = await api.list('roles')
    setores.value = await api.list('setores')

    if (isSelfProfile.value) {
      const currentUser = await api.getById('users', profile.value.id)

      if (currentUser) {
        form.value = {
          ...form.value,
          ...currentUser,
          senha: '',
          confirmarSenha: '',
        }
      }

      return
    }

    if (isEditMode.value) {
      const user = await api.getById('users', userId.value)

      if (user) {
        form.value = {
          ...form.value,
          ...user,
          senha: '',
          confirmarSenha: '',
        }
      }
    }
  } catch (error) {
    console.error(error)
    notifyError('Erro ao carregar dados')
  }
}

const validate = () => {
  if (!form.value.nome) return 'Informe o nome'
  if (!form.value.email) return 'Informe o email'
  if (!form.value.roleId) return 'Selecione o tipo de usuário'
  if (!form.value.setorId) return 'Selecione o setor'

  if (form.value.senha) {
    if (isSelfProfile.value && !form.value.senhaAtual) {
      return 'Informe sua senha atual'
    }

    if (form.value.senha.length < 6) {
      return 'Senha deve ter no mínimo 6 caracteres'
    }

    if (form.value.senha !== form.value.confirmarSenha) {
      return 'Senhas não conferem'
    }
  }

  return null
}

const saveUser = async () => {
  try {
    const error = validate()

    if (error) {
      return notifyError(error)
    }

    const role = roles.value.find((r) => r.id === form.value.roleId)

    const setor = setores.value.find((s) => s.id === form.value.setorId)

    const payload = {
      nome: form.value.nome,
      email: form.value.email,
      telefone: form.value.telefone,
      roleId: form.value.roleId,
      setorId: form.value.setorId,
      role: role?.nome || '',
      setor: setor?.nome || '',
      ativo: form.value.ativo,
      updatedAt: new Date(),
    }

    // ==========================
    // EDIÇÃO
    // ==========================
    if (form.value.id) {
      await api.update('users', form.value.id, payload)

      // altera senha somente se informou
      if (form.value.senha) {
        if (isSelfProfile.value) {
          const credential = EmailAuthProvider.credential(
            auth.currentUser.email,
            form.value.senhaAtual,
          )

          await reauthenticateWithCredential(auth.currentUser, credential)

          await updatePassword(auth.currentUser, form.value.senha)
        } else {
          // Gestor alterando outro usuário
          // Aqui apenas salva no Firestore
          // O Firebase Auth NÃO permite trocar a senha de outro usuário pelo frontend
          payload.alterarSenha = true
        }
      }

      notifySuccess('Usuário atualizado com sucesso')

      router.back()

      return
    }

    // ==========================
    // NOVO USUÁRIO
    // ==========================
    const credential = await createUserWithEmailAndPassword(
      secondaryAuth,
      form.value.email,
      form.value.senha,
    )

    const uid = credential.user.uid

    await secondaryAuth.signOut()

    await api.post('users', {
      ...payload,
      userId: uid,
      createdAt: new Date(),
    })

    notifySuccess('Usuário criado com sucesso')

    router.push('/app/settings/users')
  } catch (err) {
    console.error(err)

    if (err.code === 'auth/email-already-in-use') {
      return notifyError('Este email já está cadastrado')
    }

    if (err.code === 'auth/weak-password') {
      return notifyError('Senha muito fraca')
    }

    notifyError(err?.message || 'Erro ao salvar')
  }
}

const goBack = () => {
  router.back()
}

onMounted(loadData)
</script>
