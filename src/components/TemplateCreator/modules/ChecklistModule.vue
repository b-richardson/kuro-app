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
        <div class="template-module-editor-checkbox">
          <input
            type="checkbox"
            :checked="isCheckboxChecked(line)"
            @change="toggleCheckbox(index)"
            @focus="setEditing(true)"
            @blur="setEditing(false)"
          />
        </div>
        <input
          type="text"
          class="template-module-editor-input"
          :value="getChecklistText(line)"
          @input="updateChecklistText(index, $event.target.value)"
          @focus="setEditing(true)"
          @blur="setEditing(false)"
          placeholder="Checklist item"
          :ref="(el) => { if (index === 0 && autoFocus) setInputRef(el); }"
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

// Checklist-specific methods
const isCheckboxChecked = (line: string): boolean => {
  return line.includes("- [x]");
};

const getChecklistText = (line: string): string => {
  return line.replace(/^- \[([ x])\]\s/, "");
};

const toggleCheckbox = (index: number) => {
  const text = getChecklistText(props.module.content[index]);
  const isChecked = isCheckboxChecked(props.module.content[index]);
  const newLine = isChecked ? `- [ ] ${text}` : `- [x] ${text}`;
  const newContent = updateContentLine(props.module.content, index, newLine);
  emit("update:content", newContent);
};

const updateChecklistText = (index: number, text: string) => {
  const isChecked = isCheckboxChecked(props.module.content[index]);
  const prefix = isChecked ? "- [x] " : "- [ ] ";
  const newLine = prefix + text;
  const newContent = updateContentLine(props.module.content, index, newLine);
  emit("update:content", newContent);
};

// Content line management
const addContentLine = () => {
  const newContent = addNewContentLine(props.module.content, "checklist");
  emit("update:content", newContent);
  
  // Show success toast
  baseModuleRef.value?.displayToast("Item added", "success");
};

const deleteContentLine = (index: number) => {
  if (props.module.content.length <= 1) {
    baseModuleRef.value?.displayToast("Cannot delete the last item", "error");
    return;
  }
  
  const newContent = deleteContentLine(props.module.content, index);
  emit("update:content", newContent);
  
  // Show info toast
  baseModuleRef.value?.displayToast("Item deleted", "info");
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

.template-module-editor-checkbox {
  display: flex;
  align-items: center;
  justify-content: center;
}

.template-module-editor-checkbox input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: var(--color-primary);
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