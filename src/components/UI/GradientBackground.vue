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
    /* Top layer: optional noise overlay */ url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E")
      repeat,
    /* Middle layer: optional gradient overlay */
      /* linear-gradient(
        135deg,
        var(--color-background-gradient-from, #1e1e2e) 0%,
        var(--color-background-gradient-to, #2d2b55) 100%
      ), */
      /* Bottom layer: main background image */
      url("https://images.unsplash.com/photo-1557682250-33bd709cbe85?q=80&w=2858&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")
      center/cover no-repeat;
  background-attachment: fixed;
  z-index: -1;
  transition: background 0.5s ease-in-out;
}
</style>
