<template>
  <main class="nf">
    <img src="/icons/app-icon.svg" alt="" width="72" height="72" />
    <h1 class="t-large-title">Page not found</h1>
    <p class="t-body t-secondary">That tool may have moved. Every tool is listed on the home page.</p>
    <router-link to="/" class="btn btn--prominent">Show All Tools</router-link>
  </main>
</template>

<style scoped>
.nf {
  min-height: 100dvh; display: grid; place-content: center; justify-items: center; gap: 12px;
  padding: 24px; text-align: center;
}
.nf h1, .nf p { margin: 0; }
.nf img { border-radius: 16px; margin-bottom: 8px; }
.nf .btn { margin-top: 12px; text-decoration: none; }
</style>
