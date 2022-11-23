<template>
<div>
        <q-card class="my-card text-dark" bordered style="background-color:#f6f0eb">
            <q-card-section>
                <div class="text-h5 mt-5"><b>QR-Code Generator</b></div>
            </q-card-section>
            <q-card-section>
                <input id="qr-text" type="text" filled placeholder="Text to generate QR code" />
                <q-btn class="mt-5 " @click="generateQRCode" color="black" label="Convert" />
            </q-card-section>

            <div class="q-pa-md" style="max-width: 100%">
                <!-- <p id="qr-result">This is deault QR code:</p> -->
                <div id="qr-result" class="text-h5 mt-5"><b>This is deault QR code:</b></div>
                <canvas id="qr-code" class="mt-5" filled placeholder="Encoded String" />
            </div>
        </q-card>

    </div>
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
body {
    padding: 20px;
}

input {
    padding: 5px;
    background-color: transparent;
    border: none;
    border-bottom: solid 4px #8c52ff;
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
