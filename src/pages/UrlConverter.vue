<template>
  <q-page class="tw-py-4 tw-pr-4 tw-flex tw-flex-col ">
    <div class="tw-h-full tw-grow tw-w-full glass-body glass-border tw-rounded-2xl tw-overflow-hidden tw-flex tw-flex-col">
      <div class="tw-p-4 tw-shrink-0 tw-flex tw-items-center tw-justify-between">
        <div class="">
          <div class="tw-text-2xl tw-font-bold">
            URL Converter
          </div>
          <div class="tw-font-bold tw-text-gray-400">
            Encode or decode URLs.
          </div>
        </div>
        <ActionButtons />
      </div>
      <div class="tw-grid tw-grid-cols-2 tw-gap-4 tw-px-4 tw-grow tw-pb-4">
        <div class=" tw-flex tw-flex-col tw-gap-4">
          <div class="tw-shrink-0 tw-flex tw-gap-2">
            <q-btn @click="input_text = 'https://freemium-v2.netlify.app/url-encode-decode', convert_option='Encode'" no-caps unelevated size="1.1em" class="tw-rounded-lg tw-bg-white/20 ">
              <div class="tw-flex tw-justify-between tw-gap-2 tw-items-center">
                <span>Sample URL</span>
              </div>
              <q-tooltip>
                Add a sample URL
              </q-tooltip>
            </q-btn>
            <q-btn @click="input_text = 'https%3A%2F%2Ffreemium-v2.netlify.app%2Furl-encode-decode', convert_option='Decode'" no-caps unelevated size="1.1em" class="tw-rounded-lg tw-bg-white/20 ">
              <div class="tw-flex tw-justify-between tw-gap-2 tw-items-center">
                <span>Sample encoded URL</span>
              </div>
              <q-tooltip>
                Add a sample encoded URL
              </q-tooltip>
            </q-btn>
          </div>
          <div class="tw-grow tw-flex tw-flex-col tw-max-h-full">
            <q-input v-model="input_text" type="textarea" borderless class="tw-grow" placeholder="Input here . . .">

            </q-input>
          </div>
        </div>
        <div class=" tw-flex tw-flex-col tw-gap-4">
          <div class="tw-shrink-0 tw-flex tw-justify-end tw-gap-2">
            <q-btn @click="input_text = '', output_text = ''" unelevated size="1.1em" class="tw-rounded-lg tw-bg-white/20 tw-text-red-400">
              <div class="tw-flex tw-justify-between tw-gap-2 tw-items-center">
                <span>Clear</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="tw-h-6 tw-w-6" viewBox="0 0 24 24"><path fill="currentColor" d="M6.4 19L5 17.6l5.6-5.6L5 6.4L6.4 5l5.6 5.6L17.6 5L19 6.4L13.4 12l5.6 5.6l-1.4 1.4l-5.6-5.6L6.4 19Z"/></svg>
              </div>
              <q-tooltip>
                Clear all
              </q-tooltip>
            </q-btn>
            <q-btn-dropdown split class="tw-rounded-lg tw-bg-green-700" :label="convert_option" @click="handle_action">
              <q-list>
                <q-item clickable v-close-popup @click="convert_option = 'Encode'">
                  <q-item-section>
                    Encode
                  </q-item-section>
                </q-item>
                <q-item clickable v-close-popup @click="convert_option = 'Decode'">
                  <q-item-section>
                    Decode
                  </q-item-section>
                </q-item>
              </q-list>
            </q-btn-dropdown>
          </div>
          <div class="tw-grow tw-flex tw-flex-col tw-ov">
            <q-input ref="output" v-model="output_text" readonly type="textarea" borderless class="tw-max-h-full tw-grow" placeholder="Output will be here . . .">
              <template v-slot:append>
                <q-btn @click="copy" dense flat class="tw-rounded-lg tw-p-2 tw-bg-black/20">
                  <q-icon name="content_copy"></q-icon>
                  <q-tooltip>
                    Copy
                  </q-tooltip>
                </q-btn>
              </template>
            </q-input>
          </div>
        </div>
      </div>
    </div>

  </q-page>
</template>
<script>
import { defineComponent, ref } from 'vue'
import ActionButtons from 'src/components/ActionButtons.vue'

export default defineComponent({
  name: 'UrlConverter',
  components:{
    ActionButtons
  },
  setup () {
    return {
      convert_option:ref('Encode'),
      input_text:ref(''),
      output_text:ref(''),
    }
  },
  methods:{
    handle_action(){
      this.convert_option == 'Encode'?this.encode():this.decode()
    },
    encode(){
      try{
        this.output_text = encodeURIComponent(this.input_text)
      }catch{
        this.output_text = this.input_text
      }
    },
    decode(){
      try{
        this.output_text = decodeURIComponent(this.input_text)
      }catch{
        this.output_text = this.input_text
      }
    },
    copy(){
      this.$refs.output.select()
      navigator.clipboard.writeText(this.output_text)
      this.$q.notify({
        type:'positive',
        message:"Copied to clipboard"
      })
    },
  },
})
</script>
<style>

</style>
