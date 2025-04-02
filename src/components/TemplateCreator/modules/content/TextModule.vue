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
    @add-line="addContentLine"
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

      <!-- Text Paragraphs -->
      <div class="text-editor__paragraphs">
        <div 
          v-for="(line, idx) in module.content" 
          :key="idx"
          class="text-editor__paragraph"
        >
          <textarea
            class="text-editor__input"
            :value="line"
            @input="updateTextContent(idx, $event.target.value)"
            @focus="setEditing(true)"
            @blur="setEditing(false)"
            placeholder="Enter text..."
            rows="4"
            :ref="(el) => { if (idx === 0 && autoFocus) setInputRef(el); }"
          ></textarea>
          
          <div class="text-editor__paragraph-actions">
            <button 
              class="text-editor__move-btn"
              @click="moveParagraph(idx, 'up')"
              :disabled="idx === 0"
              title="Move up"
            >
              <i class="fas fa-arrow-up"></i>
            </button>
            
            <button 
              class="text-editor__move-btn"
              @click="moveParagraph(idx, 'down')"
              :disabled="idx === module.content.length - 1"
              title="Move down"
            >
              <i class="fas fa-arrow-down"></i>
            </button>
            
            <button
              v-if="module.content.length > 1"
              class="text-editor__delete-btn"
              title="Delete paragraph"
              @click.stop="deleteContentLine(idx)"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
      </div>
      
      <!-- Add Paragraph Button -->
      <div class="text-editor__add-section">
        <button class="text-editor__add-btn" @click="addContentLine">
          <i class="fas fa-plus"></i>
          <span>Add Paragraph</span>
        </button>
      </div>
    </div>
  </BaseModule>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import BaseModule from "@/components/TemplateCreator/modules/core/BaseModule.vue";
import { TemplateModule } from "@/types/TemplateModule";
import {
  addNewContentLine,
  deleteContentLine,
  updateContentLine,
} from "@/components/TemplateCreator/modules/core/moduleUtils";

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
    baseModuleRef.value?.displayToast(
      "Cannot delete the last paragraph",
      "error"
    );
    return;
  }

  const newContent = deleteContentLine(props.module.content, index);
  emit("update:content", newContent);
};

// Move paragraphs up or down
const moveParagraph = (index: number, direction: 'up' | 'down') => {
  if (direction === 'up' && index === 0) return;
  if (direction === 'down' && index === props.module.content.length - 1) return;
  
  const newContent = [...props.module.content];
  const targetIndex = direction === 'up' ? index - 1 : index + 1;
  
  // Swap items
  [newContent[index], newContent[targetIndex]] = [newContent[targetIndex], newContent[index]];
  
  emit("update:content", newContent);
};

// Initialize with default content if empty
onMounted(() => {
  if (props.module.content.length === 1 && props.module.content[0] === "") {
    emit("update:content", ["Add your text here..."]);
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

/* Paragraph container */
.text-editor__paragraphs {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.text-editor__paragraph {
  position: relative;
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

.text-editor__paragraph-actions {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 6px;
  background: rgba(30, 30, 46, 0.8);
  padding: 4px;
  border-radius: 6px;
  backdrop-filter: blur(4px);
  opacity: 0;
  transition: opacity 0.2s;
}

.text-editor__paragraph:hover .text-editor__paragraph-actions {
  opacity: 1;
}

.text-editor__move-btn,
.text-editor__delete-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border: none;
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.2s;
  font-size: 12px;
}

.text-editor__move-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--color-text);
}

.text-editor__move-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.text-editor__delete-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

/* Add button */
.text-editor__add-section {
  margin-top: 8px;
}

.text-editor__add-btn {
  width: 100%;
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: rgba(var(--color-primary-rgb), 0.1);
  border: 1px dashed rgba(var(--color-primary-rgb), 0.3);
  border-radius: 8px;
  color: var(--color-primary);
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.text-editor__add-btn:hover {
  background: rgba(var(--color-primary-rgb), 0.15);
  border-color: rgba(var(--color-primary-rgb), 0.4);
  transform: translateY(-2px);
}

/* Responsive styles */
@media (max-width: 768px) {
  .text-editor__paragraph-actions {
    position: static;
    margin-top: 8px;
    opacity: 1;
    background: transparent;
    padding: 0;
    backdrop-filter: none;
  }
}
</style>
