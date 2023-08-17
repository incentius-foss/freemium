<template>
  <div class="h-full flex flex-col flex-nowrap">
    <div class="flex items-center gap-4 p-4 flex-shrink-0">
      <div class="text-3xl poppins font-bold ">
        <span class="bg-gradient-to-r from-purple-600 via-blue-600 to-blue-500 inline-block text-transparent bg-clip-text">Free</span>
        <span class="text-gray-500">mium</span>
      </div>
    </div>
    <div class="flex-grow ">
      <div class="h-full overflow-y-auto">
        <q-list>
          <template v-for="category in tools_by_category">
            <q-item-label header>
              {{ category.label }}
            </q-item-label>
            <q-item @click="$router.push(tool.path)" v-for="tool in category.tools" clickable v-ripple active-class="text-blue-100 bg-gradient-to-r from-purple-600 via-blue-600 to-blue-500" class="text-gray-500 " :active="$route.path == tool.path">
              <q-item-section avatar dense>
                <q-icon :name="tool.icon"></q-icon>
              </q-item-section>
              <q-item-section label class="">
                {{ tool.title }}
              </q-item-section>
            </q-item>
          </template>
        </q-list>
      </div>
    </div>
    <div class="flex-shrink-0 text-center p-4  w-full">
      <span class="text-gray-500 font-bold">Made with <i class="q-icon text-red notranslate material-icons" aria-hidden="true" role="presentation"
        style="font-size: 18px;">favorite</i> by <span class="bg-gradient-to-r from-purple-600 via-blue-600 to-blue-500 inline-block text-transparent bg-clip-text">Incentius</span></span>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref } from 'vue'

export default defineComponent({
  name: 'DrawerComponent',
  props: {},
  setup() {
    return {
      tools_by_category:[
        {
          label:'Text',
          tools:[{
          path: '/',
          title: 'Convert text style',
          icon: 'home',
        },
        {
          path: '/base64',
          title: 'Base64 Converter',
          icon: 'code',
        },
        {
          path: '/urlencodedecode',
          title: 'URL Enode Decode',
          icon: 'link',
        },
        {
          path: '/qrcode',
          title: 'QR-Code Generator',
          icon: 'qr_code_scanner',
        }],
        },
        {
          label:'Image',
          tools:[{
            path: '/base64Image',
            title: 'Base64 Image Converter',
            icon: 'image',
        }],
        },
        {
          label:'Data',
          tools:[{
            path: '/jsonformatter',
            title: 'JSON Formatter',
            icon: 'data_object',
          },{
            path: '/jsoncsv',
            title: 'JSON TO CSV',
            icon: 'description',
          },{
            path: '/sqlformatter',
            title: 'SQL Formatter',
            icon: 'article'
          },{
            path: '/exceltojson',
            title: 'Excel To JSON',
            icon: 'source',
          }],
        },
      ],
    }
  }
})
</script>
<style scoped>

</style>