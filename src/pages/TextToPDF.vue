<template>
  <q-page>
    <div class="full-width flex row wrap justify-around items-start content-end">
      <div class="text-center q-my-md">
        <span class="rounded bg-grey-4 px-20 q-py-xs font-normal">Text To PDF</span>
      </div>
    </div>
    <div>
      <q-card-section class="q-py-none">
        <div class=""><b>File Name :</b></div>
      </q-card-section>
      <q-card-section>
        <q-input class=" pl-3 bg-white" v-model="yourname" placeholder="Enter name for your PDF"/>
      </q-card-section>
      <div class="ml-4"><b>Output : </b>
        <q-btn
          size="sm"
          color="white"
          class="px-3 q-pa-none float-right mr-4 text-black rounded-sm"
          no-caps dense
          @click="clear()">Clear
        </q-btn>
      </div>
      <div class="q-pa-md" style="max-width: 100%">
        <q-input v-model="fileContent" class="bg-white pl-5" placeholder="Enter PDF Data" ref="textarea"
                 rows="20"
                 type="textarea"/>
      </div>
      <q-btn class="mt-3 mr-4 float-right" @click="downloadPDF" color="black" label="Download PDF"/>
    </div>
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
    clear() {
      this.fileContent = ''
    },
    downloadPDF() {
      var doc = new jsPDF('p', 'in', 'a4')
      var pageheight = 10
      console.log("$$$$", pageheight)
      doc.setLineWidth(1 / 72)
      let textlines = doc.setFont('Arial')
        .setFontSize(12)
        .splitTextToSize(this.fileContent, 7.25)

      let verticalOffset = 0.5;
      doc.text(0.5, verticalOffset + 12 / 72, textlines)

      verticalOffset += (textlines.length + 0.5) * 12 / 72
      doc.save(this.yourname + '.pdf')

    }
  }
}
</script>
