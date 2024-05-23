
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      // text
      { path: '', redirect:'/convert-text-style' },
      { path: '/convert-text-style',name:'convert-text-style', component: () => import('pages/TextStyle.vue') },
      { path: '/base64-converter',name:'base64-converter', component: () => import('pages/StringBase64.vue') },
      { path: '/url-encode-decode',name:'url-encode-decode', component: () => import('pages/UrlConverter.vue') },
      { path: '/qr-code-generator',name:'qr-code-generator', component: () => import('pages/QrCodeGenerator.vue') },

      // image
      { path: '/image-to-base64',name:'image-to-base64', component: () => import('pages/ImageBase64.vue') },


      // data
      { path: '/json-formatter',name:'json-formatter', component: () => import('pages/JsonFormatter.vue') },
      { path: '/json-to-csv',name:'json-to-csv', component: () => import('pages/JsonToCsv.vue') },
      { path: '/sql-formatter',name:'sql-formatter', component: () => import('pages/SqlFormatter.vue') },
      { path: '/excel-to-json',name:'excel-to-json', component: () => import('pages/ExcelToJson.vue') },
      { path: '/yaml-to-json',name:'yaml-to-json', component: () => import('pages/YamlToJson.vue') },
      { path: '/json-to-yaml',name:'json-to-yaml', component: () => import('pages/JSONToYAML.vue') },
      { path: '/svg-to-css',name:'svg-to-css', component: () => import('pages/SVGToCSS.vue') },
      { path: '/corn-job-parser',name:'corn-job-parser', component: () => import('pages/CronParser.vue') },
      { path: '/css-beautify',name:'css-beautify', component: () => import('pages/CssBeautify.vue') },
      { path: '/js-beautify',name:'js-beautify', component: () => import('pages/JsBeautifyMinify.vue') },


      // { path: '/cURLToCode',name:'cURLToCode', component: () => import('pages/CurlToCode.vue') },
      // { path: '/texttopdf',name:'texttopdf', component: () => import('pages/TextToPDF.vue') },
      // { path: '/qvideoplayer',name:'qvideoplayer', component: () => import('pages/QVideoPlayer.vue') },
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
