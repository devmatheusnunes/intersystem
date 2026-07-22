<template>
  <q-header elevated class="bg-dark text-white">
    <q-toolbar>
      <!-- MENU -->
      <q-btn
        flat
        round
        dense
        :icon="miniState ? 'menu_open' : 'menu'"
        @click="$emit('toggle-mini')"
      />

      <q-space />

      <!-- NOTIFICAÇÕES -->
      <NotificationBell />
    </q-toolbar>
  </q-header>
</template>

<script setup>
import NotificationBell from 'src/components/NotificationBell.vue'

defineProps({
  miniState: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['toggle-mini'])
</script>

<style scoped>
.bg-dark {
  background: #212529;
}
</style>

<style scoped>
.bg-dark {
  background: #212529;
}
</style>
