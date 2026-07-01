<template>
  <q-header elevated class="bg-dark text-white">
    <q-toolbar>
      <q-btn flat round dense icon="menu" @click="$emit('toggle-menu')" />

      <q-toolbar-title>
        <img alt="Inter System" src="~assets/intersystem_horizontal_white.svg" class="logo" />
      </q-toolbar-title>

      <q-btn flat class="user-button no-padding">
        <span class="app-version">
          {{ appVersion }}
        </span>

        <q-icon name="account_circle" size="30px" class="q-ml-sm" />

        <q-menu>
          <q-list style="min-width: 260px">
            <q-item>
              <q-item-section avatar>
                <q-avatar color="primary">
                  {{ initial }}
                </q-avatar>
              </q-item-section>

              <q-item-section>
                <q-item-label>
                  {{ userName }}
                </q-item-label>

                <q-item-label caption>
                  {{ roleName }}
                </q-item-label>

                <q-item-label caption class="text-primary text-weight-medium q-mt-xs">
                  Versão {{ appVersion }}
                </q-item-label>
              </q-item-section>
            </q-item>

            <q-separator />

            <q-item clickable @click="goToProfile">
              <q-item-section avatar>
                <q-icon name="person" />
              </q-item-section>

              <q-item-section> Meu Perfil </q-item-section>
            </q-item>

            <q-item clickable @click="handleLogout">
              <q-item-section avatar>
                <q-icon name="logout" />
              </q-item-section>

              <q-item-section> Sair </q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
    </q-toolbar>
  </q-header>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

import useAuthUser from 'src/composables/UseAuthUser'
import useSystemLog from 'src/composables/UseSystemLog'

const router = useRouter()

const { user, profile, logout } = useAuthUser()
const { addLog } = useSystemLog()

/*
|--------------------------------------------------------------------------
| Versão da aplicação
|--------------------------------------------------------------------------
| Futuramente basta substituir por:
| import { APP } from 'src/config/app'
| const appVersion = APP.version
|--------------------------------------------------------------------------
*/

const appVersion = 'v2.0'

const goToProfile = () => {
  router.push('/app/profile')
}

const userName = computed(() => {
  return profile.value?.nome || user.value?.displayName || user.value?.email || 'Usuário'
})

const roleName = computed(() => {
  return profile.value?.role || 'Usuário'
})

const initial = computed(() => {
  return userName.value.charAt(0).toUpperCase()
})

const handleLogout = async () => {
  try {
    await addLog({
      module: 'Autenticação',
      action: 'LOGOUT',
      description: `${userName.value} encerrou a sessão no sistema`,
      metadata: {
        email: user.value?.email,
      },
    })
  } catch (error) {
    console.error('Erro ao registrar log de logout:', error)
  }

  await logout()

  router.push('/')
}
</script>

<style scoped>
.logo {
  width: 140px;
  max-height: 80px;
  margin-top: 10px;
}

.user-button {
  display: flex;
  align-items: center;
}

.app-version {
  font-size: 12px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
  letter-spacing: 0.5px;
  margin-right: 6px;
  user-select: none;
}
</style>
