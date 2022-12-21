<template>
  <q-page>
    <div class="full-width flex row wrap justify-around items-start content-end">
      <div class="text-center q-my-md">
        <span class="rounded bg-grey-4 px-20 q-py-xs font-normal">Excel To JSON</span>
      </div>
    </div>
    <div>

      <q-card-section class="q-pb-none">
        <div class="ml-1"><b>Upload Excel flie</b></div>
      </q-card-section>
      <q-card-section class="q-my-none">
        <q-uploader label="Upload Excel file" accept=".xls,.xlsx" type="file" flat color="teal" bordered multiple
                    style="width:100%" @added="upload"/>

      </q-card-section>
      <div class=" ml-5"><b>Output : </b>
        <q-btn
          size="sm"
          color="white"
          class="px-3 q-pa-none text-black mr-5 rounded-md float-right"
          no-caps
          dense
          @click="copyText()"
        >Clipboard
        </q-btn>
      </div>
      <div class="q-pa-md" style="max-width: 100%">
                        <textarea id="json-result" placeholder="JSON Data" ref="textarea"
                                  rows="14"

                        />
      </div>

    </div>

  </q-page>
  <!-- <q-page>
    <div class="full-width flex row wrap justify-around items-start content-end" >
              <div class="text-center q-my-md">
                      <span class="rounded bg-grey-4 px-20 q-py-xs font-normal" >Excel To JSON</span>
                  </div>
          </div>
          <q-card class="my-card text-dark" bordered style="background-color:#f6f0eb">
          <q-card-section>
              <div class=""><b>Excel File To JSON Data</b></div>
          </q-card-section>
          <q-card-section>
              <q-uploader accept=".xls,.xlsx" label="Upload Excel file" type="file" flat color="teal" bordered multiple  style="width:100%" @added="upload"/>
          </q-card-section>
          <div class=" ml-4"><b>Output : </b></div>
          <div class="q-pa-md" style="max-width: 100%">
              <textarea id="json-result"  placeholder="JSON Data" ref="textarea"
                  rows="13"

                   />
          </div>
      </q-card>
      </q-page> -->
  <!-- <input type="file" id="file_upload" @change="upload" />
    <q-input type="textarea" v-model="formated_data" /> -->
</template>

<script>
import {copyToClipboard} from 'quasar'
// import XLS  from "xlsx";
export default {
  data() {
    return {
      attachment: [],
      jsonData: [],
      formated_data: '"territory_id": "101100","territory_name": "Res",',
      test: ''
    }
  },

  methods: {
    //     file_selected(file) {
    //     this.attachment = file[0];
    //     console.log("attachment",this.attachment)
    //     this.check_if_document_upload=true;
    //   },

    upload(file) {
      console.log("@@@", file)
      var files = file
      if (files.length == 0) {
        alert("Please choose any file...");
        return;
      }
      var filename = files[0].name;
      var extension = filename.substring(filename.lastIndexOf(".")).toUpperCase();
      if (extension == '.XLS' || extension == '.XLSX') {
        this.excelFileToJSON(files[0]);
      } else {
        alert("Please select a valid excel file.");
      }
    },
    excelFileToJSON(file) {
      var XLSX = require("xlsx");
      try {
        var reader = new FileReader();
        reader.readAsBinaryString(file);
        reader.onload = function (e) {
          var data = e.target.result;
          var workbook = XLSX.read(data, {
              type: 'binary'
            }
          );
          var result = {};
          workbook.SheetNames.forEach(function (sheetName) {
              var roa = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
              if (roa.length > 0) {
                result[sheetName] = roa;
              }
            }
          );
          //displaying the json result
          var resultEle = document.getElementById("json-result");
          resultEle.value = JSON.stringify(result, null, 4);
          this.formated_data = resultEle.value
          // this.test=JSON.parse(JSON.stringify(resultEle.value))
          console.log("test..", this.formated_data, this.test)
          resultEle.style.display = 'block';
        }
      } catch (e) {
        console.error(e);
      }
    },
    copyText() {
      var data = document.getElementById("json-result");
      data.select();
      data.setSelectionRange(0, 99999);
      navigator.clipboard.writeText(data.value);
      this.$q.notify({
        message: 'Your text copied successfully',
        type: 'warning',
        color: 'positive',
        textColor: 'black',
        icon: 'thumb_up_alt'
      });
    },

  }
}
</script>
<style>
textarea {
  width: 100%;
  padding: 12px 20px;
  box-sizing: border-box;
  font-size: 16px;
  resize: none;
}
</style>
