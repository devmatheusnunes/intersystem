<template>
  <div class="login-page" :style="{ backgroundImage: `url(${wallpaper})` }">
    <div class="overlay">
      <div class="login-container">
        <q-card flat class="login-card">
          <q-card-section class="text-center">
            <q-img :src="logo" fit="contain" class="logo-login q-mx-auto" no-spinner />

            <div class="text-h5 text-weight-bold">Bem-vindo</div>

            <div class="text-grey-7">Faça login para continuar</div>
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

              <q-btn type="submit" class="full-width btn-login" :loading="loading" label="Entrar" />
            </q-form>
          </q-card-section>
        </q-card>
      </div>
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
import useSystemLog from 'src/composables/UseSystemLog.js'

const router = useRouter()

const { login, profile } = useAuthUser()

const { notifySuccess, notifyError } = useNotify()

const { addLog } = useSystemLog()

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

    await addLog({
      module: 'Autenticação',
      action: 'LOGIN',
      description: `${profile.value?.nome || form.email} realizou login no sistema`,
      metadata: {
        email: form.email,
      },
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

.btn-login {
  background-color: #02166a;
  color: #ffff;
}

.wallpaper-login {
  width: 70vw;
  height: 70vh;
}

.login-page {
  min-height: 100vh;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.overlay {
  min-height: 100vh;

  background: linear-gradient(
    90deg,
    rgba(0, 0, 0, 0.65) 0%,
    rgba(0, 0, 0, 0.45) 30%,
    rgba(0, 0, 0, 0.15) 100%
  );
}

.login-container {
  min-height: 100vh;

  display: flex;
  align-items: center;

  padding-left: 8%;
}

.login-card {
  width: 100%;
  max-width: 430px;

  border-radius: 24px;

  background: rgba(255, 255, 255, 0.95);

  backdrop-filter: blur(12px);

  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
}

.logo-login {
  width: 220px;
  margin-bottom: -20px;
}

@media (max-width: 768px) {
  .login-container {
    justify-content: center;
    padding: 20px;
  }

  .login-card {
    max-width: 100%;
  }
}
</style>
