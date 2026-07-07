<template>
  <q-drawer
    v-model="drawerModel"
    show-if-above
    bordered
    :mini="miniState"
    :width="260"
    :breakpoint="768"
    class="bg-dark text-white"
    @click.capture="drawerClick"
  >
    <q-scroll-area class="fit">
      <q-list padding>
        <!-- DASHBOARD -->

        <q-item v-for="item in dashboardItems" :key="item.key" clickable :to="item.route">
          <q-item-section avatar>
            <q-icon :name="item.icon" />
          </q-item-section>

          <q-item-section>
            {{ item.title }}
          </q-item-section>
        </q-item>

        <!-- GRUPOS -->

        <q-expansion-item
          v-for="group in groupedMenus"
          :key="group.name"
          :label="group.name"
          :icon="group.icon"
          default-opened
          header-class="menu-group"
        >
          <q-list class="submenu">
            <q-item
              v-for="item in group.items"
              :key="item.key"
              clickable
              :to="item.route"
              class="submenu-item"
            >
              <q-item-section avatar>
                <q-icon :name="item.icon" size="18px" />
              </q-item-section>

              <q-item-section>
                {{ item.title }}
              </q-item-section>
            </q-item>
          </q-list>
        </q-expansion-item>
      </q-list>
    </q-scroll-area>

    <div class="q-mini-drawer-hide absolute" style="top: 15px; right: -17px">
      <q-btn dense round unelevated color="primary" icon="chevron_left" @click="miniState = true" />
    </div>
  </q-drawer>
</template>

<script setup>
import { computed, ref } from 'vue'

import usePermissions from 'src/composables/UsePermissions'
import { SYSTEM_MODULES } from 'src/permissions/modules'

const props = defineProps({
  modelValue: Boolean,
})

const emit = defineEmits(['update:modelValue'])

const { hasPermission } = usePermissions()

const miniState = ref(false)

const drawerModel = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const visibleModules = computed(() =>
  SYSTEM_MODULES.filter((module) => {
    if (!module.showInMenu) {
      return false
    }

    if (module.menuPermission) {
      return hasPermission(module.menuPermission)
    }

    return hasPermission(`${module.key}.menu`)
  }),
)

const dashboardItems = computed(() => visibleModules.value.filter((item) => !item.group))

const groupedMenus = computed(() => {
  const groups = {}

  visibleModules.value
    .filter((item) => item.group)
    .forEach((item) => {
      if (!groups[item.group]) {
        groups[item.group] = {
          name: item.group,
          icon: item.group === 'CONFIGURAÇÕES' ? 'settings' : 'shopping_cart',
          items: [],
        }
      }

      groups[item.group].items.push(item)
    })

  Object.values(groups).forEach((group) => {
    group.items.sort((a, b) => a.order - b.order)
  })

  return Object.values(groups)
})

const drawerClick = (event) => {
  if (miniState.value) {
    miniState.value = false

    event.stopPropagation()
  }
}
</script>

<style scoped>
.bg-dark {
  background: #212529;
}

.q-item {
  border-radius: 8px;
  margin-bottom: 4px;
}

.q-item.q-router-link--active {
  background: rgba(255, 255, 255, 0.12);
}

.q-item:hover {
  background: rgba(255, 255, 255, 0.08);
}

.q-icon {
  color: rgba(255, 255, 255, 0.85);
}

.menu-group {
  color: #fff;
  font-weight: 600;
}

.submenu {
  margin-left: 12px;
  border-left: 2px solid rgba(255, 255, 255, 0.12);
}

.submenu-item {
  min-height: 40px;
  padding-left: 18px;
  color: rgba(255, 255, 255, 0.75);
  font-size: 13px;
}

.submenu-item:hover {
  background: rgba(255, 255, 255, 0.06);
}

.submenu-item.q-router-link--active {
  color: #fff;
  background: rgba(13, 110, 253, 0.15);
  border-left: 3px solid #0d6efd;
}
</style>
