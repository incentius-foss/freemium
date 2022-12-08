<template>
  <q-item
    clickable
    tag="a"
    target="_blank"
     @click="$router.push('/')"
     :class="$route.path=='/' ? 'bg-blue-500 rounded-xl text-white' : 'hover:bg-gray-400 rounded-xl hover:text-white'"
  >
    <q-item-section
      v-if="icon"
      avatar
    >
      <q-icon :name="icon"/>
    </q-item-section>

    <q-item-section>
      <q-item-label>{{ title }}</q-item-label>
    </q-item-section>
  </q-item>

<!-- For Json formatter -->
<q-item
    clickable
    tag="a"
    target="_blank"
    @click="$router.push('/jsonformatter')"
    :class="$route.path=='/jsonformatter' ? 'bg-blue-500 rounded-xl text-white' : 'hover:bg-gray-400 rounded-xl hover:text-white'"
  >
    <q-item-section
      v-if="icon"
      avatar
    >
      <q-icon name="data_object"/>
    </q-item-section>
  <q-item-section>
       JSON Formatter
    </q-item-section>
  </q-item>

  <!-- For JSON To CSV-->
  <q-item
    clickable
    tag="a"
    target="_blank"
    @click="$router.push('/jsoncsv')"
    :class="$route.path=='/jsoncsv' ? 'bg-blue-500 rounded-xl text-white' : 'hover:bg-gray-400 rounded-xl hover:text-white'"
  >
    <q-item-section
      v-if="icon"
      avatar
    >
      <q-icon name="description"/>
    </q-item-section>
  <q-item-section>
       <q-item-label>JSON TO CSV</q-item-label>
    </q-item-section>
  </q-item>

  <!-- For SQL formatter -->
  <q-item
    clickable
    tag="a"
    target="_blank"
    @click="$router.push('/sqlformatter')"
    :class="$route.path=='/sqlformatter' ? 'bg-blue-500 rounded-xl text-white' : 'hover:bg-gray-400 rounded-xl hover:text-white'"
  >
    <q-item-section
      v-if="icon"
      avatar
    >
      <q-icon name="article"/>
    </q-item-section>
  <q-item-section>
       <q-item-label>SQL Formatter</q-item-label>
    </q-item-section>
  </q-item>
  <!-- For Base 64 -->
  <q-item
    clickable
    tag="a"
    target="_blank"
    @click="$router.push('/base64')"
    :class="$route.path=='/base64' ? 'bg-blue-500 rounded-xl text-white' : 'hover:bg-gray-400 rounded-xl hover:text-white'"
  >
    <q-item-section
      v-if="icon"
      avatar
    >
      <q-icon  name="code"/>
    </q-item-section>
  <q-item-section>
       <q-item-label>Base64 Converter</q-item-label>
    </q-item-section>
  </q-item>
<!-- For Json Formatter -->
  <q-item
    clickable
    tag="a"
    target="_blank"
    @click="$router.push('/base64Image')"
    :class="$route.path=='/base64Image' ? 'bg-blue-500 rounded-xl text-white' : 'hover:bg-gray-400 rounded-xl hover:text-white'"
  >
    <q-item-section
      v-if="icon"
      avatar
    >
      <q-icon  name="image"/>
    </q-item-section>
  <q-item-section>
       <q-item-label>Base64 Image Converter</q-item-label>
    </q-item-section>
  </q-item>


  <!-- For SQL formatter -->
  <q-item
    clickable
    tag="a"
    target="_blank"
    @click="$router.push('/urlencodedecode')"
    :class="$route.path=='/urlencodedecode' ? 'bg-blue-500 rounded-xl text-white' : 'hover:bg-gray-400 rounded-xl hover:text-white'"
  >
    <q-item-section
      v-if="icon"
      avatar
    >
      <q-icon  name="link"/>
    </q-item-section>
  <q-item-section>
       <q-item-label>URL Enode Decode</q-item-label>
    </q-item-section>
  </q-item>

<!-- For PDF Generator-->
  <q-item
    clickable
    tag="a"
    target="_blank"
    @click="$router.push('/exceltojson')"
    :class="$route.path=='/exceltojson' ? 'bg-blue-500 rounded-xl text-white' : 'hover:bg-gray-400 rounded-xl hover:text-white'"
  >
    <q-item-section
      v-if="icon"
      avatar
    >
      <q-icon name="source"/>
    </q-item-section>
  <q-item-section>
       <q-item-label>Excel To JSON</q-item-label>
    </q-item-section>
  </q-item>

<!-- For cURL To Code-->
  <!-- <q-item
    clickable
    tag="a"
    target="_blank"
    @click="$router.push('/cURLToCode')"
  >
    <q-item-section
      v-if="icon"
      avatar
    >
      <q-icon name="http"/>
    </q-item-section>
  <q-item-section>
       <q-item-label>cURL To Code</q-item-label>
    </q-item-section>
  </q-item> -->

  <!-- For QR-Code Generator-->
  <q-item
    clickable
    tag="a"
    target="_blank"
    @click="$router.push('/qrcode')"
    :class="$route.path=='/qrcode' ? 'bg-blue-500 rounded-xl text-white' : 'hover:bg-gray-400 rounded-xl hover:text-white'"
  >
    <q-item-section
      v-if="icon"
      avatar
    >
      <q-icon name="qr_code_scanner"/>
    </q-item-section>
  <q-item-section>
       <q-item-label>QR-Code Generator</q-item-label>
    </q-item-section>
  </q-item>

<!-- For PDF Generator-->
  <q-item
    clickable
    tag="a"
    target="_blank"
    @click="$router.push('/texttopdf')"
    :class="$route.path=='/texttopdf' ? 'bg-blue-500 rounded-xl text-white' : 'hover:bg-gray-400 rounded-xl hover:text-white'"
  >
    <q-item-section
      v-if="icon"
      avatar
    >
      <q-icon name="picture_as_pdf"/>
    </q-item-section>
  <q-item-section>
       <q-item-label>PDF Generator</q-item-label>
    </q-item-section>
  </q-item>

</template>

<script>
import {defineComponent} from 'vue'
import { ref } from 'vue'


export default defineComponent({
  name: 'EssentialLink',
  props: {
    title: {
      type: String,
      required: true
    },

    caption: {
      type: String,
      default: ''
    },

    link: {
      type: String,
      default: ref('/')
    },

    icon: {
      type: String,
      default: ''
    }
  }
})
</script>
<style scoped>
.activeclass{
  background-color: #6a7dff;
  
}
</style>