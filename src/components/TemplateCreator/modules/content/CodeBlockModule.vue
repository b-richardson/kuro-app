<template>
  <BaseModule
    :module="module"
    :index="index"
    :modules="modules"
    :isSelected="isSelected"
    :autoFocus="autoFocus"
    @update:content="updateContent"
    @update="$emit('update', $event as any)"
    @delete="$emit('delete')"
    @select="$emit('select')"
    @duplicate="$emit('duplicate')"
    @module-change="$emit('module-change')"
    ref="baseModuleRef"
  >
    <div class="code-editor">
      <!-- Module Header -->
      <div class="code-editor__header">
        <div class="code-editor__header-icon">
          <i class="fas fa-code"></i>
        </div>
        <div class="code-editor__header-title">Code Block</div>
      </div>

      <!-- Code Content -->
      <div class="code-editor__content">
        <textarea
          class="code-editor__input"
          v-model="innerCode"
          @focus="setEditing(true)"
          @blur="setEditing(false)"
          placeholder="Enter code here"
          rows="8"
          ref="codeInput"
          spellcheck="false"
        ></textarea>
      </div>
    </div>
  </BaseModule>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import BaseModule from "@/components/TemplateCreator/modules/core/BaseModule.vue";
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

// Module state
const baseModuleRef = ref<InstanceType<typeof BaseModule> | null>(null);
const codeInput = ref<HTMLElement | null>(null);
const innerCode = ref("");

// Helper methods
const setEditing = (editing: boolean) => {
  baseModuleRef.value?.setEditing(editing);
};

// Update content in parent component
const updateContent = (content: string[]) => {
  emit("update:content", content);
};

// Watch for code changes and update parent
watch(innerCode, (newCode) => {
  // No formatting at all, just the raw code
  emit("update:content", [newCode]);

  // For debugging
  console.log("Raw output (no formatting):", newCode);
});
</script>

<style scoped>
.code-editor {
  width: 100%;
  color: var(--color-text);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Header styles */
.code-editor__header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.code-editor__header-icon {
  color: var(--color-primary);
  font-size: 18px;
}

.code-editor__header-title {
  font-size: 16px;
  font-weight: 500;
}

/* Code content */
.code-editor__content {
  width: 100%;
}

.code-editor__input {
  width: 100%;
  padding: 12px;
  background: rgba(30, 30, 46, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  color: var(--color-text);
  font-family: "Fira Code", monospace, "Courier New", Courier;
  font-size: 14px;
  line-height: 1.5;
  resize: vertical;
  min-height: 150px;
  tab-size: 2;
  transition: all 0.2s;
  white-space: pre;
}

.code-editor__input:focus {
  outline: none;
  border-color: var(--color-primary);
  background: rgba(30, 30, 46, 0.95);
  box-shadow: 0 0 0 1px rgba(var(--color-primary-rgb), 0.2);
}
</style>
