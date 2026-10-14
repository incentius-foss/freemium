// Configuration for your app
// https://v2.quasar.dev/quasar-cli-vite/quasar-config-file

import { defineConfig } from '#q-app'

export default defineConfig((/* ctx */) => {
  return {
    boot: [],

    css: ['app.scss'],

    // No icon or font packs: the UI uses the system font and its own SF-style icon set.
    extras: [],

    build: {
      target: {
        browser: ['es2022', 'firefox115', 'chrome115', 'safari16.4'],
        node: 'node22'
      },
      vueRouterMode: 'history',
    },

    devServer: {
      open: true
    },

    framework: {
      config: {
        dark: false // theming is handled by our own tokens (see src/css/app.scss)
      },
      plugins: []
    },

    animations: [],

    ssr: {
      pwa: false,
      prodPort: 3000,
      middlewares: ['render']
    },

    pwa: {
      workboxMode: 'GenerateSW'
    },

    capacitor: {
      hideSplashscreen: true
    },

    electron: {
      preloadScripts: ['electron-preload'],
      inspectPort: 5858,
      bundler: 'packager',
      builder: {
        appId: 'freemium'
      }
    },

    bex: {
      extraScripts: []
    }
  }
})
