<template>
  <div class="login-page row no-wrap">
    <!-- Lado esquerdo -->
    <div class="login-banner col-8 flex flex-center">
      <div class="text-center text-white">
        <q-img :src="wallpaper" fit="contain" class="wallpaper-login q-mx-auto" no-spinner />
      </div>
    </div>

    <!-- Lado direito -->
    <div class="col flex flex-center bg-grey-2">
      <q-card flat class="login-card">
        <q-card-section class="text-center q-pb-none">
          <q-img :src="logo" fit="contain" class="logo-login q-mx-auto" no-spinner />

          <h4 class="text-weight-bold q-mb-xs">Bem-vindo</h4>

          <p class="text-grey-7">Faça login para continuar</p>
        </q-card-section>

        <q-card-section>
          <q-form @submit="handleLogin">
            <q-input
              v-model="form.email"
              outlined
              label="E-mail"
              type="email"
              class="q-mb-md"
              lazy-rules
              :rules="[(val) => !!val || 'Informe o e-mail']"
            />

            <q-input
              v-model="form.password"
              outlined
              :type="showPassword ? 'text' : 'password'"
              label="Senha"
              class="q-mb-lg"
              lazy-rules
              :rules="[(val) => !!val || 'Informe a senha']"
            >
              <template #append>
                <q-icon
                  :name="showPassword ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="showPassword = !showPassword"
                />
              </template>
            </q-input>

            <q-btn
              type="submit"
              color="primary"
              text-color="white"
              unelevated
              class="full-width"
              :loading="loading"
              label="Entrar"
            />
          </q-form>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import logo from 'src/assets/intersystem_full.svg'
import wallpaper from 'src/assets/wallpaper.svg'

import useAuthUser from 'src/composables/UseAuthUser.js'
import useNotify from 'src/composables/UseNotify.js'

const router = useRouter()

const { login } = useAuthUser()

const { notifySuccess, notifyError } = useNotify()

const loading = ref(false)
const showPassword = ref(false)

const form = reactive({
  email: '',
  password: '',
})

const handleLogin = async () => {
  try {
    loading.value = true

    await login({
      email: form.email,
      password: form.password,
    })

    notifySuccess('Login realizado com sucesso')

    router.push('/app')
  } catch (error) {
    console.error(error)

    notifyError(error?.message || 'E-mail ou senha inválidos')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
}

.login-banner {
  background: linear-gradient(135deg, #02166a, #00a3fe);
}

.login-card {
  width: 100%;
  max-width: 420px;
  padding: 20px;
  border-radius: 20px;
  background: white;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

@media (max-width: 768px) {
  .login-banner {
    display: none;
  }
}

.logo-login {
  width: 250px;
  height: 250px;
  margin-bottom: -5vh;
}

.wallpaper-login {
  width: 50vw;
}
</style>
