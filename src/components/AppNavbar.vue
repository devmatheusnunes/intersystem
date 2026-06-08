<template>
  <q-header elevated class="bg-dark text-white">
    <q-toolbar>
      <q-btn flat round dense icon="menu" @click="$emit('toggle-menu')" />

      <q-toolbar-title> GC&C </q-toolbar-title>

      <q-btn flat round icon="account_circle">
        <q-menu>
          <q-list style="min-width: 220px">
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

                <q-item-label caption> Conta </q-item-label>
              </q-item-section>
            </q-item>

            <q-separator />

            <q-item clickable>
              <q-item-section> Alterar senha </q-item-section>
            </q-item>

            <q-item clickable @click="handleLogout">
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

const router = useRouter()

const { user, logout } = useAuthUser()

const userName = computed(() => user.value?.displayName || user.value?.email || 'Usuário')

const initial = computed(() => userName.value.charAt(0).toUpperCase())

const handleLogout = async () => {
  await logout()

  router.push('/')
}
</script>
