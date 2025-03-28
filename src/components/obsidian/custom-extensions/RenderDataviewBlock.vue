<template>
  <node-view-wrapper class="dataview-wrapper">
    <div class="dataview-preview">
      <div class="dataview-header">
        <strong>Dataview Query</strong>
      </div>

      <!-- LIST view -->
      <div class="query-output list-result">
        <div
          v-for="(note, index) in mockResults"
          :key="index"
          class="note-link"
        >
          • <span class="note-title">{{ note.title }}</span>
        </div>
      </div>

      <node-view-content as="pre" class="content-container" />
    </div>
  </node-view-wrapper>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { NodeViewWrapper, NodeViewContent, NodeViewProps } from "@tiptap/vue-3";

// Props for the node view
const props = defineProps<NodeViewProps>();

// Create mock results
const mockResults = [
  { title: "Sample Note 1" },
  { title: "Sample Note 2" },
  { title: "Sample Note 3" },
];
</script>

<style scoped>
.dataview-wrapper {
  display: block;
  margin: 1rem 0;
}

.content-container {
  display: none; /* Hide the actual content, but keep it in the DOM for TipTap */
}

.dataview-preview {
  background-color: #e8f4f8;
  border-radius: 8px;
  padding: 12px;
  margin: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  font-family: -apple-system, BlinkMacSystemFont, sans-serif;
}

.dataview-header {
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #bbd8e8;
}

.query-output {
  padding: 8px;
  border-radius: 4px;
}

.note-link {
  padding: 4px 0;
}

.note-title {
  color: #1a66c2;
  text-decoration: underline;
  cursor: pointer;
}

/* Dark mode support */
:global(.dark-theme) .dataview-preview {
  background-color: #1e2a3a;
  color: #e0e0e0;
}

:global(.dark-theme) .dataview-header {
  border-bottom-color: #445566;
}

:global(.dark-theme) .note-title {
  color: #5a9ae6;
}
</style>
