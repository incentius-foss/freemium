<template>
  <q-page class="tw-py-4 tw-pr-4 tw-flex tw-flex-col">
    <div
      class="tw-h-full tw-grow tw-w-full glass-body glass-border tw-rounded-2xl tw-overflow-hidden tw-flex tw-flex-col">
      <div class="tw-p-4 tw-shrink-0 tw-flex tw-items-center tw-justify-between">
        <div>
          <div class="tw-text-2xl tw-font-bold">
            XML Beautify/Minify
          </div>
          <div class="tw-font-bold tw-text-gray-400">
            Format your XML code
          </div>
        </div>
        <ActionButtons/>
      </div>
      <div class="tw-grid tw-grid-cols-2 tw-gap-4 tw-px-4 tw-grow tw-pb-4">
        <div class="tw-flex tw-flex-col tw-gap-4">
          <div class="tw-shrink-0 tw-flex tw-gap-2">
            <q-btn @click="addSample" no-caps unelevated size="1.1em" class="tw-rounded-lg tw-bg-white/20">
              <div class="tw-flex tw-justify-between tw-gap-2 tw-items-center">
                <span>Sample XML</span>
              </div>
              <q-tooltip>
                Add a sample XML
              </q-tooltip>
            </q-btn>
          </div>
          <div class="tw-grow tw-flex tw-flex-col tw-max-h-full">
            <q-input v-model="inputText" type="textarea" borderless class="tw-grow" placeholder="Input XML here . . .">
            </q-input>
          </div>
        </div>
        <div class="tw-flex tw-flex-col tw-gap-4">
          <div class="tw-shrink-0 tw-flex tw-justify-end tw-gap-2">
            <q-btn @click="clearAll" unelevated size="1.1em" class="tw-rounded-lg tw-bg-white/20 tw-text-red-400">
              <div class="tw-flex tw-justify-between tw-gap-2 tw-items-center">
                <span>Clear</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="tw-h-6 tw-w-6" viewBox="0 0 24 24">
                  <path fill="currentColor"
                        d="M6.4 19L5 17.6l5.6-5.6L5 6.4L6.4 5l5.6 5.6L17.6 5L19 6.4L13.4 12l5.6 5.6l-1.4 1.4l-5.6-5.6L6.4 19Z"/>
                </svg>
              </div>
              <q-tooltip>
                Clear all
              </q-tooltip>
            </q-btn>
            <q-btn @click="beautifyXml" unelevated size="1.1em" class="tw-rounded-lg tw-bg-green-700">
              <div class="tw-flex tw-justify-between tw-gap-2 tw-items-center">
                <span>Beautify</span>
              </div>
              <q-tooltip>
                Beautify XML
              </q-tooltip>
            </q-btn>
            <q-btn @click="minifyXml" unelevated size="1.1em" class="tw-rounded-lg tw-bg-blue-700">
              <div class="tw-flex tw-justify-between tw-gap-2 tw-items-center">
                <span>Minify</span>
              </div>
              <q-tooltip>
                Minify XML
              </q-tooltip>
            </q-btn>
          </div>
          <div class="tw-grow tw-flex tw-flex-col tw-ov">
            <q-input ref="output" v-model="outputXml" readonly type="textarea" borderless class="tw-max-h-full tw-grow"
                     placeholder="Output will be here . . .">
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
import {defineComponent, ref} from 'vue';
import vkbeautify from 'vkbeautify';
import ActionButtons from 'src/components/ActionButtons.vue';

export default defineComponent({
  name: 'XmlBeautifyMinify',
  components: {
    ActionButtons
  },
  setup() {
    const inputText = ref('');
    const outputXml = ref('');

    const addSample = () => {
      inputText.value = `<catalog><book id="bk101"><author>Gambardella, Matthew</author><title>XML Developer's Guide</title><genre>Computer</genre><price>44.95</price><publish_date>2000-10-01</publish_date><description>An in-depth look at creating applications with XML.</description></book><book id="bk102"><author>Ralls, Kim</author><title>Midnight Rain</title><genre>Fantasy</genre><price>5.95</price><publish_date>2000-12-16</publish_date><description>A former architect battles corporate zombies, an evil sorceress, and her own childhood to become queen of the world.</description></book><book id="bk103"><author>Corets, Eva</author><title>Maeve Ascendant</title><genre>Fantasy</genre><price>5.95</price><publish_date>2000-11-17</publish_date><description>After the collapse of a nanotechnology society in England, the young survivors lay the foundation for a new society.</description></book></catalog>`;
    };

    const clearAll = () => {
      inputText.value = '';
      outputXml.value = '';
    };

    const beautifyXml = () => {
      outputXml.value = vkbeautify.xml(inputText.value, 2);
    };

    const minifyXml = () => {
      outputXml.value = vkbeautify.xmlmin(inputText.value);
    };

    const download = () => {
      if (outputXml.value) {
        const blob = new Blob([outputXml.value], {
          type: 'text/xml;charset=utf-8',
          name: 'beautified-or-minified.xml'
        });
        saveFile(blob, 'beautified-or-minified.xml');
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
      outputXml,
      addSample,
      clearAll,
      beautifyXml,
      minifyXml,
      download
    };
  },
  methods:{
    copy(){
      this.$refs.output.select()
      navigator.clipboard.writeText(this.outputXml)
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
