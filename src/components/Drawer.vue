<template>
  <div class="tw-flex tw-flex-col tw-h-full">
    <div
      class="tw-shrink-0 tw-font-bold tw-text-2xl poppins tw-flex tw-gap-4 tw-p-4 tw-items-center tw-border-b tw-border-b-white/20">
      <div>
        <svg xmlns="http://www.w3.org/2000/svg" class="tw-h-6 tw-w-6 " viewBox="0 0 20 20">
          <path fill="currentColor"
                d="M2.02 1.515a.505.505 0 0 0-.505.505v5.05c0 .28.226.506.505.506h5.05a.505.505 0 0 0 .506-.505V2.02a.505.505 0 0 0-.505-.506H2.02Zm5.05 9.394a2.02 2.02 0 0 1 2.02 2.02v5.05A2.02 2.02 0 0 1 7.07 20H2.02A2.02 2.02 0 0 1 0 17.98v-5.05a2.02 2.02 0 0 1 2.02-2.02h5.05Zm10.91 0A2.02 2.02 0 0 1 20 12.93v5.05A2.02 2.02 0 0 1 17.98 20h-5.05a2.02 2.02 0 0 1-2.02-2.02v-5.05a2.02 2.02 0 0 1 2.02-2.02h5.05ZM7.07 12.424H2.02a.505.505 0 0 0-.505.505v5.05c0 .28.226.506.505.506h5.05a.505.505 0 0 0 .506-.505v-5.05a.505.505 0 0 0-.505-.506Zm10.91 0h-5.05a.505.505 0 0 0-.506.505v5.05c0 .28.226.506.505.506h5.05a.505.505 0 0 0 .506-.505v-5.05a.505.505 0 0 0-.505-.506ZM7.07 0a2.02 2.02 0 0 1 2.02 2.02v5.05a2.02 2.02 0 0 1-2.02 2.02H2.02A2.02 2.02 0 0 1 0 7.07V2.02A2.02 2.02 0 0 1 2.02 0h5.05Zm10.91 0A2.02 2.02 0 0 1 20 2.02v5.05a2.02 2.02 0 0 1-2.02 2.02h-5.05a2.02 2.02 0 0 1-2.02-2.02V2.02A2.02 2.02 0 0 1 12.93 0h5.05Zm0 1.515h-5.05a.505.505 0 0 0-.506.505v5.05c0 .28.226.506.505.506h5.05a.505.505 0 0 0 .506-.505V2.02a.505.505 0 0 0-.505-.506Z"/>
        </svg>
      </div>
      <div>Freemium</div>
    </div>
    <div class="tw-grow tw-flex tw-flex-col">
      <!--      <div class="tw-shrink-0 tw-p-4">-->
      <!--        <q-input placeholder="Search" v-model="search" borderless class="" dense>-->
      <!--          <template v-slot:append>-->
      <!--            <q-icon name="search"></q-icon>-->
      <!--          </template>-->
      <!--        </q-input>-->
      <!--      </div>-->
      <div class="tw-grow">
        <q-scroll-area style="height: 100%;" class="tw-shadow-inner">
          <q-list>
            <template :key="category.label" v-for="category in tools_by_category">
              <q-item-label header dense>
                {{ category.label }}
              </q-item-label>
              <q-item dense @click="$router.push(tool.path)" :key="tool.title" v-for="tool,index in category.tools"
                      clickable v-ripple active-class="tw-font-bold tw-text-white tw-bg-white/20"
                      class="tw-text-gray-400 tw-mx-4 tw-my-3 tw-p-2.5 tw-rounded-xl"
                      :class="index==0?'tw-mb-3':index==category.tools.length-1?'tw-mt-3':'tw-my-3'"
                      :active="$route.path == tool.path">
                <q-item-section dense side>
                  <svg xmlns="http://www.w3.org/2000/svg" class="tw-w-5 tw-h-5" viewBox="0 0 24 24"
                       v-html="tool.icon"></svg>
                </q-item-section>
                <q-item-section dense label class="">
                  {{ tool.title }}
                </q-item-section>
              </q-item>
            </template>
          </q-list>
        </q-scroll-area>
      </div>
    </div>
    <div class="tw-shrink-0 tw-text-center tw-p-4 tw-w-full">
      <span class="tw-text-gray-400 tw-font-bold">Made with <i class="q-icon tw-text-red-500 notranslate material-icons"
                                                               aria-hidden="true" role="presentation"
                                                               style="font-size: 18px;">favorite</i> by <span
        class="tw-bg-gradient-to-r tw-from-white tw-via-white/90 tw-to-white/80 tw-inline-block tw-text-transparent tw-bg-clip-text tw-cursor-pointer ">Incentius</span></span>
    </div>
  </div>
