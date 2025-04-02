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
    <div class="header-editor">
      <!-- Module Header -->
      <div class="header-editor__header">
        <div class="header-editor__header-icon">
          <i class="fas fa-heading"></i>
        </div>
        <div class="header-editor__header-title">Headers</div>
      </div>

      <!-- Header Items -->
      <div class="header-editor__items">
        <div 
          v-for="(line, idx) in module.content" 
          :key="idx"
          class="header-editor__item"
        >
          <div class="header-editor__item-inputs">
            <select
              class="header-editor__level-select"
              :value="getHeaderLevel(line)"
              @input="updateHeaderLevel(idx, $event.target.value)"
              @focus="setEditing(true)"
              @blur="setEditing(false)"
              :ref="(el) => { if (idx === 0 && autoFocus) setInputRef(el); }"
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
              class="header-editor__text-input"
              :value="getHeaderText(line)"
              @input="updateHeaderText(idx, $event.target.value)"
              @focus="setEditing(true)"
              @blur="setEditing(false)"
              placeholder="Header text"
            />
          </div>
          
          <div class="header-editor__item-actions">
            <button 
              class="header-editor__move-btn"
              @click="moveHeader(idx, 'up')"
              :disabled="idx === 0"
              title="Move up"
            >
              <i class="fas fa-arrow-up"></i>
            </button>
            
            <button 
              class="header-editor__move-btn"
              @click="moveHeader(idx, 'down')"
              :disabled="idx === module.content.length - 1"
              title="Move down"
            >
              <i class="fas fa-arrow-down"></i>
            </button>
            
            <button
              v-if="module.content.length > 1"
              class="header-editor__delete-btn"
              title="Delete header"
              @click.stop="deleteContentLine(idx)"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
      </div>
      
      <!-- Add Header Button -->
      <div class="header-editor__add-section">
        <button class="header-editor__add-btn" @click="addContentLine">
          <i class="fas fa-plus"></i>
          <span>Add Header</span>
        </button>
      </div>
    </div>
  </BaseModule>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
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
  baseModuleRef.value?.displayToast("Header added", "success");
};

const deleteContentLine = (index: number) => {
  if (props.module.content.length <= 1) {
    baseModuleRef.value?.displayToast("Cannot delete the last header", "error");
    return;
  }
  
  const newContent = deleteContentLine(props.module.content, index);
  emit("update:content", newContent);
};

// Move headers up or down
const moveHeader = (index: number, direction: 'up' | 'down') => {
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
    emit("update:content", ["# New Header"]);
  }
});
</script>

<style scoped>
.header-editor {
  width: 100%;
  color: var(--color-text);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Header styles */
.header-editor__header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header-editor__header-icon {
  color: var(--color-primary);
  font-size: 18px;
}

.header-editor__header-title {
  font-size: 16px;
  font-weight: 500;
}

/* Header items */
.header-editor__items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.header-editor__item {
  display: flex;
  gap: 12px;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.header-editor__item:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.12);
}

.header-editor__item-inputs {
  display: flex;
  flex: 1;
  gap: 8px;
}

.header-editor__level-select {
  width: 70px;
  padding: 8px 10px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  color: var(--color-text);
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.header-editor__level-select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 1px rgba(var(--color-primary-rgb), 0.2);
  background: rgba(255, 255, 255, 0.08);
}

.header-editor__text-input {
  flex: 1;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  color: var(--color-text);
  font-size: 14px;
  transition: all 0.2s;
}

.header-editor__text-input:focus {
  outline: none;
  border-color: var(--color-primary);
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 0 1px rgba(var(--color-primary-rgb), 0.2);
}

.header-editor__item-actions {
  display: flex;
  gap: 6px;
}

.header-editor__move-btn,
.header-editor__delete-btn {
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

.header-editor__move-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--color-text);
}

.header-editor__move-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.header-editor__delete-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

/* Add button */
.header-editor__add-section {
  margin-top: 8px;
}

.header-editor__add-btn {
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

.header-editor__add-btn:hover {
  background: rgba(var(--color-primary-rgb), 0.15);
  border-color: rgba(var(--color-primary-rgb), 0.4);
  transform: translateY(-2px);
}

/* Responsive styles */
@media (max-width: 768px) {
  .header-editor__item {
    flex-direction: column;
  }
  
  .header-editor__item-actions {
    margin-top: 8px;
    justify-content: flex-end;
  }
}
</style>