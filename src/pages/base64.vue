<template>
    <q-page>
    <div class="full-width flex row wrap justify-around items-start content-end" >
            <div class="text-center q-my-md">
                <span class="rounded bg-grey-4 px-20 q-py-xs font-normal" >Base64 String Encode/Decode</span>
            </div>
        <div class="full-width flex row wrap" >
                <div class="mt-2 ml-4 col-8 "><b>Input :</b>
                </div>
                <div class="text-right ml-10 col-3">
                    <q-radio size="xs" right-label v-model="shape"  @click="encodeBase64()" val="line" label="Encode" />
                    <q-radio size="xs" right-label v-model="shape" @click="decodeBase64()" val="aline" label="Decode" />
                    
                </div>
            
            <div class="container my-2 mx-3">
                <q-card class="my-card col-12">
                    <q-card-section>
                        <q-input class="pl-5" v-model="encodingInput" rows="11" placeholder="Input String" type="textarea" />
                    </q-card-section>
                </q-card>

            </div>
        </div>
            <q-separator />
            <span class="divider"></span>
        <div class="full-width flex row wrap" >
            <div class="ml-4"><b>Output :</b>
            </div>
            <div class="container squred mt-2 mx-3">
                <q-card class="my-card col-12">
                    <q-card-section class="">
                        <q-input v-model="encodingOutput" class="pl-5" placeholder="Output String" rows="11" type="textarea" />
                    </q-card-section>
                </q-card>
            </div>
                    
        </div>
    </div>
    </q-page>

</template>

<script>
export default {
    name:"base64",
    data() {
        return {
            shape: '',
            encodingInput: "",
            encodingOutput: "",
            decodingInput: "",
            decodingOutput: ""
        };
    },
    methods: {
        encodeBase64() {
            var encodedString = btoa(this.encodingInput);
            this.encodingOutput = encodedString;
        },
        decodeBase64() {
            var decodedString = atob(this.encodingInput);
            this.encodingOutput = decodedString;
        }
    }
};
</script>

<style scoped>
.is-danger {
    color: red;
}
.divider {
  flex-grow: 1;
  border-bottom: 1px solid #d8d3ce;
  margin: 5px
}
</style>
