<template>
<q-page>
    <!-- String to base64 -->
    <q-card class="my-card text-dark" bordered>
        <q-card-section>
            <div class="text-h5"><b>Encode to Base64 format</b></div>
        </q-card-section>
        <q-card-section>
            <q-input filled v-model="encodingInput" placeholder="Enter character String" />
            <q-btn class="mt-5" @click="encodeBase64()" color="black" label="Submit" />
        </q-card-section>

        <div class="q-pa-md" style="max-width: 100%">
            <q-input v-model="encodingOutput" filled placeholder="Encoded String" type="textarea" />
        </div>
    </q-card>
<!-- Base to string -->
    <q-card class="my-card text-dark mt-5" bordered>
        <q-card-section>
            <div class="text-h5"><b>Decode from Base64 format</b></div>
        </q-card-section>
        <q-card-section>
            <q-input filled v-model="decodingInput" placeholder="Enter base64 String" />
            <q-btn class="mt-5" @click="decodeBase64()" color="black" label="Submit" />
        </q-card-section>
        <div class="q-pa-md" style="max-width: 100%">
            <q-input v-model="decodingOutput" filled aria-placeholder="Decoded String" type="textarea" />
        </div>
    </q-card>
    <q-separator />
</q-page>

</template>

<script>
export default {
    name:"base64",
    data() {
        return {
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
            var decodedString = atob(this.decodingInput);
            this.decodingOutput = decodedString;
        }
    }
};
</script>

<style scoped>
.is-danger {
    color: red;
}
</style>
