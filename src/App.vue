<template>
  <div class="app">
    <TemplateCreatorView />
  </div>
</template>

<script setup lang="ts">
import TemplateCreatorView from './components/TemplateCreator/TemplateCreatorView.vue';
</script>

<style>
:root {
  --primary-color: #4f46e5;
  --secondary-color: #6366f1;
  --text-color: #334155;
  --light-bg: #f8fafc;
  --border-color: #e2e8f0;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  color: var(--text-color);
  line-height: 1.5;
  background-color: #f5f7ff;
  height: 100vh;
  overflow: hidden;
}

.app {
  height: 100vh;
  width: 100vw;
}

/* Add support for glassmorphism in more browsers */
@supports (-webkit-backdrop-filter: blur(10px)) or (backdrop-filter: blur(10px)) {
  .glassmorphism {
    background-color: rgba(255, 255, 255, 0.7);
    -webkit-backdrop-filter: blur(10px);
    backdrop-filter: blur(10px);
  }
}
</style>
