
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/caseconvert.vue') },
      // { path: '/smalltext', component: () => import('pages/smallText.vue') },
      // { path: '/widetext', component: () => import('pages/wideText.vue') },
      // { path: '/striketext', component: () => import('pages/strikeText.vue') },
      // { path: '/binarytext', component: () => import('pages/binaryText.vue') },
      // { path: '/titletext', component: () => import('pages/titleText.vue') },
      // { path: '/boldtext', component: () => import('pages/boldText.vue') },
      // { path: '/italictext', component: () => import('pages/italicText.vue') },
      // { path: '/reversetext', component: () => import('pages/reverseText.vue') },
      // { path: '/upsidetext', component: () => import('pages/upsideText.vue') },
      // { path: '/mirrortext', component: () => import('pages/mirrorText.vue') },
      // { path: '/underlinetext', component: () => import('pages/underlineText.vue') },

    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/Error404.vue')
  }
]

export default routes
