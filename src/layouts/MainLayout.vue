<template>
  <q-layout view="lhh LpR lff">
    <AppNavbar :drawer-state="drawerState" :is-mobile="isMobile" @toggle-drawer="toggleDrawer" />

    <AppSidebar
      :drawer-state="drawerState"
      :is-mobile="isMobile"
      @expand-drawer="expandDrawer"
      @close-drawer="drawerState = 'closed'"
    />

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useQuasar } from 'quasar'

import AppNavbar from 'src/components/AppNavbar.vue'
import AppSidebar from 'src/components/AppSidebar.vue'

const $q = useQuasar()

/*
|--------------------------------------------------------------------------
| Desktop / Mobile
|--------------------------------------------------------------------------
*/

const isMobile = computed(() => $q.screen.lt.md)

/*
|--------------------------------------------------------------------------
| Drawer State
|
| expanded
| mini
| closed
|--------------------------------------------------------------------------
*/

const drawerState = ref(localStorage.getItem('drawerState') || 'expanded')

watch(drawerState, (value) => {
  localStorage.setItem('drawerState', value)
})

watch(isMobile, (mobile) => {
  if (mobile) {
    drawerState.value = 'closed'
  } else if (drawerState.value === 'closed') {
    drawerState.value = 'expanded'
  }
})

watch(isMobile, (mobile) => {
  if (mobile) {
    drawerState.value = 'closed'
  } else if (drawerState.value === 'closed') {
    drawerState.value = localStorage.getItem('drawerState') || 'expanded'
  }
})

/*
|--------------------------------------------------------------------------
| Toggle Drawer
|--------------------------------------------------------------------------
*/

const toggleDrawer = () => {
  // MOBILE
  if (isMobile.value) {
    drawerState.value = drawerState.value === 'closed' ? 'expanded' : 'closed'

    return
  }

  // DESKTOP
  switch (drawerState.value) {
    case 'expanded':
      drawerState.value = 'mini'
      break

    case 'mini':
      drawerState.value = 'closed'
      break

    default:
      drawerState.value = 'expanded'
      break
  }
}

/*
|--------------------------------------------------------------------------
| Expand Drawer
|--------------------------------------------------------------------------
*/

const expandDrawer = () => {
  if (!isMobile.value) {
    drawerState.value = 'expanded'
  }
}
</script>
