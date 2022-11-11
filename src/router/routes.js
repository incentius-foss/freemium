
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/caseconvert.vue') },
      { path: '/base64',name:'base64', component: () => import('pages/base64.vue') },
      { path: '/base64Image',name:'base64Image', component: () => import('pages/base64Image.vue') },
      { path: '/jsonformatter',name:'jsonformatter', component: () => import('pages/JsonFormatter.vue') },
      { path: '/jsoncsv',name:'jsoncsv', component: () => import('pages/JSONCSV.vue') },
      { path: '/sqlformatter',name:'sqlformatter', component: () => import('pages/SQLFormatter.vue') },
      { path: '/urlencodedecode',name:'urlencodedecode', component: () => import('pages/URLEncodeDecode.vue') },
      { path: '/cURLToCode',name:'cURLToCode', component: () => import('pages/CurlToCode.vue') },
      { path: '/qrcode',name:'qrcode', component: () => import('pages/QRCode.vue') },
      { path: '/texttopdf',name:'texttopdf', component: () => import('pages/TextToPDF.vue') },
      { path: '/qvideoplayer',name:'qvideoplayer', component: () => import('pages/QVideoPlayer.vue') },
      { path: '/exceltojson',name:'exceltojson', component: () => import('pages/ExcelToJson.vue') },
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
