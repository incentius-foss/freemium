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
          <div class=" overflow-hidden">
            <div class="">
              <img class="q-mx-auto " src="../assets/Logo.png" style="width:50%"></div>
            <q-separator></q-separator>

            <EssentialLink
              v-for="link in essentialLinks"
              :key="link.title"
              v-bind="link"
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
        <!-- width:100%;height:auto;color: #f6f0eb00; -->
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