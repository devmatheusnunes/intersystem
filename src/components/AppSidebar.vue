<template>
  <q-drawer
    :model-value="drawerOpen"
    @update:model-value="onDrawerModelUpdate"
    :mini="drawerMini"
    :overlay="isMobile"
    bordered
    show-if-above
    :width="270"
    :mini-width="72"
    :breakpoint="768"
    class="bg-dark text-white"
  >
    <div class="column fit no-wrap">
      <!-- ===================================================== -->
      <!-- HEADER -->
      <!-- ===================================================== -->

      <div class="sidebar-header">
        <img
          src="~assets/intersystem_horizontal_white.svg"
          alt="Inter System"
          class="sidebar-logo"
        />
      </div>

      <!-- ===================================================== -->
      <!-- MENU -->
      <!-- ===================================================== -->

      <q-scroll-area class="col">
        <q-list padding>
          <!-- DASHBOARD -->

          <q-item v-for="item in dashboardItems" :key="item.key" clickable @click="navigate(item)">
            <q-item-section avatar>
              <q-icon :name="item.icon" />
            </q-item-section>

            <q-item-section v-if="!drawerMini">
              {{ item.title }}
            </q-item-section>

            <q-tooltip v-if="drawerMini" anchor="center right" self="center left">
              {{ item.title }}
            </q-tooltip>
          </q-item>

          <!-- GRUPOS -->

          <template v-for="group in groupedMenus" :key="group.name">
            <!-- EXPANDIDO -->

            <q-expansion-item
              v-if="!drawerMini"
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
                  class="submenu-item"
                  @click="navigate(item)"
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

            <!-- MINI DRAWER -->

            <template v-else>
              <q-item v-for="item in group.items" :key="item.key" clickable @click="navigate(item)">
                <q-item-section avatar>
                  <q-icon :name="item.icon" />
                </q-item-section>

                <q-tooltip anchor="center right" self="center left">
                  {{ item.title }}
                </q-tooltip>
              </q-item>
            </template>
          </template>
        </q-list>
      </q-scroll-area>

      <!-- ===================================================== -->
      <!-- FOOTER -->
      <!-- ===================================================== -->

      <div v-if="!drawerMini" class="sidebar-footer">
        <!-- PERFIL -->

        <q-item clickable class="profile-card">
          <q-item-section avatar>
            <div class="avatar-wrapper">
              <q-avatar size="42px" color="primary" text-color="white">
                {{ initial }}
              </q-avatar>

              <span class="status-dot"></span>
            </div>
          </q-item-section>

          <q-item-section>
            <div class="profile-name">
              {{ userName }}
            </div>

            <div class="profile-role">
              {{ roleName }}
            </div>
          </q-item-section>

          <q-menu anchor="top left" self="bottom left">
            <q-list style="min-width: 220px">
              <q-item clickable @click="goToProfile">
                <q-item-section avatar>
                  <q-icon name="person" />
                </q-item-section>

                <q-item-section> Meu Perfil </q-item-section>
              </q-item>

              <q-separator />

              <q-item clickable @click="handleLogout">
                <q-item-section avatar>
                  <q-icon name="logout" />
                </q-item-section>

                <q-item-section> Sair </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-item>

        <q-separator dark class="footer-divider" />

        <div class="footer-actions">
          <div class="system-version">
            {{ appVersion }}
          </div>

          <q-btn
            color="primary"
            unelevated
            rounded
            no-caps
            size="10px"
            outline
            icon="logout"
            label="Encerrar Sessão"
            @click="handleLogout"
          />
        </div>
      </div>

      <!-- ===================================================== -->
      <!-- FOOTER MINI -->
      <!-- ===================================================== -->

      <div v-else-if="!isMobile" class="mini-footer">
        <q-avatar color="primary" text-color="white" size="42px">
          {{ initial }}
        </q-avatar>

        <q-menu anchor="top right" self="bottom right">
          <q-list style="min-width: 220px">
            <q-item clickable @click="goToProfile">
              <q-item-section avatar>
                <q-icon name="person" />
              </q-item-section>

              <q-item-section> Meu Perfil </q-item-section>
            </q-item>

            <q-separator />

            <q-item clickable @click="handleLogout">
              <q-item-section avatar>
                <q-icon name="logout" />
              </q-item-section>

              <q-item-section> Sair </q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </div>
    </div>
  </q-drawer>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

import usePermissions from 'src/composables/UsePermissions'
import useAuthUser from 'src/composables/UseAuthUser'
import useSystemLog from 'src/composables/UseSystemLog'

import { SYSTEM_MODULES } from 'src/permissions/modules'

/* ==========================================================================
 * PROPS / EMITS
 * ========================================================================== */

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

const emit = defineEmits(['expand-drawer', 'close-drawer'])

const onDrawerModelUpdate = (value) => {
  // Só interessa no mobile
  if (!props.isMobile) {
    return
  }

  // O usuário fechou o drawer clicando no backdrop
  if (!value) {
    emit('close-drawer')
  }
}

/* ==========================================================================
 * ROUTER
 * ========================================================================== */

const router = useRouter()

/* ==========================================================================
 * COMPOSABLES
 * ========================================================================== */

const { hasPermission } = usePermissions()

const { user, profile, logout } = useAuthUser()

const { addLog } = useSystemLog()

/* ==========================================================================
 * APP
 * ========================================================================== */

const appVersion = 'versão 4.1'

/* ==========================================================================
 * DRAWER
 * ========================================================================== */

const drawerOpen = computed(() => {
  return props.drawerState !== 'closed'
})

const drawerMini = computed(() => {
  return !props.isMobile && props.drawerState === 'mini'
})

/* ==========================================================================
 * MENU
 * ========================================================================== */

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

