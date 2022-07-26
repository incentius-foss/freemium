<template>
   <q-page>
	<div class="full-width row wrap justify-around items-start content-end">
	<div class="col-6 float-left" style="overflow:auto">
		<q-card bordered class="my-card">
			<q-card-section class="bg-grey-8 text-white">
				<div class="text-h6"><b>JSON Data</b></div>
				<div class="text-subtitle2"></div>
			</q-card-section>

			<q-card-actions vertical align="center">
				 <q-input class="full-width form-control" v-model="json_data" filled placeholder="Enter your JSON here...." ref="textarea"
                rows="27"
                type="textarea" />
			</q-card-actions>
        </q-card>
	</div>
	<div class="col-6" style="overflow:auto">
		<q-card bordered class="my-card">
			<q-card-section class="bg-grey-8 text-white">
				<div class="text-h6"><b>Formated Data</b></div>
				<div class="text-subtitle2"></div>
			</q-card-section>

			<q-card-actions vertical align="center">
				<q-input class="full-width" v-model="formated_data" filled placeholder="YOUR JSON will appear here...." ref="textarea"
                rows="27"
                type="textarea" />
			</q-card-actions>
        </q-card>
	</div>
	<q-btn color="black" class="justify-center mt-5" label="Format" @click="jsonFormatter()" />
   </div>

   

<span>{{loremIpsum}}</span>
   </q-page>
</template>

<script>
export default {
    name:'JsonFormatter',
    data(){
        return{
            json_data:[],
            formated_data:[],
			loremIpsum : ""
        }
    },
    
    methods:{
        jsonFormatter(){
            this.formated_data = JSON.stringify(JSON.parse(this.json_data),undefined,'\t')
            console.log("ddtffdd",this.formated_data)

        }
    }
}
</script>