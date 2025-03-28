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
        <select
          class="template-module-editor-select"
          :value="getHeaderLevel(line)"
          @input="updateHeaderLevel(index, $event.target.value)"
          @focus="setEditing(true)"
          @blur="setEditing(false)"
          :ref="(el) => { if (index === 0 && autoFocus) setInputRef(el); }"
        >
          <option value="1">H1</option>
          <option value="2">H2</option>
          <option value="3">H3</option>
          <option value="4">H4</option>
          <option value="5">H5</option>
          <option value="6">H6</option>
        </select>
        <input
          type="text"
          class="template-module-editor-input"
          :value="getHeaderText(line)"
          @input="updateHeaderText(index, $event.target.value)"
          @focus="setEditing(true)"
          @blur="setEditing(false)"
          placeholder="Header text"
        />
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
import BaseModule from "@/components/TemplateCreator/modules/core/BaseModule.vue";
import { TemplateModule } from "@/types/TemplateModule";
import { addNewContentLine, deleteContentLine, updateContentLine } from "@/components/TemplateCreator/modules/core/moduleUtils";

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

// Header-specific methods
const getHeaderLevel = (line: string): string => {
  const match = line.match(/^(#+)\s/);
  return match ? match[1].length.toString() : "1";
};

const getHeaderText = (line: string): string => {
  return line.replace(/^#+\s/, "");
};

const updateHeaderLevel = (index: number, level: string) => {
  const headerText = getHeaderText(props.module.content[index]);
  const newHeader = "#".repeat(parseInt(level)) + " " + headerText;
  const newContent = updateContentLine(props.module.content, index, newHeader);
  emit("update:content", newContent);
};

const updateHeaderText = (index: number, text: string) => {
  const level = getHeaderLevel(props.module.content[index]);
  const newHeader = "#".repeat(parseInt(level)) + " " + text;
  const newContent = updateContentLine(props.module.content, index, newHeader);
  emit("update:content", newContent);
};

// Content line management
const addContentLine = () => {
  const newContent = addNewContentLine(props.module.content, "header");
  emit("update:content", newContent);
  
  // Show success toast
  baseModuleRef.value?.displayToast("Line added", "success");
};

const deleteContentLine = (index: number) => {
  if (props.module.content.length <= 1) {
    baseModuleRef.value?.displayToast("Cannot delete the last line", "error");
    return;
  }
  
  const newContent = deleteContentLine(props.module.content, index);
  emit("update:content", newContent);
  
  // Show info toast
  baseModuleRef.value?.displayToast("Line deleted", "info");
};
</script>

<style scoped>
.template-module-editor-line {
  margin-bottom: var(--spacing-md);
}

.template-module-editor-input-group {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.template-module-editor-select {
  width: 80px;
  padding: var(--spacing-xs) var(--spacing-sm);
  border: 1px solid var(--color-surface);
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  background-color: rgba(255, 255, 255, 0.05);
  color: var(--color-text);
  transition: all 0.2s;
}

.template-module-editor-select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(255, 171, 88, 0.2);
}

.template-module-editor-input {
  flex: 1;
  padding: var(--spacing-xs) var(--spacing-sm);
  border: 1px solid var(--color-surface);
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  background-color: rgba(255, 255, 255, 0.05);
  color: var(--color-text);
  transition: all 0.2s;
}

.template-module-editor-input:focus {
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