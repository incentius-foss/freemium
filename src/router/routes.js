import { tools, legacyRedirects } from '@/tools/registry'

const routes = [
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    children: [
      { path: '', name: 'home', component: () => import('@/pages/HomePage.vue'), meta: { title: 'All Tools' } },
      ...tools.map((tool) => ({
        path: tool.path,
        name: tool.id,
        component: tool.component,
        meta: { tool: tool.id, title: tool.title },
      })),
      ...Object.entries(legacyRedirects).map(([from, to]) => ({ path: from, redirect: to })),
    ],
  },

  // Always leave this as last one
  {
    path: '/:catchAll(.*)*',
    component: () => import('@/pages/ErrorNotFound.vue'),
  },
]

export default routes
