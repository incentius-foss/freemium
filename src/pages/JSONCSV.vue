<template>
<q-page class="">
    <q-card class="my-card text-dark" style="background-color:#f6f0eb" bordered>
        <q-card-section>
            <div class="text-h5 mt-5"><b>JSON TO CSV</b></div>
        </q-card-section>
        <q-card-section>
            <q-input type="textarea" filled v-model="csvjson" rows="20" placeholder="Enter JSON Data" />
            <q-btn class="mt-5 " @click="showOutput" color="black" label="Convert" />
            <q-btn class="mt-5 ml-5" @click="downloadCSV" color="black" label="DownloadCSV" />
        </q-card-section>

        <div class="q-pa-md" style="max-width: 100%">
            <q-input v-model="csvData" filled rows="20" placeholder="Encoded String" type="textarea" />
        </div>
    </q-card>
</q-page>
</template>

<script>
import { saveAs } from 'file-saver';
export default {
    data() {
        return {
            csvjson: [],
            csvData: []
        }
    },
    methods: {
        downloadCSV() {
            if (this.csvData.length != 0) {
                let fileToSave = new Blob([this.csvData], {
                   type: "text/csv;charset=utf-8",
                   name:'data.csv'
                });
                saveAs(fileToSave, 'data.csv');
                
            } else {
                this.$q.notify({
                    type: 'negative',
                    message: 'To download csv file first convert it.',
                    icon: 'warning'
                })
            }

        },
        showOutput() {
            let arr = []
            if (this.csvjson.startsWith("{")) {
                var arrObject = "[" + this.csvjson + "]"
                console.log("data", arrObject)
                arr = JSON.parse(arrObject)
                
                var keys = [];
                var values = [];

                function getKeys(data, k = '') {
                    for (var i in data) {
                        var rest = k.length ? '_' + i : i
                        if (typeof data[i] == 'object') {
                            if (!Array.isArray(data[i])) {
                                getKeys(data[i], k + rest)
                            }
                        } else keys.push(k + rest)
                    }
                }

                function getValues(data, k = '') {
                    for (var i in data) {
                        var rest = k.length ? '' + i : i
                        if (typeof data[i] == 'object') {
                            if (!Array.isArray(data[i])) {
                                getValues(data[i], k + rest)
                            }
                        } else values.push(data[rest])
                    }
                }
                getKeys(arr[0])
                var value = "";
                arr.forEach(x => {
                    values = [];
                    getValues(x);
                    value += values.join(";") + "\r\n";
                })

                this.csvData = keys.join(";") + "\r\n" + value;
            }

            // Else condition
            // var arrObject = eval(this.csvjson);
            else {
                arr = JSON.parse(this.csvjson)

                var keys = [];
                var values = [];

                function getKeys(data, k = '') {
                    for (var i in data) {
                        var rest = k.length ? '_' + i : i
                        if (typeof data[i] == 'object') {
                            if (!Array.isArray(data[i])) {
                                getKeys(data[i], k + rest)
                            }
                        } else keys.push(k + rest)
                    }
                }

                function getValues(data, k = '') {
                    for (var i in data) {
                        var rest = k.length ? '' + i : i
                        if (typeof data[i] == 'object') {
                            if (!Array.isArray(data[i])) {
                                getValues(data[i], k + rest)
                            }
                        } else values.push(data[rest])
                    }
                }

                getKeys(arr[0])
                var value = "";
                arr.forEach(x => {
                    values = [];
                    getValues(x);
                    value += values.join(";") + "\r\n";
                })

                this.csvData = keys.join(";") + "\r\n" + value;
            }

        }
    }

}
</script>
