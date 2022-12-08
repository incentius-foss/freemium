<template>
  <q-layout view="lHh lpr lFf">
    <!--    <q-header elevated>-->
    <!--      <q-toolbar>-->
    <!--        <q-toolbar-title>-->
    <!--          Quasar App-->
    <!--        </q-toolbar-title>-->

    <!--        <div>Quasar v{{ $q.version }}</div>-->
    <!--      </q-toolbar>-->
    <!--    </q-header>-->
    <q-drawer v-if="collapse"
    :width='60'
        v-model="leftDrawerOpen"
        show-if-above
        bordered
        class="flex flex-col bg-brown-1"
      >
      <div>
        <div  v-if="!$q.screen.lt.sm" class="my-2">
          <q-btn icon="reorder" flat @click="collapse=!collapse;"><q-tooltip size="10px">Open the sidebar</q-tooltip></q-btn>
        </div>
        <div :key="index" v-for="(test,index) in essentialLinks">
          <q-item
                clickable
                tag="a"
                target="_blank"
                @click="$router.push('/')"
              >
                <q-item-section
                  v-if="test.icon"
                  avatar
                >
                  <q-icon  name="home"/>
                </q-item-section>

                
              </q-item>

            <!-- For Json formatter -->
            <q-item
                clickable
                tag="a"
                target="_blank"
                @click="$router.push('/jsonformatter')"
              >
                <q-item-section
                  v-if="test.icon"
                  avatar
                >
                  <q-icon name="data_object"/>
                </q-item-section>
              
              </q-item>

              <!-- For JSON To CSV-->
              <q-item
                clickable
                tag="a"
                target="_blank"
                @click="$router.push('/jsoncsv')"
              >
                <q-item-section
                  v-if="test.icon"
                  avatar
                >
                  <q-icon name="description"/>
                </q-item-section>
              </q-item>

              <!-- For SQL formatter -->
              <q-item
                clickable
                tag="a"
                target="_blank"
                @click="$router.push('/sqlformatter')"
              >
                <q-item-section
                  v-if="test.icon"
                  avatar
                >
                  <q-icon name="article"/>
                </q-item-section>
              </q-item>
              <!-- For Base 64 -->
              <q-item
                clickable
                tag="a"
                target="_blank"
                @click="$router.push('/base64')"
              >
                <q-item-section
                  v-if="test.icon"
                  avatar
                >
                  <q-icon  name="code"/>
                </q-item-section>
              </q-item>
            <!-- For Json Formatter -->
              <q-item
                clickable
                tag="a"
                target="_blank"
                @click="$router.push('/base64Image')"
              >
                <q-item-section
                  v-if="test.icon"
                  avatar
                >
                  <q-icon  name="image"/>
                </q-item-section>
              </q-item>


              <!-- For SQL formatter -->
              <q-item
                clickable
                tag="a"
                target="_blank"
                @click="$router.push('/urlencodedecode')"
              >
                <q-item-section
                  v-if="test.icon"
                  avatar
                >
                  <q-icon  name="link"/>
                </q-item-section>
              </q-item>

            <!-- For PDF Generator-->
              <q-item
                clickable
                tag="a"
                target="_blank"
                @click="$router.push('/exceltojson')"
              >
                <q-item-section
                  v-if="test.icon"
                  avatar
                >
                  <q-icon name="source"/>
                </q-item-section>
              </q-item>

              <!-- For QR-Code Generator-->
              <q-item
                clickable
                tag="a"
                target="_blank"
                @click="$router.push('/qrcode')"
              >
                <q-item-section
                  v-if="test.icon"
                  avatar
                >
                  <q-icon name="qr_code_scanner"/>
                </q-item-section>
              </q-item>

            <!-- For PDF Generator-->
              <q-item
                clickable
                tag="a"
                target="_blank"
                @click="$router.push('/texttopdf')"
              >
                <q-item-section
                  v-if="test.icon"
                  avatar
                >
                  <q-icon name="picture_as_pdf"/>
                </q-item-section>
              </q-item>
        </div>
                  <!-- <div  v-if="!$q.screen.lt.sm" class="mt-10">
                    <q-btn icon="reorder" flat @click="collapse=!collapse;"><q-tooltip size="10px">Open the sidebar</q-tooltip></q-btn>
                  </div> -->
      </div>
    </q-drawer>
      <q-drawer v-else
        v-model="leftDrawerOpen"
        show-if-above
        bordered
        class="flex flex-col bg-brown-1"
      >
        <q-list >
          <div class="overflow-hidden mx-3">
              <div class="row">
                <img class="q-mx-auto my-2" src="../assets/freemium.png" style="width: 70%;">
              </div>
                <q-separator ></q-separator>
                <!-- <div class="row">
                  <div class="col-9 my-2 ml-2">
                    <q-input   class="rounded-md" style="bg-black" v-model="search"   dense outlined
                    :after="[{icon: 'search', handler () {}}]"
                    :placeholder="$t('search')">
                      <template v-slot:append>
                        <q-icon name="search"></q-icon>
                      </template>
                    </q-input>
                  </div>
                  <div class="col-2 mt-2 ml-2">
                    <q-btn classs="float-right" icon="reorder" flat @click="collapse=!collapse;" ><q-tooltip>Close the sidebar</q-tooltip></q-btn>
                  </div>
                </div> -->

          
              

              <div class="mt-2">
                <EssentialLink  
                  v-for="link in essentialLinks"
                  :key="link.title"
                  v-bind="link"
                />
              </div>
                <!-- <div class="absolute-bottom" v-if="!collapse">
                  <q-separator></q-separator>
                  <q-item>
                    <q-item-section avatar>
                      <q-avatar>
                        <img src="https://cdn.quasar.dev/img/avatar6.jpg">
                      </q-avatar>
                    </q-item-section>

                    <q-item-section>
                      <q-item-label>Winfield Stapforth</q-item-label>
                    </q-item-section>

                    <q-item-section side>
                      <q-btn icon="logout" flat dense color="grey"/>
                    </q-item-section>
                  </q-item>
                </div> -->
                <q-item class="mt-12"
                    clickable
                    @click="collapse=!collapse;"
                  >
                    <q-item-section
                     
                      avatar
                    >
                      <q-icon name="reorder"/>
                    </q-item-section>
                  <q-item-section>
                      <q-item-label class="">Close sidebar</q-item-label>
                    </q-item-section>
                  </q-item>
                <!-- <div class="mt-4">
                    <q-btn class="text-capitalize" icon="reorder" flat @click="collapse=!collapse;" ><q-tooltip>Close the sidebar</q-tooltip>Close sidebar</q-btn>
                  </div> -->
          </div>
          
        </q-list>
         
        <!-- <div  v-if="!$q.screen.lt.sm" class="mt-2 flex items-center justify-center">
          <q-btn icon="reorder" flat @click="collapse=!collapse;" ><q-tooltip>Close the sidebar</q-tooltip></q-btn>
          </div> -->
   
      </q-drawer>
      <q-page-container class="backgroundcolor" >
        <router-view/>
      </q-page-container>
    
  </q-layout>
</template>

<script>
import EssentialLink from 'components/EssentialLink.vue'
// import Sidebarcollapse from 'components/Sidebarcollapse.vue'

const linksList = [
  {
    title: 'Dashboard',
    icon: 'home',
  }
];

import {defineComponent, ref} from 'vue'

export default defineComponent({
  name: 'MainLayout',

  components: {
    EssentialLink,
    
  },

  setup() {
    const leftDrawerOpen = ref(false)

    return {
      collapse: ref(false),
      essentialLinks: linksList,
      search:ref('')
    }
  },
  methods: {
    }
})
</script>

<style scoped>
  .backgroundcolor{
		background-color: #f6f0eb;
    
  }
.q-item{
  padding:0px,0px;
}
.q-field--outlined .q-field__control {
    border-radius: 10px;
}
</style>