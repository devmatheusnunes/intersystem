<template>
  <q-layout view="lHh Lpr lFf">
    <AppNavbar :mini-state="miniState" @toggle-mini="miniState = !miniState" />

    <AppSidebar v-model="leftDrawerOpen" :mini-state="miniState" />

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'

import AppNavbar from 'src/components/AppNavbar.vue'
import AppSidebar from 'src/components/AppSidebar.vue'

const leftDrawerOpen = ref(true)
const miniState = ref(false)
</script>
