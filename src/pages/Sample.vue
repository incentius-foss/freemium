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
        <div class="tw-flex tw-gap-2">
          <q-btn dense unelevated class="tw-rounded-lg tw-bg-white/10 tw-p-1">
            <svg xmlns="http://www.w3.org/2000/svg" class="tw-h-7 tw-w-7" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33c.85 0 1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2Z"/></svg>
          </q-btn>
          <q-btn dense unelevated class="tw-rounded-lg tw-bg-white/10 tw-p-1">
            <svg xmlns="http://www.w3.org/2000/svg" class="tw-h-7 tw-w-7" viewBox="0 0 24 24"><path fill="currentColor" fill-rule="evenodd" d="M9.429 8.969h3.714v1.85c.535-1.064 1.907-2.02 3.968-2.02c3.951 0 4.889 2.118 4.889 6.004V22h-4v-6.312c0-2.213-.535-3.461-1.897-3.461c-1.889 0-2.674 1.345-2.674 3.46V22h-4V8.969ZM2.57 21.83h4V8.799h-4V21.83ZM7.143 4.55a2.53 2.53 0 0 1-.753 1.802a2.573 2.573 0 0 1-1.82.748a2.59 2.59 0 0 1-1.818-.747A2.548 2.548 0 0 1 2 4.55c0-.677.27-1.325.753-1.803A2.583 2.583 0 0 1 4.571 2c.682 0 1.336.269 1.819.747c.482.478.753 1.126.753 1.803Z" clip-rule="evenodd"/></svg>
          </q-btn>
          <q-btn dense unelevated class="tw-rounded-lg tw-bg-white/10 tw-p-1">
            <svg xmlns="http://www.w3.org/2000/svg" class="tw-h-7 tw-w-7" viewBox="0 0 256 256"><path fill="currentColor" d="M176 156a43.78 43.78 0 0 0-29.09 11l-40.81-26.2a44.07 44.07 0 0 0 0-25.6L146.91 89a43.83 43.83 0 1 0-13-20.17L93.09 95a44 44 0 1 0 0 65.94l40.81 26.26A44 44 0 1 0 176 156Zm0-120a20 20 0 1 1-20 20a20 20 0 0 1 20-20ZM64 148a20 20 0 1 1 20-20a20 20 0 0 1-20 20Zm112 72a20 20 0 1 1 20-20a20 20 0 0 1-20 20Z"/></svg>
          </q-btn>
        </div>
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

export default defineComponent({
  name: 'UrlConverter',
  components:{

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
    },
  },
})
</script>
<style>

</style>
