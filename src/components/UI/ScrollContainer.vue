<template>
  <div class="scroll-container">
    <slot></slot>
  </div>
</template>

<style scoped>
.scroll-container {
  height: 100vh; /* full viewport height */
  overflow-y: auto; /* vertical scrolling */
  -webkit-overflow-scrolling: touch; /* smoother scrolling on mobile */
  scroll-behavior: smooth; /* Enables smooth scrolling */
}
</style>
