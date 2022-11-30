<template>
   <q-page>
        
        <div class="full-width flex row wrap justify-around items-start content-end" >
			<div class="text-center q-my-md">
             <span class="rounded bg-grey-4 px-20 q-py-xs font-normal" >SQL Formatter</span>
            </div>
			<div class="full-width flex justify-between row wrap justify-around items-start content-end">
				<div class="col-5" style="overflow:auto">
                <!-- <q-card bordered class="my-card" > -->
                    <q-card-section class="q-pa-none q-ma-none">
                        <div class=" text-center"><b>Input</b></div>
                        <div class="text-subtitle2"></div>
                    </q-card-section>

                    <q-card-actions vertical align="center">
                        <q-input class="full-width form-control bg-white pl-5" v-model="sql_data" placeholder="Enter JSON Data"  ref="textarea"
                        rows="27"
                        type="textarea" />
                    </q-card-actions>
                <!-- </q-card> -->
            </div>
            <q-separator class="q-pa-none q-ma-none"  vertical></q-separator>
            <div class="col-6" style="overflow:auto ">
                <!-- <q-card bordered class="my-card" > -->
                    <q-card-section class="q-pa-none q-ma-none">
                        <div class=" text-center"><b>Output</b></div>
                        <div class="text-subtitle2"></div>
                    </q-card-section>

                    <q-card-actions vertical align="center" >
                        <q-input class="full-width bg-white pl-5"  v-model="formated_data"  placeholder="Encoded String" ref="textarea"
                        rows="27"
                        type="textarea" />
                    </q-card-actions>
                <!-- </q-card> -->
            </div>

			</div>
            
                <!-- <q-btn color="black" class="justify-center mt-5" label="Format" @click="jsonFormatter()" /> -->
        </div>
		<q-btn color="black" class="float-right mt-5 mr-5" label="Convert" @click="sql_formatter()" />
   </q-page>

</template>

<script>
import {format} from "sql-formatter";
export default {
    data(){
        return{
            sql_data : "",
            formated_data : ""
        }
    },
    methods:{
        sql_formatter(){
            this.formated_data = format(this.sql_data)
            console.log(this.formated_data);
        }
    }
}
</script>