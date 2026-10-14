import { defineRouter } from '#q-app'
import { createRouter, createMemoryHistory, createWebHistory, createWebHashHistory } from 'vue-router'
import routes from './routes'
import { toolById } from '@/tools/registry'
import { applyMeta } from '@/tools/seo'

export default defineRouter(function (/* { store, ssrContext } */) {
  const createHistory = import.meta.env.SSR
    ? createMemoryHistory
    : (import.meta.env.QUASAR_VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory)

  const Router = createRouter({
    scrollBehavior: (to, from, saved) => saved || { left: 0, top: 0 },
    routes,

    // Leave this as is and make changes in quasar.config file instead!
    history: createHistory(import.meta.env.QUASAR_VUE_ROUTER_BASE)
  })

  Router.afterEach((to) => applyMeta(toolById[to.meta.tool]))

  return Router
})
