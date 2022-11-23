<template>
    <q-page>
        <q-card class="my-card text-dark" bordered style="background-color:#f6f0eb">
        <q-card-section>
            <div class="text-h5"><b>Image To Base64</b></div>
        </q-card-section>
        <q-card-section>
            <q-uploader accept=".xls,.xlsx" label="Upload Excel file" type="file" flat color="teal" bordered multiple  style="width:100%" @added="encodeBase64"/>
            <!-- <q-input bordered multiple  type="file" style="width:100%" @change="encodeBase64()"></q-input> -->
        </q-card-section>
        <div class="text-h5 ml-4"><b>Output : </b></div>
        <div class="q-pa-md" style="max-width: 100%">
            <q-input v-model="encodingOutput" filled placeholder="Encoded String" ref="textarea"
                rows="40"
                type="textarea" />
        </div>
    </q-card>
    </q-page>
</template>
<script>
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
        encodeBase64(event) {
            const file = document.querySelector('input[type=file]').files[0]
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