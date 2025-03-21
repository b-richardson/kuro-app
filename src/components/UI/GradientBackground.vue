<template>
  <div class="gradient-background">
    <div class="noise-overlay"></div>
  </div>
</template>

<script setup lang="ts">
import { inject } from 'vue';

// Get theme from parent component
const theme = inject('theme', 'dark');
</script>

<style scoped>
.gradient-background {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: -2;
  transition: background 0.5s ease-in-out;
}

.gradient-background {
  background: 
    linear-gradient(
      135deg,
      rgba(30, 30, 46, 0.92) 0%,
      rgba(33, 6, 60, 0.97) 100%
    ),
    url("https://images.unsplash.com/photo-1635776063043-ab23b4c226f6?q=80&w=2832&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")
    center/cover no-repeat;
  background-attachment: fixed;
}

.noise-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: -1;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
  opacity: 0.04;
}
</style>