/* ==========================================================================
 * USUÁRIO
 * ========================================================================== */

const userName = computed(() => {
  return profile.value?.nome || user.value?.displayName || user.value?.email || 'Usuário'
})

const roleName = computed(() => {
  return profile.value?.role || 'Usuário'
})

const initial = computed(() => {
  return userName.value.charAt(0).toUpperCase()
})

/* ==========================================================================
 * NAVEGAÇÃO
 * ========================================================================== */

const navigate = async (item) => {
  if (drawerMini.value) {
    emit('expand-drawer')
  }

  await router.push(item.route)

  if (props.isMobile) {
    emit('close-drawer')
  }
}

const goToProfile = async () => {
  if (drawerMini.value) {
    emit('expand-drawer')
  }

  await router.push('/app/profile')

  if (props.isMobile) {
    emit('close-drawer')
  }
}

/* ==========================================================================
 * LOGOUT
 * ========================================================================== */

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
    console.error('Erro ao registrar log:', error)
  }

  await logout()

  router.push('/')
}
</script>

<style scoped>
/* ==========================================================
   DRAWER
========================================================== */

.bg-dark {
  background: #212529;
}

/* ==========================================================
   HEADER
========================================================== */

.sidebar-header {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 28px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  min-height: 84px;
  transition: all 0.25s ease;
}

.sidebar-logo {
  width: 155px;
  max-width: 100%;
  transition: all 0.25s ease;
}

/* ==========================================================
   MENU
========================================================== */

.q-item {
  border-radius: 10px;
  margin-bottom: 4px;
  transition: all 0.2s ease;
}

.q-item:hover {
  background: rgba(255, 255, 255, 0.08);
}

.q-item.q-router-link--active {
  background: rgba(13, 110, 253, 0.18);
}

.q-icon {
  color: rgba(255, 255, 255, 0.88);
}

.menu-group {
  color: white;
  font-weight: 600;
}

.submenu {
  margin-left: 12px;
  border-left: 2px solid rgba(255, 255, 255, 0.1);
}

.submenu-item {
  min-height: 42px;
  padding-left: 18px;
  color: rgba(255, 255, 255, 0.75);
  font-size: 13px;
}

.submenu-item:hover {
  background: rgba(255, 255, 255, 0.06);
}

.submenu-item.q-router-link--active {
  color: white;
  border-left: 3px solid #0d6efd;
  background: rgba(13, 110, 253, 0.18);
}

/* ==========================================================
   FOOTER
========================================================== */

.sidebar-footer {
  padding: 18px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

/* ==========================================================
   PROFILE CARD
========================================================== */

.profile-card {
  border-radius: 14px;
  padding: 10px 8px;
  transition: all 0.2s ease;
}

.profile-card:hover {
  background: rgba(255, 255, 255, 0.06);
}

/* ==========================================================
   AVATAR
========================================================== */

.avatar-wrapper {
  position: relative;
}

.avatar-wrapper .q-avatar {
  font-weight: 600;
  font-size: 16px;
}

.status-dot {
  position: absolute;
  right: -2px;
  bottom: -2px;

  width: 11px;
  height: 11px;

  background: #22c55e;

  border: 2px solid #212529;
  border-radius: 50%;
}

/* ==========================================================
   USER INFO
========================================================== */

.profile-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.profile-name {
  color: white;
  font-size: 14px;
  font-weight: 600;
  line-height: 18px;
}

.profile-role {
  margin-top: 2px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
  font-weight: 500;
}

/* ==========================================================
   DIVIDER
========================================================== */

.footer-divider {
  margin: 18px 0;
  opacity: 0.35;
}

/* ==========================================================
   ACTIONS
========================================================== */

.footer-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.system-version {
  color: rgba(255, 255, 255, 0.45);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.3px;
}

.footer-actions .q-btn {
  border-radius: 10px;
  font-weight: 600;
  padding-left: 14px;
  padding-right: 14px;
}

/* ==========================================================
   MINI FOOTER
========================================================== */

.mini-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.mini-footer .q-avatar {
  cursor: pointer;
  transition: transform 0.2s ease;
}

.mini-footer .q-avatar:hover {
  transform: scale(1.05);
}

/* ==========================================================
   SCROLL AREA
========================================================== */

.q-scrollarea__content {
  padding-bottom: 8px;
}

/* ==========================================================
   MINI DRAWER
========================================================== */

.q-drawer--mini .sidebar-header {
  padding: 18px 10px;
  min-height: 72px;
}

.q-drawer--mini .sidebar-logo {
  width: 36px;
}

.q-drawer--mini .q-item {
  justify-content: center;
  padding-left: 0;
  padding-right: 0;
}

.q-drawer--mini .q-item__section--avatar {
  min-width: 0;
}

.q-drawer--mini .q-icon {
  font-size: 22px;
}

.q-drawer--mini .submenu {
  margin-left: 0;
  border-left: none;
}

/* ==========================================================
   TOOLTIP
========================================================== */

.q-tooltip {
  font-size: 12px;
}

/* ==========================================================
   RESPONSIVO
========================================================== */

@media (max-width: 767px) {
  .sidebar-header {
    padding: 24px 16px;
  }

  .sidebar-logo {
    width: 145px;
  }

  .sidebar-footer {
    padding: 16px;
  }

  .footer-actions {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .footer-actions .q-btn {
    width: 100%;
  }
}

/* ==========================================================
   TRANSIÇÕES DO DRAWER
========================================================== */

.q-drawer {
  transition:
    width 0.25s ease,
    transform 0.25s ease;
}

.sidebar-header,
.sidebar-logo,
.profile-info,
.footer-actions {
  transition: all 0.2s ease;
}
</style>
