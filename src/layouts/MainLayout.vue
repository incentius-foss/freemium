<template>
  <q-layout view="lHh Lpr lFf">
    <div class="tw-brightness-75 fullscreen tw-absolute tw-top-0 tw-left-0 tw-z-0" style="background-image:url('/bg.jpg');background-size: cover;background-repeat: no-repeat;">
      <!-- <div class="tw-h-96 tw-w-96 tw-bg-black/30 tw-border tw-border-t-white/40 tw-border-l-white/40 tw-border-r-white/50 tw-border-b-white/50 tw-rounded-2xl tw-backdrop-blur-lg"></div> -->
    </div>
    <q-drawer v-model="leftDrawerOpen" show-if-above class="tw-p-4" >
      <Drawer class="glass-body tw-border-r tw-rounded-2xl glass-border" />
    </q-drawer>
    <q-page-container>
      <router-view class="montserrat" />
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent, ref } from 'vue'
import Drawer from 'src/components/Drawer.vue'

export default defineComponent({
  name: 'MainLayout',
  components:{
    Drawer
  },
  setup () {
    return {
      leftDrawerOpen:ref(false),
      toggleLeftDrawer () {
        leftDrawerOpen.value = !leftDrawerOpen.value
      },
    }
  }
})
</script>
<style>
.q-drawer{
  background: transparent !important;
}

</style>
