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
    <div class="text-editor">
      <!-- Module Header -->
      <div class="text-editor__header">
        <div class="text-editor__header-icon">
          <i class="fas fa-align-left"></i>
        </div>
        <div class="text-editor__header-title">Text</div>
      </div>

      <!-- Text Content -->
      <div class="text-editor__content">
        <textarea
          class="text-editor__input"
          :value="module.content[0]"
          @input="
            updateTextContent(($event.target as HTMLTextAreaElement).value)
          "
          @focus="setEditing(true)"
          @blur="setEditing(false)"
          placeholder="Enter text..."
          rows="4"
          ref="textInput"
        ></textarea>
      </div>
    </div>
  </BaseModule>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
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

// Reference to the base module component and text input
const baseModuleRef = ref<InstanceType<typeof BaseModule> | null>(null);
const textInput = ref<HTMLElement | null>(null);

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
const updateTextContent = (text: string) => {
  emit("update:content", [text]);
};

// Initialize with default content if empty
onMounted(() => {
  if (!props.module.content[0] || props.module.content[0] === "") {
    emit("update:content", ["Add your text here..."]);
  }

  if (props.autoFocus && textInput.value) {
    setInputRef(textInput.value);
  }
});
</script>

<style scoped>
.text-editor {
  width: 100%;
  color: var(--color-text);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Header styles */
.text-editor__header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.text-editor__header-icon {
  color: var(--color-primary);
  font-size: 18px;
}

.text-editor__header-title {
  font-size: 16px;
  font-weight: 500;
}

/* Text content */
.text-editor__content {
  width: 100%;
}

.text-editor__input {
  width: 100%;
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  color: var(--color-text);
  font-size: 14px;
  line-height: 1.5;
  resize: vertical;
  min-height: 100px;
  transition: all 0.2s;
}

.text-editor__input:focus {
  outline: none;
  border-color: var(--color-primary);
  background: rgba(255, 255, 255, 0.05);
  box-shadow: 0 0 0 1px rgba(var(--color-primary-rgb), 0.2);
}
</style>
