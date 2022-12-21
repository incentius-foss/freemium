<template>
    <q-page>
         <div class="full-width flex row wrap justify-around items-start content-end" >
            <div class="text-center q-my-md">
                <span class="rounded bg-grey-4 px-20 q-py-xs font-normal" >URL Encode/Decode</span>
            </div>
        <div class="full-width flex row wrap" >
                <div class="mt-2 ml-4 col-8 ">
                    <div class="">
                                <b>Input :</b>
                           
                                <q-btn
                                    size="sm"
                                    color="white"
                                    class="px-3 q-pa-none text-black mx-2 rounded-md"
                                    no-caps
                                    dense
                                    @click="sample()"
                                    >Sample</q-btn
                                >
                                <q-btn
                                    size="sm"
                                    color="white"
                                    class="px-3 q-pa-none mr-2 text-black rounded-md"
                                    no-caps
                                    dense
                                    @click="clear()"
                                    >Clear</q-btn
                                >
                    </div>
                </div>
                <div class="text-right ml-10 col-3">
                    <q-radio size="xs" right-label v-model="shape"  @click="encodeURL()" val="line" label="Encode" />
                    <q-radio size="xs" right-label v-model="shape" @click="decodeURL()" val="aline" label="Decode" />
                    
                </div>
            
                <div class="container my-2 mx-3" style="max-width: 100%">
                    <q-card class="my-card col-12">
                        <q-card-section>
                            <q-input class="pl-5" v-model="encodedURLInput" rows="11" placeholder="Enter URL for Encode/Decode" type="textarea" />
                        </q-card-section>
                    </q-card>

                </div>
        </div>
            <q-separator />
            <span class="divider"></span>
        <div class="full-width  row " >
                    <div class="col-10 ml-4"><b>Output :</b>
                    </div>
                    <div class="col-1 ml-14 text-right">
                        <q-btn
                            size="sm"
                            color="white"
                            class="px-3 q-pa-none text-black mr-2 rounded-md"
                            no-caps
                            dense
                            @click="copyToClipboards()"
                        >Clipboard</q-btn>
                    </div>
                
                <div class="container squred mt-2 mx-3" style="max-width: 100%">
                    <q-card class="my-card col-12">
                        <q-card-section class="">
                            <q-input v-model="encodedURLOutput" class="pl-5" placeholder="Output String" rows="11" type="textarea" />
                        </q-card-section>
                    </q-card>
                </div>
        </div>
    </div>
        <!-- <div class="full-width justify-around items-start " style="background-color:#f6f0eb">
            <div class="flex flex-center">
                <span class="rounded bg-grey-4 q-mt-sm py-1 px-20 font-normal" >URL Encode/Decode </span>
            </div>
            <div class="">
                <div class=" q-gutter-y-xs" >
                    <div class="row">
                        <div class="col-9 row inline">
                            <span class="ml-10 mt-4 font-medium text-left">Input :</span>
                            <q-btn class="text-black ml-4 mt-2 capitalize" size="sm"  v-if="panel=='encode'"  @click="encodeURL()" color="white" label="Submit" />
                            <q-btn class="text-black ml-4 mt-2 capitalize" size="sm"  v-if="panel=='decode'"  @click="decodeURL()" color="white" label="Submit" />
                        </div>
                        <q-option-group
                            class=""
                            v-model="panel"
                            inline
                            :options="[
                                { label: 'Encode', value: 'encode' },
                                { label: 'Decode', value: 'decode' },
                            ]"
                        />
                    </div>
                    <q-tab-panels v-model="panel" class="" style="background-color:#f6f0eb">
                        <q-tab-panel name="encode">
                            <div >
                                <q-card-section>
                                    <q-input class="full-width rounded shadow-2 form-control bg-white pl-6" ref="textarea" rows="11" type="textarea" v-model="encodedURLInput" placeholder="Enter URL"/>
                         
                                </q-card-section>
                            </div>
                            <q-separator></q-separator>
                            <div class="q-pa-md" >
                                <span class="ml-2 mt-2 font-medium text-left">Output :</span>
                                <q-input class="full-width rounded shadow-2 form-control bg-white pl-6" ref="textarea" rows="11" type="textarea" v-model="encodedURLOutput"  placeholder="Encoded String" />
                            </div>
                        </q-tab-panel>

                        <q-tab-panel name="decode">
                        <div class="" >
                          
                            <q-card-section>
                                <q-input class="full-hight rounded shadow-2  form-control bg-white pl-6" ref="textarea" rows="11" type="textarea" v-model="decodedInput" placeholder="Enter Decoded URL"/>
                             
                            </q-card-section>
                            <q-separator></q-separator>
                            <div class="q-pa-md">
                                <span class="ml-2 mt-2 font-medium text-left">Output :</span>
                                <q-input class="full-width rounded shadow-2 form-control bg-white pl-6" ref="textarea" rows="11" type="textarea" v-model="decodedOutput"  placeholder="Decoded String"/>
                            </div>
                        </div>
                        </q-tab-panel>
                    </q-tab-panels>
                </div>
            </div>
        </div> -->
    </q-page> 
</template>

<script>
import { copyToClipboard } from 'quasar'
import { ref } from 'vue'

export default {
    data(){
        return{
            shape: '',
            encodedURLInput : '',
            encodedURLOutput : '',
            decodedInput : '',
            decodedOutput : '',
            panel:('encode'),
            flag:1
        }
    },
    methods:{
        copyToClipboards(){
            copyToClipboard(this.encodedURLOutput)
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
        clear(){
            this.encodedURLInput=''
        },
        sample(){this.encodedURLInput='https://www.youtube.com/'
        },
        encodeURL(){
            this.encodedURLOutput = encodeURIComponent(this.encodedURLInput)
        },
        decodeURL(){
            this.encodedURLOutput = decodeURIComponent(this.encodedURLInput)
        }
    }
}
</script>