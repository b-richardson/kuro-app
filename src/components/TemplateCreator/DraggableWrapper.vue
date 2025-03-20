<template>
  <component :is="draggableComponent" v-bind="$attrs">
    <slot></slot>
  </component>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { VueDraggableNext } from "vue-draggable-next";

// Try to use VueDraggableNext first, then fallback to a direct import
// This lets us proceed even if there are issues with specific draggable implementation
const draggableComponent = ref<any>(null);

onMounted(() => {
  try {
    // First try VueDraggableNext
    draggableComponent.value = VueDraggableNext;
  } catch (e) {
    console.warn("VueDraggableNext failed to load, trying direct access:", e);
    try {
      // Fallback to global variable if available (set by the script import)
      if (typeof draggable !== 'undefined') {
        draggableComponent.value = draggable;
      } else {
        console.error("Both VueDraggableNext and global draggable are unavailable");
        // Provide a simple div as last resort
        draggableComponent.value = 'div';
      }
    } catch (e2) {
      console.error("Failed to get draggable component:", e2);
      // Provide a simple div as last resort
      draggableComponent.value = 'div';
    }
  }
});
</script>