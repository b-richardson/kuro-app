<template>
  <component :is="draggableComponent" v-bind="$attrs">
    <slot></slot>
  </component>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VueDraggableNext } from "vue-draggable-next";

// Use a simple direct import as fallback - this lets us proceed even if there are
// import issues with specific draggable implementation
const draggableComponent = ref(draggable);
</script>
