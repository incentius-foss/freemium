<template>
  <q-layout view="lHh lpr lFf">
    <!--    <q-header elevated>-->
    <!--      <q-toolbar>-->
    <!--        <q-toolbar-title>-->
    <!--          Quasar App-->
    <!--        </q-toolbar-title>-->

    <!--        <div>Quasar v{{ $q.version }}</div>-->
    <!--      </q-toolbar>-->
    <!--    </q-header>-->
    <q-drawer v-model="leftDrawerOpen" show-if-above bordered >
      <Drawer />
    </q-drawer>
    <q-page-container class="backgroundcolor">
      <router-view/>
    </q-page-container>

  </q-layout>
</template>

<script>
import EssentialLink from 'components/EssentialLink.vue'
// import Sidebarcollapse from 'components/Sidebarcollapse.vue'
import Drawer from 'src/components/Drawer.vue'

const linksList = [
  {
    path: '/',
    title: 'Convert text style',
    icon: 'home',
  },
  {
    path: '/jsonformatter',
    title: 'JSON Formatter',
    icon: 'data_object',

  },
  {
    path: '/jsoncsv',
    title: 'JSON TO CSV',
    icon: 'description',

  },
  {
    path: '/sqlformatter',
    title: 'SQL Formatter',
    icon: 'article'
  },
  {
    path: '/base64',
    title: 'Base64 Converter',
    icon: 'code',
  },
  {
    path: '/base64Image',
    title: 'Base64 Image Converter',
    icon: 'image',

  },
  {
    path: '/urlencodedecode',
    title: 'URL Enode Decode',
    icon: 'link',
  },
  {
    path: '/exceltojson',
    title: 'Excel To JSON',
    icon: 'source',

  },
  {
    path: '/qrcode',
    title: 'QR-Code Generator',
    icon: 'qr_code_scanner',

  },

];

import {defineComponent, ref} from 'vue'

export default defineComponent({
  name: 'MainLayout',

  components: {
    EssentialLink,
    Drawer,
  },

  setup() {
    const leftDrawerOpen = ref(false)

    return {
      leftDrawerOpen,
      collapse: ref(false),
      essentialLinks: ref(linksList),
      search_data: ref('')
    }
  },
  methods: {},
  computed: {
    getSearchData() {
      return this.essentialLinks.filter(data => {
        return data.title.toLowerCase().includes(this.search_data.toLowerCase())
      })
    }

  }
})
</script>

<style scoped>
.backgroundcolor {
  background-color: #f6f0eb;

}

.q-item {
  padding: 0px, 0px;
}

.q-field--outlined .q-field__control {
  border-radius: 10px;
}

.footer {
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
}
</style>
