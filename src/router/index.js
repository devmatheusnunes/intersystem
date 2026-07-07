import { defineRouter } from '#q-app/wrappers'

import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
  createWebHashHistory,
} from 'vue-router'

import routes from './routes.js'

import useAuthUser from 'src/composables/UseAuthUser'

export default defineRouter(() => {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory

  const Router = createRouter({
    scrollBehavior: () => ({
      left: 0,
      top: 0,
    }),

    routes,

    history: createHistory(process.env.VUE_ROUTER_BASE),
  })

  Router.beforeEach(async (to, from, next) => {
    const { user, profile, loading } = useAuthUser()

    if (loading.value) {
      const waitForAuth = () =>
        new Promise((resolve) => {
          const interval = setInterval(() => {
            if (!loading.value) {
              clearInterval(interval)

              resolve()
            }
          }, 100)
        })

      await waitForAuth()
    }

    const requiresAuth = to.matched.some((route) => route.meta?.requiresAuth)

    if (requiresAuth && !user.value) {
      next('/')

      return
    }

    if (to.path === '/' && user.value) {
      next('/app')

      return
    }

    const requiredPermission = to.meta?.permission

    if (requiredPermission) {
      const permissions = profile.value?.permissions || []

      const hasPermission = permissions.includes(requiredPermission)

      if (!hasPermission) {
        return next(false)
      }
    }

    next()
  })

  return Router
})
