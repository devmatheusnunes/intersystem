<template>
  <q-layout view="hHh Lpr lFf">
    <AppNavbar @toggle-menu="drawer = !drawer" />

    <AppSidebar v-model="drawer" />

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'

import AppNavbar from 'src/components/AppNavbar.vue'
import AppSidebar from 'src/components/AppSidebar.vue'

const drawer = ref(true)
</script>
