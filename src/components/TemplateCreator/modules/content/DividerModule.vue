<template>
  <BaseModule
    :module="module"
    :index="index"
    :modules="modules"
    :isSelected="isSelected"
    :autoFocus="autoFocus"
    @update:content="updateContent"
    @update="$emit('update', $event)"
    @delete="$emit('delete')"
    @select="$emit('select')"
    @duplicate="$emit('duplicate')"
    @module-change="$emit('module-change')"
    @add-line="handleAddLine"
    ref="baseModuleRef"
  >
    <!-- Simple visual divider -->
    <div class="divider-visual">
      <i class="fas fa-minus divider-icon"></i>
      <hr class="divider-line" />
    </div>
  </BaseModule>
</template>

<script setup lang="ts">
import { ref } from "vue";
import BaseModule from "../core/BaseModule.vue";
import { TemplateModule } from "@/types/TemplateModule";

const props = defineProps<{
  module: TemplateModule;
  index: number;
  modules: TemplateModule[];
  isSelected?: boolean;
  autoFocus?: boolean;
}>();

const emit = defineEmits<{
  (e: "update:content", content: string[]): void;
  (e: "update", modules: TemplateModule[]): void;
  (e: "delete"): void;
  (e: "select"): void;
  (e: "duplicate"): void;
  (e: "module-change"): void;
}>();

// Reference to the base module component
const baseModuleRef = ref<InstanceType<typeof BaseModule> | null>(null);

// Ensure content is always "---"
const updateContent = (content: string[]) => {
  emit("update:content", ["---"]);
};

// No-op for add line - dividers should always be a single line
const handleAddLine = () => {
  // Do nothing - prevents adding additional lines
};
</script>

<style>
/* These styles are non-scoped to ensure they apply properly */
.template-module-editor--divider .template-module-editor-line {
  display: none !important;
}

.template-module-editor--divider .template-module-editor-action[title="Add line"] {
  display: none !important;
}
</style>

<style scoped>
.divider-visual {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 0;
}

.divider-icon {
  position: absolute;
  color: var(--color-text-muted);
  background-color: rgba(30, 30, 46, 0.9);
  padding: 4px;
  border-radius: 50%;
  font-size: 0.75rem;
  z-index: 1;
}

.divider-line {
  width: 100%;
  border: none;
  height: 1px;
  background-color: var(--color-surface);
  margin: 0;
}

:deep(.template-module-editor--selected) .divider-line {
  background-color: var(--color-primary);
  height: 2px;
}

:deep(.template-module-editor--selected) .divider-icon {
  color: var(--color-primary);
}
</style>