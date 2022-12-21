<template>
  <q-page>
    <div class="full-width flex row wrap justify-around items-start content-end">
      <div class="text-center q-my-md">
        <span class="rounded bg-grey-4 px-20 q-py-xs font-normal">QR-Code Generator</span>
      </div>
    </div>
    <div class="full-width flex justify-between row wrap justify-around items-start content-end">
      <div class="col-5" style="overflow:auto">


        <q-card-section vertical align="left">

          <input id="qr-text" autogrow class="full-width rounded  form-control bg-white pl-6" ref="text" rows="12"
                 type="text" placeholder="Text to generate QR code"/>
          <!-- <q-btn class="mt-5 " @click="generateQRCode" color="black" label="Convert" /> -->
          <q-btn size="sm" color="white" class="px-3 q-pa-none mr-2 mt-3 text-black rounded-md" no-caps dense
                 @click="generateQRCode">Convert
          </q-btn>
        </q-card-section>
      </div>
      <q-separator class="q-pa-none q-ma-none" vertical></q-separator>
      <div class=" col-6" style="overflow:auto ">
        <!-- <q-card-section class="q-pa-none q-ma-none">
            <div class=" text-center"><b>Output</b></div>
            <div class="text-subtitle2"></div>
        </q-card-section> -->

        <q-card-section vertical align="center">
          <div id="qr-result" class="text-h5"><b>This is Your QR code:</b></div>
          <canvas id="qr-code" class="mt-5" placeholder="Encoded String"/>
        </q-card-section>
      </div>

    </div>

    <!-- <q-btn color="black" class="justify-center mt-5" label="Format" @click="jsonFormatter()" /> -->

    <!-- <q-btn color="black" class="float-right mt-5 mr-5" label="Convert" @click="sql_formatter()" />

    <q-card class="my-card text-dark" bordered style="background-color:#f6f0eb">
        <q-card-section>
            <div class="text-h5 mt-5"><b>QR-Code Generator</b></div>
        </q-card-section>
        <q-card-section>
            <input id="qr-text" type="text" filled placeholder="Text to generate QR code" />
            <q-btn class="mt-5 " @click="generateQRCode" color="black" label="Convert" />
        </q-card-section>

        <div class="" style="max-width: 100%"> -->
    <!-- <p id="qr-result">This is deault QR code:</p> -->
    <!-- <div id="qr-result" class="text-h5 mt-5"><b>This is deault QR code:</b></div>
    <canvas id="qr-code" class="mt-5" filled placeholder="Encoded String" />
</div>
</q-card> -->

  </q-page>
</template>

<script>
export default {
  data() {
    return {
      qr: ''
    }
  },

  methods: {
    generateQRCode() {

      this.qr = new QRious({
        element: document.getElementById('qr-code'),
        size: 200,
        value: ""
      });

      var qrtext = document.getElementById("qr-text").value;
      document.getElementById("qr-result");
      this.qr.set({
        foreground: 'black',
        size: 200,
        value: qrtext
      });
    }
  }
}
</script>

<style>
/* CSS comes here */
/* body {
    padding: 20px;
} */

input {
  padding: 5px;
  background-color: transparent;
  border: none;
  width: 100%;
  font-size: 16px;
}

.qr-btn {
  background-color: #8c52ff;
  padding: 8px;
  color: white;
  cursor: pointer;
}
</style>
