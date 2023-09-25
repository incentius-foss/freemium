<template>
  <q-page class="tw-py-4 tw-pr-4 tw-flex tw-flex-col ">
    <div class="tw-h-full tw-grow tw-w-full glass-body glass-border tw-rounded-2xl tw-overflow-hidden tw-flex tw-flex-col">
      <div class="tw-p-4 tw-shrink-0 tw-flex tw-items-center tw-justify-between">
        <div class="">
          <div class="tw-text-2xl tw-font-bold">
            Convert Text Style
          </div>
          <div class="tw-font-bold tw-text-gray-400">
            You modify your text styling here.
          </div>
        </div>
        <ActionButtons />
      </div>
      <div class="tw-grid tw-grid-cols-2 tw-gap-4 tw-px-4 tw-grow tw-pb-4">
        <div class=" tw-flex tw-flex-col tw-gap-4">
          <div class="tw-shrink-0">
            <q-select class="select-scrollbar" v-model="selected_modifier" :options="options" borderless dense>
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section>
                    <q-item-label class="tw-font-bold tw-text-white/80">{{ scope.opt.label }}</q-item-label>
                    <q-item-label caption v-html="scope.opt.example"></q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
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
            <q-btn @click="handle_action" unelevated size="1.1em" class="tw-rounded-lg tw-bg-green-700">
              <div class="tw-flex tw-justify-between tw-gap-2 tw-items-center">
                <span>Convert</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="tw-h-6 tw-w-6" viewBox="0 0 24 24"><path fill="currentColor" d="M5.825 16L7.7 17.875q.275.275.275.688t-.275.712q-.3.3-.713.3t-.712-.3L2.7 15.7q-.15-.15-.213-.325T2.426 15q0-.2.063-.375T2.7 14.3l3.6-3.6q.3-.3.7-.287t.7.312q.275.3.288.7t-.288.7L5.825 14H12q.425 0 .713.288T13 15q0 .425-.288.713T12 16H5.825Zm12.35-6H12q-.425 0-.713-.288T11 9q0-.425.288-.713T12 8h6.175L16.3 6.125q-.275-.275-.275-.688t.275-.712q.3-.3.713-.3t.712.3L21.3 8.3q.15.15.212.325t.063.375q0 .2-.063.375T21.3 9.7l-3.6 3.6q-.3.3-.7.288t-.7-.313q-.275-.3-.288-.7t.288-.7L18.175 10Z"/></svg>
              </div>
              <q-tooltip>
                Convert Text
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
import ActionButtons from 'src/components/ActionButtons.vue'

export default defineComponent({
  name: 'TextStyle',
  components:{
    ActionButtons
  },
  setup () {
    return {
      selected_modifier:ref({
        label:"Title case",
        example:"This Is A Title Case Sentence.",
      }),
      options:[
        {
          label:"Title case",
          example:"This Is A Title Case Sentence.",
        },
        {
          label:"Capitalize",
          example:"This is capitalized sentence.",
        },
        {
          label:"Lowercase",
          example:"this is lowercase sentence.",
        },
        {
          label:"Uppercase",
          example:"THIS IS UPPERCASE SENTENCE.",
        },
        {
          label:"Alternate case",
          example:"tHiS Is aLtErNaTe cAsE SeNtEnCe.",
        },
        {
          label:"Inverse case",
          example:"ThIs iS InVeRsE CaSe sEnTeNcE.",
        },
        {
          label:"Wide",
          example:"T,h,i,s, ,i,s, ,w,i,d,e, ,s,e,n,t,e,n,c,e,.",
        },
        {
          label:"Strike Through",
          example:"<del>This is strike through sentence.</del>",
        },
        {
          label:"Reverse",
          example:".ecnetnes esrever si sihT",
        },
        {
          label:"Binary",
          example:"1100010 1101001 1101110 1100001 1110010 1111001",
        },
      ],
      input_text:ref(''),
      output_text:ref(''),
    }
  },
  methods:{
    handle_action(){
      switch(this.selected_modifier.label){
        case "Title case":
          this.convert_to_title_case()
          break;
        case "Capitalize":
          this.capitalized()
          break;
        case "Lowercase":
          this.convert_to_lowercase()
          break;
        case "Uppercase":
          this.convert_to_uppercase()
          break;
        case "Alternate case":
          this.convert_to_alternate_case()
          break;
        case "Inverse case":
          this.convert_to_inverse_case()
          break;
        case "Wide":
          this.convert_to_wide_case()
          break;
        case "Strike Through":
          this.convert_to_strike_through()
          break;
        case "Reverse":
          this.convert_to_reverse()
          break;
        case "Binary":
          this.convert_to_binary()
          break;
        default:
          console.log("No option selected")
      }
    },
    convert_to_title_case(){
      this.output_text = this.input_text.toLowerCase()
        .split(" ")
        .map((word)=> word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    },
    capitalized(){
      let lowered = this.input_text.toLowerCase()
      this.output_text = lowered.charAt(0).toUpperCase() + lowered.slice(1)
    },
    convert_to_lowercase(){
      this.output_text = this.input_text.toLowerCase()
    },
    convert_to_uppercase(){
      this.output_text = this.input_text.toUpperCase()
    },
    convert_to_alternate_case(){
      let out = ""
      for (let i = 0; i < this.input_text.length; i++) {
        if (i % 2 == 0) {
          out = out + this.input_text[i].toLowerCase()
        } else {
          out = out + this.input_text[i].toUpperCase()
        }
      }
      this.output_text = out
    },
    convert_to_inverse_case(){
      let out = ""
      for (let i = 0; i < this.input_text.length; i++) {
        if (i % 2 == 1) {
          out = out + this.input_text[i].toLowerCase()
        } else {
          out = out + this.input_text[i].toUpperCase()
        }
      }
      this.output_text = out
    },
    convert_to_wide_case(){
      this.output_text = this.input_text.match(/.{1}/g)
    },
    convert_to_strike_through(){
      this.output_text = this.input_text.split("").map((c) => c + "\u0335").join("")
    },
    convert_to_reverse(){
      this.output_text = this.input_text
        .split("")
        .reverse()
        .join("")
    },
    convert_to_binary(){
      this.output_text = this.input_text.split('').map((char) => {
        return char.charCodeAt(0).toString(2);
      }).join(' ')
    },
    copy(){
      this.$refs.output.select()
      navigator.clipboard.writeText(this.output_text)
      this.$q.notify({
        type:'positive',
        message:"Copied to clipboard"
      })
    }
  }
})
</script>
<style>

</style>
