<template>
  <div class="gradient-background">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
// No props or special logic needed for now
</script>

<style scoped>
.gradient-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E"),
    linear-gradient(135deg, var(--color-background-gradient-from, #1E1E2E) 0%, var(--color-background-gradient-to, #2D2B55) 100%);
  background-attachment: fixed;
  z-index: -1;
  transition: background 0.5s ease-in-out;
}
</style>