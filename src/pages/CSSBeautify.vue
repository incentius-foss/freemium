<template>
  <q-page class="tw-py-4 tw-pr-4 tw-flex tw-flex-col">
    <div class="tw-h-full tw-grow tw-w-full glass-body glass-border tw-rounded-2xl tw-overflow-hidden tw-flex tw-flex-col">
      <div class="tw-p-4 tw-shrink-0 tw-flex tw-items-center tw-justify-between">
        <div>
          <div class="tw-text-2xl tw-font-bold">
            CSS Beautify/Minify
          </div>
          <div class="tw-font-bold tw-text-gray-400">
            Format your CSS code
          </div>
        </div>
        <ActionButtons />
      </div>
      <div class="tw-grid tw-grid-cols-2 tw-gap-4 tw-px-4 tw-grow tw-pb-4">
        <div class="tw-flex tw-flex-col tw-gap-4">
          <div class="tw-shrink-0 tw-flex tw-gap-2">
            <q-btn @click="addSample" no-caps unelevated size="1.1em" class="tw-rounded-lg tw-bg-white/20">
              <div class="tw-flex tw-justify-between tw-gap-2 tw-items-center">
                <span>Sample CSS</span>
              </div>
              <q-tooltip>
                Add a sample CSS
              </q-tooltip>
            </q-btn>
          </div>
          <div class="tw-grow tw-flex tw-flex-col tw-max-h-full">
            <q-input v-model="inputText" type="textarea" borderless class="tw-grow" placeholder="Input CSS here . . .">
            </q-input>
          </div>
        </div>
        <div class="tw-flex tw-flex-col tw-gap-4">
          <div class="tw-shrink-0 tw-flex tw-justify-end tw-gap-2">
            <q-btn @click="clearAll" unelevated size="1.1em" class="tw-rounded-lg tw-bg-white/20 tw-text-red-400">
              <div class="tw-flex tw-justify-between tw-gap-2 tw-items-center">
                <span>Clear</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="tw-h-6 tw-w-6" viewBox="0 0 24 24"><path fill="currentColor" d="M6.4 19L5 17.6l5.6-5.6L5 6.4L6.4 5l5.6 5.6L17.6 5L19 6.4L13.4 12l5.6 5.6l-1.4 1.4l-5.6-5.6L6.4 19Z"/></svg>
              </div>
              <q-tooltip>
                Clear all
              </q-tooltip>
            </q-btn>
            <q-btn @click="beautifyCss" unelevated size="1.1em" class="tw-rounded-lg tw-bg-green-700">
              <div class="tw-flex tw-justify-between tw-gap-2 tw-items-center">
                <span>Beautify</span>
              </div>
              <q-tooltip>
                Beautify CSS
              </q-tooltip>
            </q-btn>
            <q-btn @click="minifyCss" unelevated size="1.1em" class="tw-rounded-lg tw-bg-blue-700">
              <div class="tw-flex tw-justify-between tw-gap-2 tw-items-center">
                <span>Minify</span>
              </div>
              <q-tooltip>
                Minify CSS
              </q-tooltip>
            </q-btn>
          </div>
          <div class="tw-grow tw-flex tw-flex-col tw-ov">
            <q-input ref="output" v-model="outputCss" readonly type="textarea" borderless class="tw-max-h-full tw-grow" placeholder="Output will be here . . .">
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
import { defineComponent, ref } from 'vue';
import { css as cssBeautify } from 'js-beautify';
import ActionButtons from 'src/components/ActionButtons.vue';

export default defineComponent({
  name: 'CssBeautifyMinify',
  components: {
    ActionButtons
  },
  setup() {
    const inputText = ref('');
    const outputCss = ref('');

    const addSample = () => {
      inputText.value = `@font-face{font-family:Chunkfive;src:url('Chunkfive.otf');}body,.usertext{color:#F0F0F0;background:#600;font-family:Chunkfive,sans;}@import url('print.css');@media print{a[href^=http]:after{content:attr(href);}}`;
    };

    const clearAll = () => {
      inputText.value = '';
      outputCss.value = '';
    };

    const beautifyCss = () => {
      outputCss.value = cssBeautify(inputText.value);
    };

    const minifyCss = () => {
      outputCss.value = cssBeautify(inputText.value, {
        indent_size: 0,
        preserve_newlines: false,
        space_in_empty_paren: false
      }).replace(/\n/g, '');
    };

    const download = () => {
      if (outputCss.value) {
        const blob = new Blob([outputCss.value], {
          type: 'text/css;charset=utf-8',
          name: 'beautified-or-minified.css'
        });
        saveFile(blob, 'beautified-or-minified.css');
      } else {
        console.error('No data');
      }
    };

    const saveFile = (blob, filename) => {
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
        }, 0);
      }
    };



    return {
      inputText,
      outputCss,
      addSample,
      clearAll,
      beautifyCss,
      minifyCss,
      download,
    };
  },
  methods:{
    copy(){
      this.$refs.output.select()
      navigator.clipboard.writeText(this.outputCss)
      this.$q.notify({
        type:'positive',
        message:"Copied to clipboard"
      })
    }
  }
});
</script>

<style>
</style>
