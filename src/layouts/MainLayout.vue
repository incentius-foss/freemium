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
        <div class="">
                <img class="q-mx-auto my-6" src="../assets/freemium.png" style="width: 90%;">
              </div>
                <q-separator ></q-separator>
        <div  v-if="!$q.screen.lt.sm" class="my-2">
          <q-btn icon="reorder" flat @click="collapse=!collapse;"><q-tooltip size="10px">Open the sidebar</q-tooltip></q-btn>
        </div>
      
               
        <div :key="index" v-for="(link,index) in getSearchData">
          <a @click="$route.path==link.path ? '' : $router.push(link.path)" :class="$route.path==link.path ? 'bg-blue-500 text-white rounded-xl border-gray-700' : 'text-black hover:bg-bl-700 hover:text-white'" class="cursor-pointer group flex items-center px-2 py-2 text-sm font-medium" aria-controls="dropdown-example" data-collapse-toggle="dropdown-example">
                      <q-icon  size="sm" class="ml-2 " :name="link.icon" alt=""/>
                      <q-tooltip>{{link.title}}</q-tooltip>        
                  
                    </a>
          <!-- <q-item
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

                
              </q-item> -->

            <!-- For Json formatter -->
            <!-- <q-item
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
              
              </q-item> -->

              <!-- For JSON To CSV-->
              <!-- <q-item
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
              </q-item> -->

              <!-- For SQL formatter -->
              <!-- <q-item
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
              </q-item> -->
              <!-- For Base 64 -->
              <!-- <q-item
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
              </q-item> -->
            <!-- For Json Formatter -->
              <!-- <q-item
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
              </q-item> -->


              <!-- For SQL formatter -->
              <!-- <q-item
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
              </q-item> -->

            <!-- For PDF Generator-->
              <!-- <q-item
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
              </q-item> -->

              <!-- For QR-Code Generator-->
              <!-- <q-item
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
              </q-item> -->

            <!-- For PDF Generator-->
              <!-- <q-item
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
              </q-item> -->
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
                <div class="row">
                  <div class="col-9 my-2 ml-2">
                    <q-input class="float-right q-my-sm q-mr-sm" outlined color="gray" dense debounce="300" v-model="search_data"
                        placeholder="search">
                      <template v-slot:append>
                        <q-icon color="gray-600" name="search"/>
                      </template>
                    </q-input>
                  </div>
                  <div class="col-2 mt-4 ml-2">
                    <q-btn classs="float-right" icon="reorder" flat @click="collapse=!collapse;" ><q-tooltip>Close the sidebar</q-tooltip></q-btn>
                  </div>
                </div>
                
          
              

              <div class="mt-2">
                <div  
                  v-for="link in getSearchData"
                  :key="link.title"
                  v-bind="link"
                >
                    <a @click="$route.path==link.path ? '' : $router.push(link.path)" :class="$route.path==link.path ? 'bg-blue-500 text-white rounded-xl border-gray-700' : 'text-black hover:bg-bl-700 hover:text-white'" class="cursor-pointer group flex items-center px-2 py-2 text-sm font-medium" aria-controls="dropdown-example" data-collapse-toggle="dropdown-example">
                      <q-icon size="xs" class="mr-3 h-6" :name="link.icon" alt=""/>
                        {{link.title}}        
                  
                    </a>
              </div>
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
                <!-- <q-item class="mt-12"
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
                  </q-item> -->
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
    path:'/',
    title: 'Dashboard',
    icon: 'home',
  },
  {
      path: '/jsonformatter',
      title: 'JSON Formatter',
      icon: 'data_object',

  },
  {
      path: '/jsoncsv',
      title: 'JSON TO CSV',
      icon: 'description',

  },
  {
      path: '/sqlformatter',
      title: 'SQL Formatter',
      icon:'article'
  },
  {
      path: '/base64',
      title: 'Base64 Converter',
      icon: 'code',
  },
  {
      path: '/base64Image',
      title: 'Base64 Image Converter',
      icon: 'image',

  },
  {
      path: '/urlencodedecode',
      title: 'URL Enode Decode',
      icon: 'link',
  },
  {
      path: '/exceltojson',
      title: 'Excel To JSON',
      icon: 'source',

  },
  {
      path: '/qrcode',
      title: 'QR-Code Generator',
      icon: 'qr_code_scanner',

  },

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
      essentialLinks: ref(linksList),
      search_data:ref('')
    }
  },
  methods: {
    },
  computed:{
    getSearchData() {
      return this.essentialLinks.filter(data => {
                return data.title.toLowerCase().includes(this.search_data.toLowerCase())
              })
            }

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