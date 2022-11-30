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
      <q-drawer
        v-model="leftDrawerOpen"
        show-if-above
        bordered
        class="flex flex-col bg-brown-1"
      >
        <q-list >
          <div class="overflow-hidden ">
            <div class="">
              <img class="q-mx-auto " src="../assets/Logo.png" style="width:50%"></div>
            <q-separator></q-separator>
            <input class="q-ma-sm rounded-md shadow border-gray-300 bg-gray-100 h-10 px-2 pr-12 rounded-lg text-sm focus:outline-none "
              type="search" name="search" placeholder="Search">
            <button type="submit" class="absolute right-0 top-20 mt-4 mr-8">
              <svg class="text-gray-800 h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg"
                xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Capa_1" x="0px" y="0px"
                viewBox="0 0 56.966 56.966" style="enable-background:new 0 0 56.966 56.966;" xml:space="preserve"
                width="512px" height="512px">
                <path
                  d="M55.146,51.887L41.588,37.786c3.486-4.144,5.396-9.358,5.396-14.786c0-12.682-10.318-23-23-23s-23,10.318-23,23  s10.318,23,23,23c4.761,0,9.298-1.436,13.177-4.162l13.661,14.208c0.571,0.593,1.339,0.92,2.162,0.92  c0.779,0,1.518-0.297,2.079-0.837C56.255,54.982,56.293,53.08,55.146,51.887z M23.984,6c9.374,0,17,7.626,17,17s-7.626,17-17,17  s-17-7.626-17-17S14.61,6,23.984,6z" />
              </svg>
            </button>
            <EssentialLink
              v-for="link in essentialLinks"
              :key="link.title"
              v-bind="link"
              :class="[link ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900', 'group flex items-center px-2 py-2 text-base font-medium rounded-md']"
            />
            <div class="absolute-bottom">
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
            </div>
          </div>
        </q-list>
      </q-drawer>
      <q-page-container class="backgroundcolor" >
        <router-view/>
      </q-page-container>
    
  </q-layout>
</template>

<script>
import EssentialLink from 'components/EssentialLink.vue'

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
    EssentialLink
  },

  setup() {
    const leftDrawerOpen = ref(false)

    return {
      essentialLinks: linksList
    }
  }
})
</script>

<style scoped>
  .backgroundcolor{
		background-color: #f6f0eb;
    
  }

</style>