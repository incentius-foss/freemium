<template>
    <q-page>
        <div class="full-width justify-around items-start " style="background-color:#f6f0eb">
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
                                    <!-- <q-btn class="text-white mt-2 capitalize "   @click="encodeURL()" color="black" label="Submit" /> -->
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
                            <!-- <q-card-section>
                                <div class="text-h5"><b>Decode URL</b></div>
                            </q-card-section> -->
                            <q-card-section>
                                <q-input class="full-hight rounded shadow-2  form-control bg-white pl-6" ref="textarea" rows="11" type="textarea" v-model="decodedInput" placeholder="Enter Decoded URL"/>
                                <!-- <q-btn class="mt-5" @click="decodeURL()" color="black" label="Submit" /> -->
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
        </div>
    </q-page> 
</template>

<script>

import { ref } from 'vue'

export default {
    data(){
        return{
            encodedURLInput : '',
            encodedURLOutput : '',
            decodedInput : '',
            decodedOutput : '',
            panel:('encode'),
            flag:1
        }
    },
    methods:{
        encodeURL(){
            this.encodedURLOutput = encodeURIComponent(this.encodedURLInput)
        },
        decodeURL(){
            this.decodedOutput = decodeURIComponent(this.decodedInput)
        }
    }
}
</script>