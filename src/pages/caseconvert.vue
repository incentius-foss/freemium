<template>
  <q-layout view="hHh Lpr lFf" v-cloak>
    <q-page-container>
      <q-page class="q-pa-md">
        <div class="full-width flex row wrap justify-around items-start content-end" >
            <div class="text-center ">
                    <span class="rounded bg-grey-4 px-20 q-py-xs font-normal" >Convert text style</span>
                </div>
        </div>
        <div class=" q-mt-sm" >
          <q-card-section>
            <div class="q-gutter-sm">
              <q-btn
                color="white"
                class="text-black rounded-md"
                no-caps
                dense
                padding="7px"
                @click="wideChar"
                >Wide Text Generator</q-btn
              >
              <q-btn
                color="white"
                class="text-black rounded-md"
                no-caps
                dense
                padding="7px"
                @click="strikeText"
                >Strike Through Text Generator</q-btn
              >
              <q-btn
                color="white"
                class="text-black rounded-md"
                no-caps
                dense
                padding="7px"
                @click="reverseText"
                >Reverse Text Generator</q-btn
              >
              <q-btn
                color="white"
                class="text-black rounded-md"
                no-caps
                dense
                padding="7px"
                @click=" binaryText"
                >Binary Text Generator</q-btn
              >
            </div>
          </q-card-section>
          <q-card-section style="margin-top: -20px">
            <textarea
            rows="8"
              class="textarea pl-4 pt-4"
              v-model="text"
              id="text"
              placeholder="Enter Your text here!!"
            ></textarea>
          </q-card-section>
          <q-card-section style="margin-top: -20px">
            <div class="q-gutter-sm">
              <q-btn
                size="sm"
                color="white"
                class="text-black rounded-md"
                no-caps
                dense
                padding="7px"
                @click="capitalizeLetter"
                >Sentence case</q-btn
              >
              <q-btn
                size="sm"
                color="white"
                class="text-black rounded-md"
                no-caps
                dense
                padding="7px"
                @click="convertToLowercase"
                >lower case</q-btn
              >
              <q-btn
                size="sm"
                color="white"
                class="text-black rounded-md"
                no-caps
                dense
                padding="7px"
                @click="convertToUppercase"
              >
                UPPER CASE</q-btn
              >
              <q-btn
                size="sm"
                color="white"
                class="text-black rounded-md"
                no-caps
                dense
                padding="7px"
                @click="capitalizeLetter"
                >Capitelized case</q-btn
              >
              <q-btn
                size="sm"
                color="white"
                class="text-black rounded-md"
                no-caps
                dense
                padding="7px"
                @click="alternateCase"
                >aLtErNaTiNg cAsE</q-btn
              >
              <q-btn
                size="sm"
                color="white"
                class="text-black rounded-md"
                no-caps
                dense
                padding="7px"
                @click="titleCase"
                >Title Case</q-btn
              >
              <q-btn
                size="sm"
                color="white"
                class="text-black rounded-md"
                no-caps
                dense
                padding="7px"
                @click="InverseCase"
                >InVeRsE CaSe</q-btn
              >

              <q-btn
                size="sm"
                color="white"
                class="text-black rounded-md"
                no-caps
                dense
                padding="7px"
                @click="Clear"
                >Clear</q-btn
              >
            </div>
            <div class="row">
              <p style="margin-top: 1em">Character Count:{{ counter }}</p>
              <p style="margin-top: 1em">&nbsp; | Word Count:{{ word }}</p>
              <p style="margin-top: 1em">&nbsp; | Line Count:{{ line }}</p>
            </div>
          </q-card-section>
          <q-card-section class="q-pt-none">
            <h6 class="text-h6">Result:</h6>
            <textarea
            class="pl-4 pt-4"
            rows="7"
              id="result"
              placeholder="Result here!!"
            ></textarea>
            <div class="q-gutter-sm" style="margin-top:5px">
              <q-btn
                color="white"
                class="text-black"
                no-caps
                dense
                padding="7px"
                @click="copyText"
                >Copy to clipboard</q-btn
              >
              <q-btn
                color="white"
                class="text-black"
                no-caps
                dense
                padding="7px"
                @click="Clear2"
                >Clear</q-btn
              >
            </div>
          </q-card-section>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent } from "vue";
