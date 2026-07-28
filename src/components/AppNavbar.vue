<template>
  <q-header elevated class="bg-dark text-white">
    <q-toolbar>
      <q-btn flat round dense :icon="menuIcon" @click="$emit('toggle-drawer')" />

      <q-space />

      <NotificationBell />
    </q-toolbar>
  </q-header>
</template>

<script setup>
import { computed } from 'vue'

import NotificationBell from 'src/components/NotificationBell.vue'

const props = defineProps({
  drawerState: {
    type: String,
    required: true,
  },

  isMobile: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['toggle-drawer'])

/*
|--------------------------------------------------------------------------
| Ícone do botão
|--------------------------------------------------------------------------
|
| Desktop:
|
| expanded -> menu_open
| mini     -> menu
| closed   -> menu
|
| Mobile:
|
| aberto   -> close
| fechado  -> menu
|--------------------------------------------------------------------------
*/

const menuIcon = computed(() => {
  if (props.isMobile) {
    return props.drawerState === 'expanded' ? 'close' : 'menu'
  }

  switch (props.drawerState) {
    case 'expanded':
      return 'menu_open'

    case 'mini':
      return 'menu'

    default:
      return 'menu'
  }
})
</script>

<style scoped>
.bg-dark {
  background: #212529;
}

.q-toolbar {
  min-height: 56px;
}

.q-btn {
  transition: all 0.25s ease;
}
</style>
