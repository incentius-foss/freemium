<template>
  <q-page class="tw-py-4 tw-pr-4 tw-flex tw-flex-col ">
    <div class="tw-h-full tw-grow tw-w-full glass-body glass-border tw-rounded-2xl tw-overflow-hidden tw-flex tw-flex-col">
      <div class="tw-p-4 tw-shrink-0 tw-flex tw-items-center tw-justify-between">
        <div class="">
          <div class="tw-text-2xl tw-font-bold">
            Excel to JSON Converter
          </div>
          <div class="tw-font-bold tw-text-gray-400">
            Convert Excel to JSON
          </div>
        </div>
        <ActionButtons />
      </div>
      <div class="tw-flex tw-w-full tw-gap-4 tw-px-4 tw-grow tw-pb-4">
        <div class=" tw-w-72 tw-flex tw-flex-col tw-gap-4">
          <div class="tw-shrink-0 tw-flex tw-gap-2">
            <q-btn @click="add_sample" no-caps unelevated size="1.1em" class="tw-rounded-lg tw-bg-white/20 ">
              <div class="tw-flex tw-justify-between tw-gap-2 tw-items-center">
                <span>Sample Excel File</span>
              </div>
              <q-tooltip>
                Add a sample Excel File
              </q-tooltip>
            </q-btn>
          </div>
          <div class="tw-grow tw-flex tw-flex-col tw-max-h-full ">
            <q-file @update:model-value="onFileDrop" v-model="input_file" class="image-picker tw-overflow-hidden tw-h-48 tw-border tw-border-dashed tw-border-white/50 tw-rounded-xl" borderless >
              <template v-slot:file>
                <div class="tw-h-full tw-w-full tw-bg-black/20">
                  <div class="tw-w-full tw-bg-white/10 tw-p-4 tw-text-lg">
                    Selected File :
                  </div>
                  <div class="">
                    <q-item>
                      <q-item-section class="ellipsis">
                        {{ input_file.name }}
                      </q-item-section>
                      <q-item-section side>
                        {{ (input_file.size/1024).toFixed(2) }} kb
                      </q-item-section>
                    </q-item>
                  </div>
                </div>
              </template>
              <div v-if="!input_file" class="tw-absolute tw--z-10 tw-w-full tw-h-full tw-flex tw-flex-col tw-text-white tw-items-center tw-justify-center">
                <div>
                  Drag and drop your excel file here
                </div>
                <div>Or</div>
                <div>
                  <q-btn dense flat class="tw-rounded-lg tw-px-3 tw-underline" no-caps>
                    <span>Choose files</span>
                  </q-btn>
                </div>
              </div>
            </q-file>
          </div>
        </div>
        <div class=" tw-flex tw-flex-col tw-gap-4 tw-grow">
          <div class="tw-shrink-0 tw-flex tw-justify-end tw-gap-2">
            <q-btn @click="input_text = ''; output_text = ''" unelevated size="1.1em" class="tw-rounded-lg tw-bg-white/20 tw-text-red-400">
              <div class="tw-flex tw-justify-between tw-gap-2 tw-items-center">
                <span>Clear</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="tw-h-6 tw-w-6" viewBox="0 0 24 24"><path fill="currentColor" d="M6.4 19L5 17.6l5.6-5.6L5 6.4L6.4 5l5.6 5.6L17.6 5L19 6.4L13.4 12l5.6 5.6l-1.4 1.4l-5.6-5.6L6.4 19Z"/></svg>
              </div>
              <q-tooltip>
                Clear all
              </q-tooltip>
            </q-btn>
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
import * as XLSX from 'xlsx'
import ActionButtons from 'src/components/ActionButtons.vue'


export default defineComponent({
  name: 'ExcelToJson',
  components:{
    ActionButtons
  },
  setup () {
    return {
      convert_option:ref('Encode'),
      input_text:ref(''),
      output_text:ref(''),
      input_file:ref()
    }
  },
  methods:{
    async add_sample(){
      try {
        const response = await fetch('/sample.xlsx');
        const blob = await response.blob();
        this.input_file = new File([blob],'sample.xlsx')
        this.onFileDrop(blob)
      } catch (error) {
        console.error('Error:', error);
      }
    },
    onFileDrop(file){
      let reader = new FileReader()
      reader.onloadend = (e)=>{
        this.convert(e.target.result)
      }
      reader.readAsArrayBuffer(file)
    },
    convert(file){
      let workbook = XLSX.read(file)
      let sheet_names = workbook.SheetNames
      if(sheet_names.length){
        let sheet = workbook.Sheets[sheet_names[0]]
        let out = XLSX.utils.sheet_to_json(sheet)
        this.output_text = JSON.stringify(XLSX.utils.sheet_to_json(sheet))
      }else{
        console.error("Empty excel");
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
