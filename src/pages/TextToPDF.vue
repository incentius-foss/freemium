<template>
    <q-page>
        <div class="full-width flex row wrap justify-around items-start content-end" >
            <div class="flex flex-center">
                <span class="rounded bg-grey-4 q-mt-sm py-1 px-20 font-normal" >Text To PDF</span>
            </div>
            <div class="full-width flex justify-between row wrap justify-around items-start content-end">
                <div class="col-5" style="overflow:auto">
                <!-- <q-card bordered class="my-card" > -->
                    <q-card-section class="q-pa-none q-ma-none">
                        <div class=" text-center"><b>Input</b></div>
                        <div class="text-subtitle2"></div>
                    </q-card-section>

                    <q-card-actions vertical align="center">
                        <q-input class="full-width rounded shadow-2 form-control bg-white pl-6"  ref="textarea" rows="27" type="textarea" v-model="yourname" placeholder="Enter name for your PDF" />
                        <!-- <q-input class="full-width form-control bg-white" v-model="sql_data" placeholder="  Enter JSON Data"  ref="textarea"
                        rows="27"
                        type="textarea" /> -->
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

                    <q-card-actions vertical align="right" >
                        <q-input class="full-width rounded shadow-2 form-control bg-white pl-6" ref="textarea" rows="27" type="textarea" v-model="fileContent" placeholder="Enter PDF Data" style="white-space: normal;" />
                        <q-btn class=" mt-5 ml-5" @click="downloadPDF" color="black" label="Download PDF" />

                        <!-- <q-input class="full-width bg-white "  v-model="formated_data"  placeholder="  Encoded String" ref="textarea"
                        rows="27"
                        type="textarea" /> -->
                    </q-card-actions>
                <!-- </q-card> -->
            </div>

            </div>
                
                    <!-- <q-btn color="black" class="justify-center mt-5" label="Format" @click="jsonFormatter()" /> -->
            </div>
        <!-- <q-card class="q-pa-md my-card text-dark" style="background-color:#f6f0eb">
            <q-card-section>
                <div class="text-h5 mt-5"><b>Text To PDF</b></div>
            </q-card-section>
            <q-card-section>
                <q-input class="mb-5" filled v-model="yourname" placeholder="Enter name for your PDF" />
                <q-input type="textarea" rows="22" filled v-model="fileContent" placeholder="Enter PDF Data" style="white-space: normal;" />
                <q-btn class="mt-5 ml-5" @click="downloadPDF" color="black" label="Download PDF" />
            </q-card-section>

        </q-card> -->
    </q-page>
</template>

<script>
export default {
    data() {
        return {
            fileContent: '',
            yourname: ''
        }
    },
    methods: {
        downloadPDF() {
            // margin lines: A4 = inch W: 8.25 / H:11.75; 11.75 -0.5; = 11.25
            var doc = new jsPDF('p', 'in', 'a4')
            var pageheight = 10
            console.log("$$$$",pageheight)
            // let margin = 0.5;
            // doc.setDrawColor(0, 255, 0)
            // .setLineWidth(1/72)
            // .line(margin, margin, margin, 11.25)
            // .line(7.75, margin,7.75,11.25)
            doc.setLineWidth(1 / 72)
            // doc.line(0.5,0.5,0.5,11.25)
            // doc.line(7.75,0.5,7.75,11.25)
            // var pageheight=doc.pageSize
            // console.log("$$$$",pageheight)
            // break the long text
            let textlines = doc.setFont('Arial')
                .setFontSize(12)
                .splitTextToSize(this.fileContent, 7.25)          
            
            let verticalOffset = 0.5;
            doc.text(0.5, verticalOffset + 12 / 72, textlines)
           
            verticalOffset += (textlines.length + 0.5)*12 / 72 
            // if (verticalOffset>=pageheight)
            //     {
            //     doc.addPage();
            //     }
            console.log(verticalOffset)

            doc.save(this.yourname + '.pdf')

            // @TODO: Need to simplify this demo

           
        }
    }
}
</script>
