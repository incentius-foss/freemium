<template>
  <q-page>
    <div class="full-width flex row wrap justify-around items-start content-end">
      <div class="text-center q-my-md">
        <span class="rounded bg-grey-4 px-20 q-py-xs font-semibold">Base64 String Encode/Decode</span>
      </div>
      <div class="full-width flex row wrap">
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
            >Sample
            </q-btn
            >
            <q-btn
              size="sm"
              color="white"
              class="px-3 q-pa-none mr-2 text-black rounded-md"
              no-caps
              dense
              @click="clear()"
            >Clear
            </q-btn
            >
          </div>
        </div>
        <div class="text-right ml-10 col-3">
          <q-radio size="xs" right-label v-model="shape" @click="encodeBase64()" val="line" label="Encode"/>
          <q-radio size="xs" right-label v-model="shape" @click="decodeBase64()" val="aline" label="Decode"/>

        </div>

        <div class="container my-2 mx-3" style="max-width: 100%">
          <q-card class="my-card col-12">
            <q-card-section>
              <q-input class="pl-5" v-model="encodingInput" rows="11" placeholder="Input String" type="textarea"/>
            </q-card-section>
          </q-card>

        </div>
      </div>
      <q-separator/>
      <span class="divider"></span>
      <div class="full-width  row ">
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
          >Clipboard
          </q-btn>
        </div>

        <div class="container squred mt-2 mx-3" style="max-width: 100%">
          <q-card class="my-card col-12">
            <q-card-section class="">
              <q-input v-model="encodingOutput" class="pl-5" placeholder="Output String" rows="11" type="textarea"/>
            </q-card-section>
          </q-card>
        </div>
      </div>

    </div>
  </q-page>

</template>

<script>
import {copyToClipboard} from 'quasar'

export default {
  name: "base64",
  data() {
    return {
      shape: '',
      encodingInput: "",
      encodingOutput: "",
      decodingInput: ""
    };
  },
  methods: {
    copyToClipboards() {
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
    clear() {
      this.encodingInput = ''
    },
    sample() {
      this.encodingInput = 'sample string data for testing.'
    },
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
