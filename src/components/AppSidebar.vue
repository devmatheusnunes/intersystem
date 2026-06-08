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
        <q-expansion-item
          icon="shopping_cart"
          label="COMPRAS"
          default-opened
          header-class="menu-group"
        >
          <q-list class="submenu">
            <q-item clickable to="/app/buy/requests" class="submenu-item">
              <q-item-section avatar>
                <q-icon name="description" size="18px" />
              </q-item-section>

              <q-item-section> Solicitações de Compras </q-item-section>
            </q-item>

            <q-item clickable to="/app/buy/history" class="submenu-item">
              <q-item-section avatar>
                <q-icon name="history" size="18px" />
              </q-item-section>

              <q-item-section> Histórico de Compras </q-item-section>
            </q-item>

            <q-item clickable to="/app/buy/budget" class="submenu-item">
              <q-item-section avatar>
                <q-icon name="request_quote" size="18px" />
              </q-item-section>

              <q-item-section> Orçamentos </q-item-section>
            </q-item>

            <q-item clickable to="/app/buy/analysis" class="submenu-item">
              <q-item-section avatar>
                <q-icon name="analytics" size="18px" />
              </q-item-section>

              <q-item-section> Análise de Solicitações </q-item-section>
            </q-item>

            <q-item clickable to="/app/buy/payment" class="submenu-item">
              <q-item-section avatar>
                <q-icon name="payment" size="18px" />
              </q-item-section>

              <q-item-section> Pagamento de Solicitações </q-item-section>
            </q-item>
          </q-list>
        </q-expansion-item>
      </q-list>
    </q-scroll-area>

    <!-- Botão recolher -->

    <div class="q-mini-drawer-hide absolute" style="top: 15px; right: -17px">
      <q-btn dense round unelevated color="primary" icon="chevron_left" @click="miniState = true" />
    </div>
  </q-drawer>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  modelValue: Boolean,
})

const emit = defineEmits(['update:modelValue'])

const miniState = ref(false)

const drawerModel = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
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

.menu-header {
  color: white;
  font-weight: 600;
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
