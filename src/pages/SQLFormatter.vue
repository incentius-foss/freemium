<template>
    <q-page>
        <q-card class="my-card text-dark" style="background-color:#f6f0eb" bordered>
        <q-card-section>
            <div class="text-h5 bold"><b>SQL Formatter</b></div>
        </q-card-section>
        <q-card-section>
            <q-input type="textarea" filled v-model="sql_data" placeholder="Enter JSON Data" />
            <q-btn class="mt-5" @click="sql_formatter" color="black" label="Format" />
        </q-card-section>

        <div class="q-pa-md" style="max-width: 100%;">
            <q-input v-model="formated_data" filled placeholder="Encoded String" rows="30" type="textarea" />
        </div>
    </q-card>
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