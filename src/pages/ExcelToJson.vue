<template>
<q-page>
        <q-card class="my-card text-dark" bordered>
        <q-card-section>
            <div class="text-h5"><b>Excel File To JSON Data</b></div>
        </q-card-section>
        <q-card-section>
            <q-uploader accept=".xls,.xlsx" label="Upload Excel file" type="file" flat color="teal" bordered multiple  style="width:100%" @added="upload"/>
        </q-card-section>
        <div class="text-h5 ml-4"><b>Output : </b></div>
        <div class="q-pa-md" style="max-width: 100%">
            <textarea id="json-result" filled placeholder="JSON Data" ref="textarea"
                rows="38"
                cols="100"
                 />
        </div>
    </q-card>
    </q-page>
    	<!-- <input type="file" id="file_upload" @change="upload" />
        <q-input type="textarea" v-model="formated_data" /> -->
</template>

<script>
// import XLS  from "xlsx";
export default {
    data(){
        return{
                attachment:[],
                jsonData:[],
                formated_data:[],
        }
    },

    methods:{
    //     file_selected(file) {
    //     this.attachment = file[0];
    //     console.log("attachment",this.attachment)
    //     this.check_if_document_upload=true;
    //   },
     upload(file) {
        console.log("@@@",file)
        var files = file
        if(files.length==0){
          alert("Please choose any file...");
          return;
        }
        var filename = files[0].name;
        var extension = filename.substring(filename.lastIndexOf(".")).toUpperCase();
        if (extension == '.XLS' || extension == '.XLSX') {
          this.excelFileToJSON(files[0]);
        }
        else{
          alert("Please select a valid excel file.");
        }
      },
        excelFileToJSON(file){
            var XLSX = require("xlsx");
            try {
          var reader = new FileReader();
          reader.readAsBinaryString(file);
          reader.onload = function(e) {
            var data = e.target.result;
            var workbook = XLSX.read(data, {
              type : 'binary'
            }
                                    );
            var result = {
            };
            workbook.SheetNames.forEach(function(sheetName) {
              var roa = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
              if (roa.length > 0) {
                result[sheetName] = roa;
              }
            }
                                       );
            //displaying the json result
             var resultEle=document.getElementById("json-result");
            resultEle.value=JSON.stringify(result, null, 4);
            resultEle.style.display='block';
          }
        }
        catch(e){
          console.error(e);
        }
        }
    }
}
</script>
<style>
textarea{
  width: 100%;
  height: 750px;
  padding: 12px 20px;
  box-sizing: border-box;
  border: 2px solid #ccc;
  border-radius: 4px;
  background-color: #f8f8f8;
  font-size: 16px;
  resize: none;
}
</style>