</template>

<script>
import {defineComponent, ref} from 'vue'

export default defineComponent({
  name: 'Drawer',
  setup() {
    return {
      search: ref(''),
      tools_by_category: [
        {
          label: 'Text',
          tools: [{
            path: '/convert-text-style',
            title: 'Convert text style',
            icon: `<path fill="currentColor" d="M20 20H4c-1.1 0-2 .9-2 2s.9 2 2 2h16c1.1 0 2-.9 2-2s-.9-2-2-2zM7.11 17c.48 0 .91-.3 1.06-.75l1.01-2.83h5.65l.99 2.82c.16.46.59.76 1.07.76c.79 0 1.33-.79 1.05-1.52L13.69 4.17C13.43 3.47 12.75 3 12 3s-1.43.47-1.69 1.17L6.06 15.48c-.28.73.27 1.52 1.05 1.52zm4.83-11.4h.12l2.03 5.79H9.91l2.03-5.79z"/>`,
          },
            {
              path: '/base64-converter',
              title: 'Base64 Converter',
              icon: `<path fill="currentColor" d="M21 2H3c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2m0 18H3V6h18v14M9 8c-1.1 0-2 .9-2 2s-.9 2-2 2v2c1.1 0 2 .9 2 2s.9 2 2 2h2v-2H9v-1c0-1.1-.9-2-2-2c1.1 0 2-.9 2-2v-1h2V8m4 0c1.1 0 2 .9 2 2s.9 2 2 2v2c-1.1 0-2 .9-2 2s-.9 2-2 2h-2v-2h2v-1c0-1.1.9-2 2-2c-1.1 0-2-.9-2-2v-1h-2V8h2Z"/>`,
            },
            {
              path: '/url-encode-decode',
              title: 'URL Encode/Decode',
              icon: `<path fill="currentColor" d="M3.96 11.38C4.24 9.91 5.62 8.9 7.12 8.9h2.93c.52 0 .95-.43.95-.95S10.57 7 10.05 7H7.22c-2.61 0-4.94 1.91-5.19 4.51A4.995 4.995 0 0 0 7 17h3.05c.52 0 .95-.43.95-.95s-.43-.95-.95-.95H7a3.11 3.11 0 0 1-3.04-3.72zM9 13h6c.55 0 1-.45 1-1s-.45-1-1-1H9c-.55 0-1 .45-1 1s.45 1 1 1zm7.78-6h-2.83c-.52 0-.95.43-.95.95s.43.95.95.95h2.93c1.5 0 2.88 1.01 3.16 2.48A3.11 3.11 0 0 1 17 15.1h-3.05c-.52 0-.95.43-.95.95s.43.95.95.95H17c2.92 0 5.26-2.51 4.98-5.49c-.25-2.6-2.59-4.51-5.2-4.51z"/>`,
            },
            {
              path: '/qr-code-generator',
              title: 'QR-Code Generator',
              icon: `<path fill="currentColor" d="M2 1h8a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zm1 2v6h6V3H3z"/><path fill="currentColor" fill-rule="evenodd" d="M5 5h2v2H5z"/><path fill="currentColor" d="M14 1h8a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-8a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zm1 2v6h6V3h-6z"/><path fill="currentColor" fill-rule="evenodd" d="M17 5h2v2h-2z"/><path fill="currentColor" d="M2 13h8a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1zm1 2v6h6v-6H3z"/><path fill="currentColor" fill-rule="evenodd" d="M5 17h2v2H5z"/><path fill="currentColor" d="M23 19h-4v4h-5a1 1 0 0 1-1-1v-8v5h2v2h2v-6h-2v-2h-1h3v2h2v2h2v-4h1a1 1 0 0 1 1 1v5zm0 2v1a1 1 0 0 1-1 1h-1v-2h2z"/>`,
            }],
        },
        {
          label: 'Image',
          tools: [{
            path: '/image-to-base64',
            title: 'Image to Base64 Converter',
            icon: '<g id="fePictureSquare0" fill="none" fill-rule="evenodd" stroke="none" stroke-width="1"><g id="fePictureSquare1" fill="currentColor" fill-rule="nonzero"><path id="fePictureSquare2" d="M5 5v14h14V5H5Zm0-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm3.5 7a1.5 1.5 0 1 0 0-3a1.5 1.5 0 0 0 0 3ZM7 14l2-2l2 2l3-3l3 3v3H7v-3Z"/></g></g>',
          }],
        },
        {
          label: 'Data',
          tools: [{
            path: '/json-formatter',
            title: 'JSON Formatter',
            icon: '<path fill="currentColor" d="M5 3h2v2H5v5a2 2 0 0 1-2 2a2 2 0 0 1 2 2v5h2v2H5c-1.07-.27-2-.9-2-2v-4a2 2 0 0 0-2-2H0v-2h1a2 2 0 0 0 2-2V5a2 2 0 0 1 2-2m14 0a2 2 0 0 1 2 2v4a2 2 0 0 0 2 2h1v2h-1a2 2 0 0 0-2 2v4a2 2 0 0 1-2 2h-2v-2h2v-5a2 2 0 0 1 2-2a2 2 0 0 1-2-2V5h-2V3h2m-7 12a1 1 0 0 1 1 1a1 1 0 0 1-1 1a1 1 0 0 1-1-1a1 1 0 0 1 1-1m-4 0a1 1 0 0 1 1 1a1 1 0 0 1-1 1a1 1 0 0 1-1-1a1 1 0 0 1 1-1m8 0a1 1 0 0 1 1 1a1 1 0 0 1-1 1a1 1 0 0 1-1-1a1 1 0 0 1 1-1Z"/>',
          }, {
            path: '/json-to-csv',
            title: 'JSON TO CSV',
            icon: '<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M14 3v4a1 1 0 0 0 1 1h4"/><path d="M5 12V5a2 2 0 0 1 2-2h7l5 5v4M7 16.5a1.5 1.5 0 0 0-3 0v3a1.5 1.5 0 0 0 3 0m3 .75c0 .414.336.75.75.75H12a1 1 0 0 0 1-1v-1a1 1 0 0 0-1-1h-1a1 1 0 0 1-1-1v-1a1 1 0 0 1 1-1h1.25a.75.75 0 0 1 .75.75m3-.75l2 6l2-6"/></g>',
          }, {
            path: '/sql-formatter',
            title: 'SQL Formatter',
            icon: '<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M14 3v4a1 1 0 0 0 1 1h4"/><path d="M14 3v4a1 1 0 0 0 1 1h4M5 20.25c0 .414.336.75.75.75H7a1 1 0 0 0 1-1v-1a1 1 0 0 0-1-1H6a1 1 0 0 1-1-1v-1a1 1 0 0 1 1-1h1.25a.75.75 0 0 1 .75.75"/><path d="M5 12V5a2 2 0 0 1 2-2h7l5 5v4m-1 3v6h2m-7-6a2 2 0 0 1 2 2v2a2 2 0 1 1-4 0v-2a2 2 0 0 1 2-2zm1 5l1.5 1.5"/></g>'
          }, {
            path: '/excel-to-json',
            title: 'Excel To JSON',
            icon: '<path fill="currentColor" d="M20 21H5q-.825 0-1.413-.588T3 19V5q0-.825.588-1.413T5 3h15q.825 0 1.413.588T22 5v14q0 .825-.588 1.413T20 21ZM5 8h15V5H5v3Zm3 2H5v9h3v-9Zm9 0v9h3v-9h-3Zm-2 0h-5v9h5v-9Z"/>',
          },
            {
              path: '/yaml-to-json',
              title: 'YAML to JSON',
              icon: '<path fill="currentColor" d="M12 .037C5.373.037 0 5.394 0 12s5.373 11.963 12 11.963c6.628 0 12-5.357 12-11.963S18.627.037 12 .037m-.541 4.8c1.91-.13 3.876.395 5.432 1.934c1.426 1.437 2.51 3.44 2.488 5.317h2.133l-4.444 4.963l-4.445-4.963h2.313c-.001-1.724-.427-2.742-1.78-4.076c-1.325-1.336-2.667-2.11-4.978-2.303a9.2 9.2 0 0 1 3.281-.871zM6.934 6.95l4.445 4.963H9.066c0 1.724.426 2.742 1.778 4.076c1.326 1.336 2.667 2.112 4.978 2.305c-2.684 1.268-6.22 1.398-8.71-1.064c-1.427-1.437-2.512-3.44-2.489-5.317H2.488z"/>',
            },
            {
              path: '/json-to-yaml',
              title: 'JSON To YAML',
              icon: '<path fill="currentColor" d="M12 .037C5.373.037 0 5.394 0 12s5.373 11.963 12 11.963c6.628 0 12-5.357 12-11.963S18.627.037 12 .037m-.541 4.8c1.91-.13 3.876.395 5.432 1.934c1.426 1.437 2.51 3.44 2.488 5.317h2.133l-4.444 4.963l-4.445-4.963h2.313c-.001-1.724-.427-2.742-1.78-4.076c-1.325-1.336-2.667-2.11-4.978-2.303a9.2 9.2 0 0 1 3.281-.871zM6.934 6.95l4.445 4.963H9.066c0 1.724.426 2.742 1.778 4.076c1.326 1.336 2.667 2.112 4.978 2.305c-2.684 1.268-6.22 1.398-8.71-1.064c-1.427-1.437-2.512-3.44-2.489-5.317H2.488z"/>',
            },
          ],
        },
        {
          label: 'General',
          tools: [
            {
              path: '/svg-to-css',
              title: 'SVG to CSS',
              icon: '<path fill="currentColor" d="M12 .037C5.373.037 0 5.394 0 12s5.373 11.963 12 11.963c6.628 0 12-5.357 12-11.963S18.627.037 12 .037m-.541 4.8c1.91-.13 3.876.395 5.432 1.934c1.426 1.437 2.51 3.44 2.488 5.317h2.133l-4.444 4.963l-4.445-4.963h2.313c-.001-1.724-.427-2.742-1.78-4.076c-1.325-1.336-2.667-2.11-4.978-2.303a9.2 9.2 0 0 1 3.281-.871zM6.934 6.95l4.445 4.963H9.066c0 1.724.426 2.742 1.778 4.076c1.326 1.336 2.667 2.112 4.978 2.305c-2.684 1.268-6.22 1.398-8.71-1.064c-1.427-1.437-2.512-3.44-2.489-5.317H2.488z"/>',
            },

            {
              path: '/corn-job-parser',
              title: 'Cron Job Parser',
              icon: '<path fill="currentColor" d="M10.021 1.021h6v2h-6zM20.04 7.41l1.434-1.434l-1.414-1.414l-1.433 1.433A8.99 8.99 0 0 0 7.53 5.881l1.42 1.44a7.04 7.04 0 0 1 4.06-1.3l.01.001v6.98l4.953 4.958A7.001 7.001 0 0 1 6.01 13.021h3l-4-4l-4 4h3A9 9 0 1 0 20.04 7.41"/>',
            },

            {
              path: '/css-beautify',
              title: 'CSS Beautify/Minify',
              icon: '<path fill="currentColor" fill-rule="evenodd" d="M14 4.5V14a2 2 0 0 1-2 2h-1v-1h1a1 1 0 0 0 1-1V4.5h-2A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v9H2V2a2 2 0 0 1 2-2h5.5zM3.397 14.841a1.13 1.13 0 0 0 .401.823q.195.162.478.252q.284.091.665.091q.507 0 .859-.158q.354-.158.539-.44q.187-.284.187-.656q0-.336-.134-.56a1 1 0 0 0-.375-.357a2 2 0 0 0-.566-.21l-.621-.144a1 1 0 0 1-.404-.176a.37.37 0 0 1-.144-.299q0-.234.185-.384q.188-.152.512-.152q.214 0 .37.068a.6.6 0 0 1 .246.181a.56.56 0 0 1 .12.258h.75a1.1 1.1 0 0 0-.2-.566a1.2 1.2 0 0 0-.5-.41a1.8 1.8 0 0 0-.78-.152q-.439 0-.776.15q-.337.149-.527.421q-.19.273-.19.639q0 .302.122.524q.124.223.352.367q.228.143.539.213l.618.144q.31.073.463.193a.39.39 0 0 1 .152.326a.5.5 0 0 1-.085.29a.56.56 0 0 1-.255.193q-.167.07-.413.07q-.175 0-.32-.04a.8.8 0 0 1-.248-.115a.58.58 0 0 1-.255-.384zM.806 13.693q0-.373.102-.633a.87.87 0 0 1 .302-.399a.8.8 0 0 1 .475-.137q.225 0 .398.097a.7.7 0 0 1 .272.26a.85.85 0 0 1 .12.381h.765v-.072a1.33 1.33 0 0 0-.466-.964a1.4 1.4 0 0 0-.489-.272a1.8 1.8 0 0 0-.606-.097q-.534 0-.911.223q-.375.222-.572.632q-.195.41-.196.979v.498q0 .568.193.976q.197.407.572.626q.375.217.914.217q.439 0 .785-.164t.55-.454a1.27 1.27 0 0 0 .226-.674v-.076h-.764a.8.8 0 0 1-.118.363a.7.7 0 0 1-.272.25a.9.9 0 0 1-.401.087a.85.85 0 0 1-.478-.132a.83.83 0 0 1-.299-.392a1.7 1.7 0 0 1-.102-.627zM6.78 15.29a1.2 1.2 0 0 1-.111-.449h.764a.58.58 0 0 0 .255.384q.106.073.25.114q.142.041.319.041q.245 0 .413-.07a.56.56 0 0 0 .255-.193a.5.5 0 0 0 .085-.29a.39.39 0 0 0-.153-.326q-.152-.12-.463-.193l-.618-.143a1.7 1.7 0 0 1-.539-.214a1 1 0 0 1-.351-.367a1.1 1.1 0 0 1-.123-.524q0-.366.19-.639q.19-.272.527-.422t.777-.149q.456 0 .779.152q.326.153.5.41q.18.255.2.566h-.75a.56.56 0 0 0-.12-.258a.6.6 0 0 0-.246-.181a.9.9 0 0 0-.37-.068q-.324 0-.512.152a.47.47 0 0 0-.184.384q0 .18.143.3a1 1 0 0 0 .404.175l.621.143q.326.075.566.211t.375.358t.135.56q0 .37-.188.656a1.2 1.2 0 0 1-.539.439q-.351.158-.858.158q-.381 0-.665-.09a1.4 1.4 0 0 1-.478-.252a1.1 1.1 0 0 1-.29-.375"/>',
            },

            {
              path: '/js-beautify',
              title: 'JS Beautify/Minify',
              icon: '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 256 256"><path fill="currentColor" d="m216.49 79.51l-56-56A12 12 0 0 0 152 20H56a20 20 0 0 0-20 20v68a12 12 0 0 0 24 0V44h76v48a12 12 0 0 0 12 12h48v108h-16a12 12 0 0 0 0 24h20a20 20 0 0 0 20-20V88a12 12 0 0 0-3.51-8.49M160 57l23 23h-23Zm-4.22 139.85a24.75 24.75 0 0 1-10.95 18.06c-6 4-13.27 5.15-19.73 5.15a63.8 63.8 0 0 1-16.23-2.21a12 12 0 0 1 6.46-23.12c6.81 1.86 15 1.61 16.39.06a2.5 2.5 0 0 0 .21-.71c-1.94-1.23-6.83-2.64-9.88-3.52c-5.39-1.56-11-3.18-15.75-6.27c-7.62-4.92-11.21-12.45-10.11-21.2a24.45 24.45 0 0 1 10.69-17.75c6.06-4.09 14.17-5.84 24.1-5.18A68.5 68.5 0 0 1 143 142a12 12 0 0 1-6.1 23.21c-6.36-1.63-13.62-1.51-16.07-.33a80 80 0 0 0 7.91 2.59c5.48 1.58 11.68 3.37 16.8 6.82c7.79 5.26 11.46 13.26 10.24 22.53ZM84 152v38a30 30 0 0 1-60 0a12 12 0 0 1 24 0a6 6 0 0 0 12 0v-38a12 12 0 0 1 24 0"/></svg>',
            }
          ],
        },
      ],
    }
  }
})
</script>
