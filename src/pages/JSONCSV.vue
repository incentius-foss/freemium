<template>
<q-page>
        
        <div class="full-width flex row wrap justify-around items-start content-end" >
			<div class="text-center q-my-md">
             <span class="rounded bg-grey-4 px-20 q-py-xs font-normal" >JSON to CSV</span>
            </div>
			<div class="full-width flex justify-between row wrap justify-around items-start content-end">
				<div class="col-5" style="overflow:auto">
                <!-- <q-card bordered class="my-card" > -->
                    <q-card-section class="q-pa-none q-ma-none">
                        <div class="ml-2 row">
                            <div class="col-2 text-left">
                                <b>Input :</b></div>
                            <div class="col-10 text-right">
                                <q-btn
                                    size="sm"
                                    color="white"
                                    class="px-3 q-pa-none text-black mr-2 rounded-md"
                                    no-caps
                                    dense
                                    @click="sample()"
                                    >Sample</q-btn
                                >
                                <q-btn
                                    size="sm"
                                    color="white"
                                    class="px-3 q-pa-none mr-2 text-black rounded-md"
                                    no-caps
                                    dense
                                    @click="clear()"
                                    >Clear</q-btn
                                >
                                <q-btn
                                    size="sm"
                                    color="white"
                                    class="px-3 q-pa-none text-black mr-2 rounded-md"
                                    no-caps
                                    dense
                                   @click="showOutput()"
                                    >Convert</q-btn
                                >
                                <q-btn
                                    size="sm"
                                    color="white"
                                    class="px-3 q-pa-none text-black mr-2 rounded-md"
                                    no-caps
                                    dense
                                   @click="downloadCSV()"
                                    >Download CSV</q-btn
                                >
                                </div>
                                
                                <!-- <div class="text-subtitle2"></div> -->
                            </div>
                    </q-card-section>

                    <q-card-actions vertical align="center">
                        <q-input  class="full-width form-control bg-white pl-5" v-model="csvjson" placeholder="Enter JSON Data"  ref="textarea"
                        rows="27"
                        type="textarea" />
                    </q-card-actions>
                <!-- </q-card> -->
            </div>
            <q-separator class="q-pa-none q-ma-none"  vertical></q-separator>
            <div class="col-6" style="overflow:auto ">
                <!-- <q-card bordered class="my-card" > -->
                    <q-card-section class="q-pa-none q-ma-none">
                        <div class="ml-2 row">
                            <div class="col-8"><b>Output :</b></div>
                            <div class="col-4 text-right">
                                <q-btn
                                    size="sm"
                                    color="white"
                                    class="px-3 q-pa-none text-black mr-2 rounded-md"
                                    no-caps
                                    dense
                                   @click="copyToClipboards()"
                                    >Clipboard</q-btn
                                >
                            </div>
                        </div>
                    </q-card-section>

                    <q-card-actions vertical align="center" >
                        <q-input class="full-width bg-white pl-5"  v-model="csvData"  placeholder="Encoded String" ref="textarea"
                        rows="27"
                        type="textarea" />
                    </q-card-actions>
                <!-- </q-card> -->
            </div>

			</div>
            
        </div>
        
		<!-- <q-btn color="black" class="float-right mt-5 mr-8" label="Convert" @click="showOutput()" />
        <q-btn color="black" class="float-right mt-5 mr-5" label="Download CSV" @click="downloadCSV()" /> -->
   </q-page>

</template>

<script>
import { copyToClipboard } from 'quasar'
import { saveAs } from 'file-saver';
export default {
    data() {
        return {
            csvjson: [],
            csvData: []
        }
    },
    methods: {
        copyToClipboards(){
            copyToClipboard(this.csvData)
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
        clear(){
            this.csvjson=''
        },
        sample(){this.csvjson='{"sample_data": "sample_data", "data": "data", "name": "json"}'
        },
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
