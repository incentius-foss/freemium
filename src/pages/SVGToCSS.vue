<template>
  <q-page class="tw-py-4 tw-pr-4 tw-flex tw-flex-col">
    <div class="tw-h-full tw-grow tw-w-full glass-body glass-border tw-rounded-2xl tw-overflow-hidden tw-flex tw-flex-col">
      <div class="tw-p-4 tw-shrink-0 tw-flex tw-items-center tw-justify-between">
        <div>
          <div class="tw-text-2xl tw-font-bold">
            SVG to CSS Converter
          </div>
          <div class="tw-font-bold tw-text-gray-400">
            Convert SVG to CSS Background Image
          </div>
        </div>
        <ActionButtons />
      </div>
      <div class="tw-grid tw-grid-cols-2 tw-gap-4 tw-px-4 tw-grow tw-pb-4">
        <div class="tw-flex tw-flex-col tw-gap-4">
          <div class="tw-shrink-0 tw-flex tw-gap-2">
            <q-btn @click="add_sample" no-caps unelevated size="1.1em" class="tw-rounded-lg tw-bg-white/20">
              <div class="tw-flex tw-justify-between tw-gap-2 tw-items-center">
                <span>Sample SVG</span>
              </div>
              <q-tooltip>
                Add a sample SVG
              </q-tooltip>
            </q-btn>
          </div>
          <div class="tw-grow tw-flex tw-flex-col tw-max-h-full">
            <q-input v-model="input_text" type="textarea" borderless class="tw-grow" placeholder="Input SVG here . . .">
            </q-input>
          </div>
        </div>
        <div class="tw-flex tw-flex-col tw-gap-4">
          <div class="tw-shrink-0 tw-flex tw-justify-end tw-gap-2">
            <q-btn @click="input_text = '', output_css = ''" unelevated size="1.1em" class="tw-rounded-lg tw-bg-white/20 tw-text-red-400">
              <div class="tw-flex tw-justify-between tw-gap-2 tw-items-center">
                <span>Clear</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="tw-h-6 tw-w-6" viewBox="0 0 24 24"><path fill="currentColor" d="M6.4 19L5 17.6l5.6-5.6L5 6.4L6.4 5l5.6 5.6L17.6 5L19 6.4L13.4 12l5.6 5.6l-1.4 1.4l-5.6-5.6L6.4 19Z"/></svg>
              </div>
              <q-tooltip>
                Clear all
              </q-tooltip>
            </q-btn>
            <q-btn @click="handle_action" unelevated size="1.1em" class="tw-rounded-lg tw-bg-green-700">
              <div class="tw-flex tw-justify-between tw-gap-2 tw-items-center">
                <span>Convert</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="tw-h-6 tw-w-6" viewBox="0 0 24 24"><path fill="currentColor" d="M5.825 16L7.7 17.875q.275.275.275.688t-.275.712q-.3.3-.713.3t-.712-.3L2.7 15.7q-.15-.15-.213-.325T2.426 15q0-.2.063-.375T2.7 14.3l3.6-3.6q.3-.3.7-.287t.7.312q.275.3.288.7t-.288.7L5.825 14H12q.425 0 .713.288T13 15q0 .425-.288.713T12 16H5.825Zm12.35-6H12q-.425 0-.713-.288T11 9q0-.425.288-.713T12 8h6.175L16.3 6.125q-.275-.275-.275-.688t.275-.712q-.3-.3-.713-.3t-.712.3L21.3 8.3q.15.15.212.325t.063.375q0 .2-.063.375T21.3 9.7l-3.6 3.6q-.3.3-.7.288t-.7-.313q-.275-.3-.288-.7t.288-.7L18.175 10Z"/></svg>
              </div>
              <q-tooltip>
                Convert SVG to CSS
              </q-tooltip>
            </q-btn>
          </div>
          <div class="tw-grow tw-flex tw-flex-col tw-ov">
            <q-input ref="output" v-model="output_css" readonly type="textarea" borderless class="tw-max-h-full tw-grow" placeholder="Output will be here . . .">
              <template v-slot:append>
                <q-btn @click="download" dense flat class="tw-rounded-lg tw-p-2 tw-bg-black/20">
                  <q-icon name="download"></q-icon>
                  <q-tooltip>
                    Download
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
  name: 'SvgToCss',
  components:{
    ActionButtons
  },
  setup () {
    return {
      input_text: ref(''),
      output_css: ref(''),
    }
  },
  methods:{
    add_sample(){
      this.input_text = `<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="100" fill="red"/>
</svg>`
    },
    handle_action(){
      try {
        const svg = this.input_text.trim();
        const encodedSvg = encodeURIComponent(svg).replace(/'/g, '%27').replace(/"/g, '%22');
        this.output_css = `background-image: url("data:image/svg+xml,${encodedSvg}");`;
      } catch (error) {
        this.$q.notify({
          type: 'negative',
          message: error.message
        })
        console.error(error)
      }
    },
    download(){
      if(this.output_css){
        let fileToSave = new Blob([this.output_css], {
          type: "text/css;charset=utf-8",
          name: 'svg-to-css.css'
        });
        this.saveFile(fileToSave, 'svg-to-css.css');
        this.$q.notify({
          type:'positive',
          message:"File Downloading started..."
        })
      }else{
        console.error("No data")
        this.$q.notify({
          type:'negative',
          message:"No data found."
        })
      }
    },
    saveFile(blob, filename) {
      if (window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveOrOpenBlob(blob, filename);
      } else {
        const a = document.createElement('a');
        document.body.appendChild(a);
        const url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = filename;
        a.click();
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }, 0)
      }
    },
  }
})
</script>

<style>
</style>
