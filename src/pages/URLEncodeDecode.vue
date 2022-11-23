<template>
     <q-page>
        <q-card class="my-card text-dark" bordered style="background-color:#f6f0eb">
        <q-card-section>
            <div class="text-h5"><b>Encode URL</b></div>
        </q-card-section>
        <q-card-section>
            <q-input filled v-model="encodedURLInput" placeholder="Enter URL" />
            <q-btn class="mt-5" @click="encodeURL()" color="black" label="Submit" />
        </q-card-section>

        <div class="q-pa-md" style="max-width: 100%">
            <q-input v-model="encodedURLOutput" filled placeholder="Encoded String" type="textarea" />
        </div>
    </q-card>
<!-- Base to string -->
    <q-card class="my-card text-dark mt-5" bordered>
        <q-card-section>
            <div class="text-h5"><b>Decode URL</b></div>
        </q-card-section>
        <q-card-section>
            <q-input filled v-model="decodedInput" placeholder="Enter Decoded URL" />
            <q-btn class="mt-5" @click="decodeURL()" color="black" label="Submit" />
        </q-card-section>
        <div class="q-pa-md" style="max-width: 100%">
            <q-input v-model="decodedOutput" filled placeholder="Decoded String" type="textarea" />
        </div>
    </q-card>
    </q-page>
</template>

<script>
export default {
    data(){
        return{
            encodedURLInput : '',
            encodedURLOutput : '',
            decodedInput : '',
            decodedOutput : ''
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