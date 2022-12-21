<template>
    <q-page>
        <div class="full-width flex row wrap justify-around items-start content-end" >
            <div class="text-center q-my-md">
                    <span class="rounded bg-grey-4 px-20 q-py-xs font-normal" >Image To Base64</span>
                </div>
        </div>
            <div>
                    <!-- <q-card class="my-card text-dark" bordered style="background-color:#f6f0eb"> -->
                    <q-card-section class="q-pb-none">
                        <div class="ml-1"><b>Upload Image</b></div>
                    </q-card-section>
                    <q-card-section class="q-my-none">
                        <q-uploader  label="Upload image" type="file" flat color="teal" bordered multiple  style="width:100%" @added="encodeBase64"/>

                    </q-card-section>
                    <div class=" ml-5"><b>Output : </b>
                    <q-btn
                            size="sm"
                            color="white"
                            class="px-3 q-pa-none text-black mr-5 rounded-md float-right"
                            no-caps
                            dense
                            @click="copyToClipboards()"
                        >Clipboard</q-btn></div>
                    <div class="q-pa-md" style="max-width: 100%">
                        <q-input v-model="encodingOutput" class="bg-white pl-5" placeholder="Encoded String" ref="textarea"
                            rows="19"
                            type="textarea" />
                    </div>
                   <!-- </q-card> -->
            </div>
        
    </q-page>
</template>
<script>
import { copyToClipboard } from 'quasar'
export default {
    name:"base64Image",
     data() {
        return {
            encodingInput: "",
            encodingOutput: "",
            decodingInput: "",
            decodingOutput: ""
        };
    },
    mounted(){
        this.resize
    },
    methods:{
        copyToClipboards(){
            copyToClipboard(this.encodingOutput)
            .then(() => {
                    this.$q.notify({
                  message: 'Your text copied successfully',
                  type: 'warning',
                  color: 'positive',
                  textColor: 'black',
                  icon: 'thumb_up_alt'
              });
            })
            .catch(() => {
                
            })
        },
        encodeBase64(event) {
            const file = event[0]
            const reader = new FileReader()

            let rawImg;
            reader.onloadend = () => {
            this.encodingOutput = reader.result;
            }
            reader.readAsDataURL(file);
            console.log(file)
        },
        resize(){
            const { textarea } = this.$refs;
            textarea.style.height = textarea.scrollHeight - 4 + 'px';
        }
    }
}
</script>