import { useQuasar } from "quasar";
export default defineComponent({
  name: "caseconvert",
  data() {
    const $q = useQuasar();
    return {
      counter: 0,
      word: 0,
      line: 0,
      text: "",
    };
  },
  watch: {
    text() {
      this.updateCounter();
    },
  },

  methods: {
    updateCounter() {
      var data = document.getElementById("text").value;
      this.counter = data.length;
      var numWord = 0;
      for (var i = 0; i < data.length; i++) {
        var char = data[i];
        if (char == " ") {
          numWord += 1;
        }
      }
      this.word = numWord;
      this.line = data.split("\n").length;
    },

    
    convertToLowercase() {
      var data = document.getElementById("text").value;
      var lowerCase = data.toLowerCase();
      document.getElementById("result").value = lowerCase;
    },
    convertToUppercase() {
      var data = document.getElementById("text").value;
      var upperCase = data.toUpperCase();
      document.getElementById("result").value = upperCase;
    },
    alternateCase() {
      var data = document.getElementById("text").value;
      var a = data.toLowerCase();
      let s1 = "";
      for (var i = 0; i < a.length; i++) {
        if (i % 2 == 0) {
          s1 = s1 + a[i].toLowerCase();
        } else {
          s1 = s1 + a[i].toUpperCase();
        }
      }
      document.getElementById("result").value = s1;
    },
    InverseCase() {
      var data = document.getElementById("text").value;
      var a = data.toLowerCase();
      let s1 = "";
      for (var i = 0; i < a.length; i++) {
        if (i % 2 == 0) {
          s1 = s1 + a[i].toUpperCase();
        } else {
          s1 = s1 + a[i].toLowerCase();
        }
      }
      document.getElementById("result").value = s1;
    },

    Clear() {
      document.getElementById("text").value = "";
    },

    Clear2() {
      document.getElementById("result").value = "";
    },
    capitalizeLetter() {
      var input = document.getElementById("text").value;
      var input1 = input.toLowerCase();
      var capitalize =
        input1.toLowerCase().charAt(0).toUpperCase() + input1.slice(1);
      document.getElementById("result").value = capitalize;
    },
    titleCase() {
      var input = document.getElementById("text").value;
      var input1 = input.toLowerCase();
      var title_case = input1
        .split(" ")
        .map(function (word) {
          return word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join(" ");
      document.getElementById("result").value = title_case;
    },

    copyText() {
      var data = document.getElementById("result");
      data.select();
      data.setSelectionRange(0, 99999);
      navigator.clipboard.writeText(data.value);
    },
    wideChar() {
      var data = document.getElementById("text").value;
      var wide_char = data.match(/.{1}/g);
      document.getElementById("result").value = wide_char;
    },

    reverseText() {
      var data = document.getElementById("text").value;
      document.getElementById("result").value = data
        .split("")
        .reverse()
        .join("");
    },

    strikeText() {
      var data = document.getElementById("text").value;
      var strike = data.split("").map((char) => char + "\u0335").join("");
      document.getElementById('result').value = strike;
    },

    binaryText() {
      var data = document.getElementById("text").value;
      var output = "";
      for (var i = 0; i < data.length; i++) {
        output += data[i].charCodeAt(0).toString(2) + " ";
      }
      document.getElementById('result').value = output;
    },

    boldText(){
      var data = document.getElementById("text").value;
      var bold = data
      document.getElementById('result').value = bold;

    },
    italicText(){
      var data = document.getElementById("text").value;
      var data1 = data.italics();
      document.getElementById('result').value = data1;
    }
  },
});
</script>

<style scoped>
.textarea {
  width: 950px;

}

textarea {
  width: 950px;

}
.q-btn{font-size: 12px !important; padding: 5px !important;
}
</style>
