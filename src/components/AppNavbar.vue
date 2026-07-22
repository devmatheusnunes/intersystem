<template>
  <q-header elevated class="bg-dark text-white">
    <q-toolbar>
      <q-btn
        flat
        round
        dense
        :icon="miniState ? 'menu_open' : 'menu'"
        @click="$emit('toggle-mini')"
      />
    </q-toolbar>
  </q-header>
</template>

<script setup>
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
