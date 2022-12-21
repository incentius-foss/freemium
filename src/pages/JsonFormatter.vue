<template>
  <q-page>

    <div class="full-width flex row wrap justify-around items-start content-end">
      <div class="text-center q-my-md">
        <span class="rounded bg-grey-4 px-20 q-py-xs font-semibold">JSON Format/Validate</span>
      </div>
      <div class="full-width flex justify-between row wrap justify-around items-start content-end">
        <div class="col-5" style="overflow:auto">
          <!-- <q-card bordered class="my-card" > -->
          <q-card-section class="q-pa-none q-ma-none">
            <div class="ml-2 row">
              <div class="col-4 text-left">
                <b>JSON Data :</b></div>
              <div class="col-8 text-right">
                <q-btn
                  size="sm"
                  color="white"
                  class="px-3 q-pa-none text-black mr-2 rounded-md"
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
                <q-btn
                  size="sm"
                  color="white"
                  class="px-3 q-pa-none mr-2 text-black rounded-md"
                  no-caps
                  dense
                  @click="jsonFormatter()"
                >Convert
                </q-btn
                >
              </div>

              <!-- <div class="text-subtitle2"></div> -->
            </div>
          </q-card-section>

          <q-card-actions vertical align="center">
            <q-input class="full-width form-control bg-white pl-5" v-model="json_data"
                     placeholder="Enter your JSON here...." ref="textarea"
                     rows="27"
                     type="textarea"/>
          </q-card-actions>
          <!-- </q-card> -->
        </div>
        <q-separator class="q-pa-none q-ma-none" vertical></q-separator>
        <div class="col-6" style="overflow:auto ">
          <!-- <q-card bordered class="my-card" > -->
          <q-card-section class="q-pa-none q-ma-none">
            <div class="ml-2 row">
              <div class="col-8"><b>Formated Data :</b></div>
              <div class="col-4 text-right">
                <q-btn
                  size="sm"
                  color="white"
                  class="px-3 q-pa-none text-black mr-2 rounded-md"
                  no-caps
                  dense
                  @click="copyToClipboards()"
                >Clipboard
                </q-btn
                >
              </div>

              <!-- <div class="text-subtitle2"></div> -->
            </div>
          </q-card-section>

          <q-card-actions vertical align="center">
            <q-input class="full-width bg-white pl-5" v-model="formated_data"
                     placeholder="YOUR JSON will appear here...." ref="textarea"
                     rows="27"
                     type="textarea"/>
          </q-card-actions>
          <!-- </q-card> -->
        </div>

      </div>

      <!-- <q-btn color="black" class="justify-center mt-5" label="Format" @click="jsonFormatter()" /> -->
    </div>
    <!-- <q-btn color="black" class="float-right mt-5 mr-5" label="Convert" @click="jsonFormatter()" /> -->
    <span>{{ loremIpsum }}</span>
  </q-page>
</template>

<script>
import {copyToClipboard} from 'quasar'

export default {
  name: 'JsonFormatter',
  data() {
    return {
      json_data: [],
      formated_data: [],
      loremIpsum: "",
    }
  },

  methods: {
    copyToClipboards() {
      copyToClipboard(this.formated_data)
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
    }
    ,
    clear() {
      this.json_data = ''
    },
    sample() {
      this.json_data = '{"sample_data": "sample_data", "data": "data", "name": "json"}'
    },
    jsonFormatter() {
      this.formated_data = JSON.stringify(JSON.parse(this.json_data), undefined, '\t')
      console.log("ddtffdd", this.formated_data)

    }
  }
}
</script>
<style scoped>
.q-field__control {
  background-color: white
}
</style>
