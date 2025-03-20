<template>
  <div class="app-container">
    <TemplateCreatorView />
  </div>
</template>

<script setup lang="ts">
import TemplateCreatorView from './components/TemplateCreator/TemplateCreatorView.vue';
</script>

<style scoped>
.app-container {
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #f5f7ff 0%, #f0f4ff 100%);
}
</style>
