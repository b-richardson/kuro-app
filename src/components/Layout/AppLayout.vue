<template>
  <div class="app-layout">
    <!-- App Header -->
    <slot name="header"></slot>
    
    <!-- Main Content with Views -->
    <main class="main-content">
      <slot></slot>
    </main>
  </div>
</template>

<script setup lang="ts">
// Nothing needed in script section - all functionality is via slots
</script>

<style scoped>
.app-layout {
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  overflow: hidden;
  position: relative;
}
</style>