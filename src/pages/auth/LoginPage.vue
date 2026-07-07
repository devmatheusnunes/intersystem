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
/* ===========================
   BACKGROUND
=========================== */

.login-page {
  min-height: 100vh;
  width: 100%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.overlay {
  min-height: 100vh;

  display: flex;
  align-items: center;

  background: linear-gradient(
    90deg,
    rgba(0, 0, 0, 0.7) 0%,
    rgba(0, 0, 0, 0.45) 35%,
    rgba(0, 0, 0, 0.2) 100%
  );
}

/* ===========================
   CONTAINER
=========================== */

.login-container {
  width: 100%;
  padding-left: clamp(30px, 8vw, 140px);
  padding-right: 24px;
  display: flex;
  align-items: center;
}

/* ===========================
   CARD
=========================== */

.login-card {
  width: min(92vw, 430px);

  padding: clamp(20px, 2vw, 32px);

  border-radius: 24px;

  background: rgba(255, 255, 255, 0.96);

  backdrop-filter: blur(14px);

  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.25);
}

/* ===========================
   LOGO
=========================== */

.logo-login {
  width: clamp(140px, 20vw, 240px);

  aspect-ratio: 1;

  margin: 0 auto -18px;
}

/* ===========================
   BUTTON
=========================== */

.btn-login {
  background: #02166a;
  color: white;
  height: 46px;
  font-weight: 600;
  border-radius: 10px;
}

/* ===========================
   TEXT
=========================== */

.text-h5 {
  font-size: clamp(1.4rem, 2vw, 2rem);
}

/* ===========================
   MOBILE
=========================== */

@media (max-width: 768px) {
  .overlay {
    justify-content: center;
    padding: 20px;
    background: rgba(0, 0, 0, 0.55);
  }

  .login-container {
    justify-content: center;
    padding: 0;
  }

  .login-card {
    width: 100%;
    max-width: 420px;
    border-radius: 20px;
  }

  .logo-login {
    width: clamp(140px, 45vw, 210px);
  }
}

/* ===========================
   NOTEBOOKS PEQUENOS
=========================== */

@media (max-height: 800px) {
  .login-card {
    padding: 18px;
  }

  .logo-login {
    width: 150px;
    margin-bottom: -12px;
  }

  .text-h5 {
    font-size: 1.35rem;
  }
}

/* ===========================
   ULTRAWIDE / 2K / 4K
=========================== */

@media (min-width: 1800px) {
  .login-container {
    padding-left: 10%;
  }

  .login-card {
    max-width: 470px;
  }
}
</style>
