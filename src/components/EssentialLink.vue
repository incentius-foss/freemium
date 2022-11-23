<template>
  <q-item
    clickable
    tag="a"
    target="_blank"
     @click="$router.push('/')"
  >
    <q-item-section
      v-if="icon"
      avatar
    >
      <q-icon  :name="icon"/>
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
  >
    <q-item-section
      v-if="icon"
      avatar
    >
      <q-icon name="data_object"/>
    </q-item-section>
  <q-item-section>
       <q-item-label>JSON Formatter</q-item-label>
    </q-item-section>
  </q-item>

  <!-- For JSON To CSV-->
  <q-item
    clickable
    tag="a"
    target="_blank"
    @click="$router.push('/jsoncsv')"
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
      default: '#'
    },

    icon: {
      type: String,
      default: ''
    }
  }
})
</script>
