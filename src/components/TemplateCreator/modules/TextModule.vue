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
    @add-line="addContentLine"
    ref="baseModuleRef"
  >
    <div
      v-for="(line, index) in module.content"
      :key="index"
      class="template-module-editor-line"
    >
      <div class="template-module-editor-input-group">
        <textarea
          class="template-module-editor-textarea"
          :value="line"
          @input="updateTextContent(index, $event.target.value)"
          @focus="setEditing(true)"
          @blur="setEditing(false)"
          placeholder="Enter text..."
          rows="4"
          :ref="(el) => { if (index === 0 && autoFocus) setInputRef(el); }"
        ></textarea>
        <button
          v-if="module.content.length > 1"
          class="template-module-editor-line-action"
          title="Delete line"
          @click.stop="deleteContentLine(index)"
        >
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>
  </BaseModule>
</template>

<script setup lang="ts">
import { ref } from "vue";
import BaseModule from "./BaseModule.vue";
import { TemplateModule } from "@/types/TemplateModule";
import { addNewContentLine, deleteContentLine, updateContentLine } from "./utils/moduleUtils";

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

// Helper methods for editing
const setEditing = (editing: boolean) => {
  baseModuleRef.value?.setEditing(editing);
};

const setInputRef = (el: HTMLElement) => {
  baseModuleRef.value?.setInputRef(el);
};

// Update content in parent component
const updateContent = (content: string[]) => {
  emit("update:content", content);
};

// Text-specific methods
const updateTextContent = (index: number, text: string) => {
  const newContent = updateContentLine(props.module.content, index, text);
  emit("update:content", newContent);
};

// Content line management
const addContentLine = () => {
  const newContent = addNewContentLine(props.module.content, "text");
  emit("update:content", newContent);
  
  // Show success toast
  baseModuleRef.value?.displayToast("Paragraph added", "success");
};

const deleteContentLine = (index: number) => {
  if (props.module.content.length <= 1) {
    baseModuleRef.value?.displayToast("Cannot delete the last paragraph", "error");
    return;
  }
  
  const newContent = deleteContentLine(props.module.content, index);
  emit("update:content", newContent);
  
  // Show info toast
  baseModuleRef.value?.displayToast("Paragraph deleted", "info");
};
</script>

<style scoped>
.template-module-editor-line {
  margin-bottom: var(--spacing-md);
}

.template-module-editor-input-group {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-sm);
}

.template-module-editor-textarea {
  flex: 1;
  padding: var(--spacing-sm);
  border: 1px solid var(--color-surface);
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  min-height: 100px;
  resize: vertical;
  width: 100%;
  background-color: rgba(255, 255, 255, 0.05);
  color: var(--color-text);
  transition: all 0.2s;
  line-height: 1.5;
}

.template-module-editor-textarea:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(255, 171, 88, 0.2);
}

.template-module-editor-line-action {
  background: none;
  border: none;
  cursor: pointer;
  width: 30px;
  height: 30px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  transition: all 0.2s;
  opacity: 0.7;
}

.template-module-editor-line-action:hover {
  background-color: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  opacity: 1;
}
</style>