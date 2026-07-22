<template>
  <q-drawer
    v-model="drawerModel"
    show-if-above
    bordered
    :mini="isMini"
    :width="270"
    :breakpoint="768"
    class="bg-dark text-white"
  >
    <div class="column fit no-wrap">
      <!-- ===================================================== -->
      <!-- LOGO -->
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

      <!-- ===================================================== -->
      <!-- RODAPÉ -->
      <!-- ===================================================== -->

      <div class="sidebar-footer">
        <!-- PERFIL -->

        <q-btn flat no-caps align="left" class="profile-card full-width">
          <div class="avatar-wrapper">
            <q-avatar size="42px" color="primary" text-color="white">
              {{ initial }}
            </q-avatar>

            <span class="status-dot"></span>
          </div>

          <div class="profile-info">
            <div class="profile-name">
              {{ userName }}
            </div>

            <div class="profile-role">
              {{ roleName }}
            </div>
          </div>

          <q-menu anchor="top left" self="bottom left">
            <q-list style="min-width: 220px">
              <q-item clickable @click="goToProfile">
                <q-item-section avatar>
                  <q-icon name="person" color="primary" />
                </q-item-section>

                <q-item-section> Meu Perfil </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>

        <!-- LINHA -->

        <q-separator dark class="footer-divider" />

        <!-- AÇÕES -->

        <div class="footer-actions">
          <div class="system-version">
            {{ appVersion }}
          </div>

          <span />

          <q-btn
            class="q-px-xs q-py-xs"
            size="10px"
            unelevated
            rounded
            outline
            color="primary"
            icon="logout"
            label="Encerrar Sessão"
            no-caps
            @click="handleLogout"
          />
        </div>
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

const emit = defineEmits(['update:modelValue'])

const router = useRouter()

const { hasPermission } = usePermissions()
const { user, profile, logout } = useAuthUser()
const { addLog } = useSystemLog()

/*
|--------------------------------------------------------------------------
| Versão da aplicação
|--------------------------------------------------------------------------
*/

const appVersion = 'Versão 3.7'

/*
|--------------------------------------------------------------------------
| Drawer
|--------------------------------------------------------------------------
*/

const props = defineProps({
  modelValue: Boolean,
  miniState: Boolean,
})

const drawerModel = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

/*
|--------------------------------------------------------------------------
| Módulos Visíveis
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| Dashboard
|--------------------------------------------------------------------------
*/

const dashboardItems = computed(() => visibleModules.value.filter((item) => !item.group))

/*
|--------------------------------------------------------------------------
| Agrupamento dos Menus
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| Usuário
|--------------------------------------------------------------------------
*/

const userName = computed(() => {
  return profile.value?.nome || user.value?.displayName || user.value?.email || 'Usuário'
})

const roleName = computed(() => {
  return profile.value?.role || 'Usuário'
})

const initial = computed(() => {
  return userName.value.charAt(0).toUpperCase()
})

/*
|--------------------------------------------------------------------------
| Navegação
|--------------------------------------------------------------------------
*/

const goToProfile = () => {
  router.push('/app/profile')
}

/*
|--------------------------------------------------------------------------
| Logout
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| Mini Drawer
|--------------------------------------------------------------------------
*/

const isMini = computed(() => props.miniState)
</script>

<style scoped>
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
}

.sidebar-logo {
  width: 155px;
  max-width: 100%;
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
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  padding: 10px;
  border-radius: 14px;
  transition: 0.2s;
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

/* Status Online */

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
  margin-left: 14px;
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
   SCROLL
========================================================== */

.q-scrollarea__content {
  padding-bottom: 8px;
}

/* ==========================================================
   MINI DRAWER
========================================================== */

.q-drawer--mini .sidebar-header {
  padding: 18px 10px;
}

.q-drawer--mini .sidebar-logo {
  width: 42px;
}

.q-drawer--mini .sidebar-footer {
  padding: 10px;
}

.q-drawer--mini .profile-info,
.q-drawer--mini .footer-actions,
.q-drawer--mini .footer-divider {
  display: none;
}

.q-drawer--mini .profile-card {
  justify-content: center;
  padding: 6px;
}
</style>
